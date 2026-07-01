import uuid
import calendar
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.services.budget.models import Budget, BudgetCreate, BudgetRead, BudgetProgress
from app.services.budget.constant import BUDGET_NOT_FOUND, BUDGET_ACCESS_DENIED, BUDGET_EXPENSE_ONLY, INVALID_AMOUNT
from app.services.category.models import Category, CategoryRead
from app.services.category.constant import CATEGORY_NOT_FOUND, CATEGORY_ACCESS_DENIED
from app.services.transaction.models import Transaction

class BudgetService:
    @staticmethod
    def get_budgets_progress(session: Session, user_id: str, month: int, year: int) -> List[BudgetProgress]:
        # 1. Lấy tất cả danh mục EXPENSE của user
        categories_stmt = select(Category).where(
            Category.user_id == user_id,
            Category.type == "EXPENSE"
        )
        categories = session.exec(categories_stmt).all()
        
        # 2. Lấy tất cả ngân sách đã thiết lập trong tháng/năm
        budgets_stmt = select(Budget).where(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year
        )
        budgets = session.exec(budgets_stmt).all()
        budgets_map = {b.category_id: b for b in budgets}
        
        # 3. Tính chi tiêu thực tế của các danh mục trong tháng/năm đó
        _, num_days = calendar.monthrange(year, month)
        start_date = datetime(year, month, 1, 0, 0, 0)
        end_date = datetime(year, month, num_days, 23, 59, 59)
        
        tx_stmt = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.type == "EXPENSE",
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
        transactions = session.exec(tx_stmt).all()
        
        spent_map = {}
        for tx in transactions:
            spent_map[tx.category_id] = spent_map.get(tx.category_id, 0.0) + tx.amount
            
        # 4. Trả về tiến trình ngân sách
        result = []
        for cat in categories:
            budget = budgets_map.get(cat.id)
            limit_amount = budget.amount if budget else 0.0
            spent_amount = spent_map.get(cat.id, 0.0)
            
            progress = BudgetProgress(
                id=budget.id if budget else None,
                category_id=cat.id,
                category_name=cat.name,
                category_color=cat.color,
                category_icon=cat.icon,
                limit_amount=limit_amount,
                spent_amount=spent_amount,
                month=month,
                year=year
            )
            result.append(progress)
            
        return result

    @staticmethod
    def set_budget(session: Session, budget_in: BudgetCreate, user_id: str) -> BudgetRead:
        if budget_in.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=INVALID_AMOUNT
            )

        category = session.get(Category, budget_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=CATEGORY_NOT_FOUND
            )
            
        if category.type != "EXPENSE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=BUDGET_EXPENSE_ONLY
            )
            
        if category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=CATEGORY_ACCESS_DENIED
            )

        # Tìm ngân sách đã tồn tại
        statement = select(Budget).where(
            Budget.user_id == user_id,
            Budget.category_id == budget_in.category_id,
            Budget.month == budget_in.month,
            Budget.year == budget_in.year
        )
        existing_budget = session.exec(statement).first()
        
        if existing_budget:
            existing_budget.amount = budget_in.amount
            session.add(existing_budget)
            session.commit()
            session.refresh(existing_budget)
            budget_db = existing_budget
        else:
            budget_db = Budget(
                id=str(uuid.uuid4()),
                amount=budget_in.amount,
                month=budget_in.month,
                year=budget_in.year,
                user_id=user_id,
                category_id=budget_in.category_id,
                created_at=datetime.utcnow()
            )
            session.add(budget_db)
            session.commit()
            session.refresh(budget_db)
            
        return BudgetRead(
            id=budget_db.id,
            amount=budget_db.amount,
            month=budget_db.month,
            year=budget_db.year,
            category_id=budget_db.category_id,
            category=CategoryRead.model_validate(category),
            created_at=budget_db.created_at
        )

    @staticmethod
    def delete_budget(session: Session, budget_id: str, user_id: str) -> dict:
        budget_db = session.get(Budget, budget_id)
        if not budget_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=BUDGET_NOT_FOUND
            )
            
        if budget_db.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=BUDGET_ACCESS_DENIED
            )
            
        session.delete(budget_db)
        session.commit()
        return {"message": "Xóa ngân sách thành công"}
