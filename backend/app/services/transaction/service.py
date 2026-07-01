import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select, and_, desc

from app.services.transaction.models import Transaction, TransactionCreate, TransactionRead
from app.services.transaction.constant import TRANSACTION_NOT_FOUND, TRANSACTION_ACCESS_DENIED
from app.services.category.models import Category, CategoryRead
from app.services.category.constant import CATEGORY_NOT_FOUND, CATEGORY_ACCESS_DENIED

class TransactionService:
    @staticmethod
    def get_transactions(
        session: Session,
        user_id: str,
        type: Optional[str] = None,
        category_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[TransactionRead]:
        statement = select(Transaction).where(Transaction.user_id == user_id)
        
        filters = []
        if type:
            filters.append(Transaction.type == type)
        if category_id:
            filters.append(Transaction.category_id == category_id)
        if start_date:
            filters.append(Transaction.date >= start_date)
        if end_date:
            filters.append(Transaction.date <= end_date)
            
        if filters:
            statement = statement.where(and_(*filters))
            
        statement = statement.order_by(desc(Transaction.date), desc(Transaction.created_at)).offset(offset).limit(limit)
        transactions = session.exec(statement).all()
        
        result = []
        for tx in transactions:
            category = session.get(Category, tx.category_id)
            tx_read = TransactionRead(
                id=tx.id,
                amount=tx.amount,
                type=tx.type,
                description=tx.description,
                date=tx.date,
                category_id=tx.category_id,
                category=CategoryRead.model_validate(category) if category else None,
                created_at=tx.created_at
            )
            result.append(tx_read)
            
        return result

    @staticmethod
    def create_transaction(session: Session, tx_in: TransactionCreate, user_id: str) -> TransactionRead:
        category = session.get(Category, tx_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=CATEGORY_NOT_FOUND
            )
        
        if category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=CATEGORY_ACCESS_DENIED
            )

        tx_db = Transaction(
            id=str(uuid.uuid4()),
            amount=tx_in.amount,
            type=tx_in.type,
            description=tx_in.description,
            date=tx_in.date if tx_in.date else datetime.utcnow(),
            user_id=user_id,
            category_id=tx_in.category_id,
            created_at=datetime.utcnow()
        )
        session.add(tx_db)
        session.commit()
        session.refresh(tx_db)
        
        return TransactionRead(
            id=tx_db.id,
            amount=tx_db.amount,
            type=tx_db.type,
            description=tx_db.description,
            date=tx_db.date,
            category_id=tx_db.category_id,
            category=CategoryRead.model_validate(category),
            created_at=tx_db.created_at
        )

    @staticmethod
    def update_transaction(session: Session, transaction_id: str, tx_in: TransactionCreate, user_id: str) -> TransactionRead:
        tx_db = session.get(Transaction, transaction_id)
        if not tx_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=TRANSACTION_NOT_FOUND
            )
            
        if tx_db.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=TRANSACTION_ACCESS_DENIED
            )
            
        category = session.get(Category, tx_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=CATEGORY_NOT_FOUND
            )
            
        if category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=CATEGORY_ACCESS_DENIED
            )

        tx_db.amount = tx_in.amount
        tx_db.type = tx_in.type
        tx_db.description = tx_in.description
        tx_db.date = tx_in.date
        tx_db.category_id = tx_in.category_id
        
        session.add(tx_db)
        session.commit()
        session.refresh(tx_db)
        
        return TransactionRead(
            id=tx_db.id,
            amount=tx_db.amount,
            type=tx_db.type,
            description=tx_db.description,
            date=tx_db.date,
            category_id=tx_db.category_id,
            category=CategoryRead.model_validate(category),
            created_at=tx_db.created_at
        )

    @staticmethod
    def delete_transaction(session: Session, transaction_id: str, user_id: str) -> dict:
        tx_db = session.get(Transaction, transaction_id)
        if not tx_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=TRANSACTION_NOT_FOUND
            )
            
        if tx_db.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=TRANSACTION_ACCESS_DENIED
            )
            
        session.delete(tx_db)
        session.commit()
        return {"message": "Xóa giao dịch thành công"}
