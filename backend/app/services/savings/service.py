import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select, and_

from app.services.savings.models import SavingsGoal, SavingsGoalCreate, SavingsGoalUpdate
from app.services.savings import constant
from app.services.transaction.models import Transaction
from app.services.category.models import Category

class SavingsService:
    @staticmethod
    def get_goals(session: Session, user_id: str) -> List[SavingsGoal]:
        statement = select(SavingsGoal).where(SavingsGoal.user_id == user_id)
        return session.exec(statement).all()

    @staticmethod
    def get_goal_by_id(session: Session, goal_id: str, user_id: str) -> SavingsGoal:
        goal = session.get(SavingsGoal, goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=constant.GOAL_NOT_FOUND
            )
        if goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=constant.GOAL_ACCESS_DENIED
            )
        return goal

    @staticmethod
    def create_goal(session: Session, payload: SavingsGoalCreate, user_id: str) -> SavingsGoal:
        if payload.target_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=constant.INVALID_TARGET_AMOUNT
            )
        
        # Hỗ trợ timezone nếu date là chuỗi hoặc datetime
        now = datetime.utcnow()
        # Chuyển đổi target_date từ datetime sang dạng offset-naive nếu có timezone
        target_date = payload.target_date.replace(tzinfo=None)
        if target_date <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=constant.INVALID_TARGET_DATE
            )

        goal = SavingsGoal(
            id=str(uuid.uuid4()),
            name=payload.name,
            target_amount=payload.target_amount,
            target_date=target_date,
            user_id=user_id
        )
        session.add(goal)
        session.commit()
        session.refresh(goal)
        return goal

    @staticmethod
    def update_goal(session: Session, goal_id: str, payload: SavingsGoalUpdate, user_id: str) -> SavingsGoal:
        goal = SavingsService.get_goal_by_id(session, goal_id, user_id)
        
        if payload.name is not None:
            goal.name = payload.name
        if payload.target_amount is not None:
            if payload.target_amount <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=constant.INVALID_TARGET_AMOUNT
                )
            goal.target_amount = payload.target_amount
        if payload.target_date is not None:
            target_date = payload.target_date.replace(tzinfo=None)
            if target_date <= datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=constant.INVALID_TARGET_DATE
                )
            goal.target_date = target_date
        if payload.status is not None:
            goal.status = payload.status

        session.add(goal)
        session.commit()
        session.refresh(goal)
        return goal

    @staticmethod
    def delete_goal(session: Session, goal_id: str, user_id: str) -> None:
        goal = SavingsService.get_goal_by_id(session, goal_id, user_id)
        session.delete(goal)
        session.commit()

    @staticmethod
    def _get_or_create_special_category(session: Session, user_id: str, cat_type: str, name: str, icon: str, color: str) -> Category:
        statement = select(Category).where(
            and_(
                Category.user_id == user_id,
                Category.type == cat_type,
                Category.name == name
            )
        )
        cat = session.exec(statement).first()
        if not cat:
            cat = Category(
                id=str(uuid.uuid4()),
                name=name,
                type=cat_type,
                icon=icon,
                color=color,
                user_id=user_id
            )
            session.add(cat)
            session.commit()
            session.refresh(cat)
        return cat

    @staticmethod
    def _get_wallet_balance(session: Session, user_id: str) -> float:
        # Tính số dư ví chính = Tổng thu - Tổng chi
        tx_statement = select(Transaction).where(Transaction.user_id == user_id)
        tx_list = session.exec(tx_statement).all()
        
        total_income = sum(t.amount for t in tx_list if t.type == "INCOME")
        total_expense = sum(t.amount for t in tx_list if t.type == "EXPENSE")
        return total_income - total_expense

    @staticmethod
    def deposit_to_goal(session: Session, goal_id: str, amount: float, user_id: str) -> SavingsGoal:
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=constant.INVALID_TRANSACTION_AMOUNT
            )
        
        goal = SavingsService.get_goal_by_id(session, goal_id, user_id)
        
        # 1. Kiểm tra số dư ví chính
        balance = SavingsService._get_wallet_balance(session, user_id)
        if balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=constant.INSUFFICIENT_FUNDS
            )

        # 2. Cộng vào mục tiêu tiết kiệm
        goal.current_amount += amount
        if goal.current_amount >= goal.target_amount:
            goal.status = "COMPLETED"
        else:
            goal.status = "ACTIVE"
        session.add(goal)

        # 3. Tạo Category tiết kiệm đặc biệt (EXPENSE) nếu chưa có
        cat = SavingsService._get_or_create_special_category(
            session, 
            user_id, 
            cat_type="EXPENSE", 
            name="Tích lũy tiết kiệm", 
            icon="wallet", 
            color="#6366f1" # Indigo
        )

        # 4. Tự động tạo giao dịch chi tiêu để trừ tiền ví chính
        tx = Transaction(
            id=str(uuid.uuid4()),
            amount=amount,
            type="EXPENSE",
            description=f"Tích lũy vào mục tiêu: {goal.name}",
            date=datetime.utcnow(),
            category_id=cat.id,
            user_id=user_id
        )
        session.add(tx)
        session.commit()
        session.refresh(goal)
        return goal

    @staticmethod
    def withdraw_from_goal(session: Session, goal_id: str, amount: float, user_id: str) -> SavingsGoal:
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=constant.INVALID_TRANSACTION_AMOUNT
            )
        
        goal = SavingsService.get_goal_by_id(session, goal_id, user_id)
        
        # 1. Kiểm tra số dư trong mục tiêu tiết kiệm
        if goal.current_amount < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=constant.EXCEEDS_SAVINGS
            )

        # 2. Trừ tiền khỏi mục tiêu tiết kiệm
        goal.current_amount -= amount
        if goal.current_amount < goal.target_amount:
            goal.status = "ACTIVE"
        session.add(goal)

        # 3. Tạo Category tiết kiệm đặc biệt (INCOME) nếu chưa có
        cat = SavingsService._get_or_create_special_category(
            session, 
            user_id, 
            cat_type="INCOME", 
            name="Rút tiền tiết kiệm", 
            icon="arrow-down-left", 
            color="#06b6d4" # Cyan
        )

        # 4. Tự động tạo giao dịch thu nhập để cộng tiền ví chính
        tx = Transaction(
            id=str(uuid.uuid4()),
            amount=amount,
            type="INCOME",
            description=f"Rút tiền từ mục tiêu: {goal.name}",
            date=datetime.utcnow(),
            category_id=cat.id,
            user_id=user_id
        )
        session.add(tx)
        session.commit()
        session.refresh(goal)
        return goal
