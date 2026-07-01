import uuid
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.services.category.models import Category, CategoryCreate
from app.services.category.constant import CATEGORY_ALREADY_EXISTS, CATEGORY_NOT_FOUND, CATEGORY_ACCESS_DENIED
from app.services.transaction.models import Transaction

class CategoryService:
    @staticmethod
    def get_categories(session: Session, user_id: str) -> List[Category]:
        statement = select(Category).where(Category.user_id == user_id)
        return session.exec(statement).all()

    @staticmethod
    def create_category(session: Session, category_in: CategoryCreate, user_id: str) -> Category:
        # Kiểm tra trùng tên và loại
        statement = select(Category).where(
            Category.name == category_in.name,
            Category.type == category_in.type,
            Category.user_id == user_id
        )
        existing = session.exec(statement).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=CATEGORY_ALREADY_EXISTS.format(name=category_in.name, type=category_in.type)
            )

        category_db = Category(
            id=str(uuid.uuid4()),
            name=category_in.name,
            type=category_in.type,
            icon=category_in.icon,
            color=category_in.color,
            user_id=user_id,
            created_at=datetime.utcnow()
        )
        session.add(category_db)
        session.commit()
        session.refresh(category_db)
        return category_db

    @staticmethod
    def update_category(session: Session, category_id: str, category_in: CategoryCreate, user_id: str) -> Category:
        category_db = session.get(Category, category_id)
        if not category_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=CATEGORY_NOT_FOUND
            )
        
        if category_db.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=CATEGORY_ACCESS_DENIED
            )

        # Kiểm tra trùng tên nếu thay đổi
        if category_db.name != category_in.name or category_db.type != category_in.type:
            statement = select(Category).where(
                Category.name == category_in.name,
                Category.type == category_in.type,
                Category.user_id == user_id,
                Category.id != category_id
            )
            existing = session.exec(statement).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=CATEGORY_ALREADY_EXISTS.format(name=category_in.name, type=category_in.type)
                )

        category_db.name = category_in.name
        category_db.type = category_in.type
        category_db.icon = category_in.icon
        category_db.color = category_in.color
        
        session.add(category_db)
        session.commit()
        session.refresh(category_db)
        return category_db

    @staticmethod
    def delete_category(session: Session, category_id: str, user_id: str) -> dict:
        category_db = session.get(Category, category_id)
        if not category_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=CATEGORY_NOT_FOUND
            )
            
        if category_db.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=CATEGORY_ACCESS_DENIED
            )

        # Xóa các giao dịch liên quan để đảm bảo tính toàn vẹn SQLite
        transactions_statement = select(Transaction).where(Transaction.category_id == category_id)
        related_transactions = session.exec(transactions_statement).all()
        for tx in related_transactions:
            session.delete(tx)

        session.delete(category_db)
        session.commit()
        return {"message": "Xóa danh mục thành công"}
