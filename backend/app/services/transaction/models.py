from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel

class Transaction(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    amount: float
    type: str  # "INCOME" hoặc "EXPENSE"
    description: Optional[str] = Field(default=None)
    date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: str = Field(foreign_key="user.id")
    category_id: str = Field(foreign_key="category.id")

    # Relationships
    user: "User" = Relationship(back_populates="transactions")
    category: "Category" = Relationship(back_populates="transactions")

class TransactionCreate(SQLModel):
    amount: float
    type: str
    description: Optional[str] = None
    date: datetime
    category_id: str

# Tránh circular import
from app.services.category.models import CategoryRead

class TransactionRead(SQLModel):
    id: str
    amount: float
    type: str
    description: Optional[str] = None
    date: datetime
    category_id: str
    category: Optional[CategoryRead] = None
    created_at: datetime

# Tránh circular import
from app.services.auth.models import User
from app.services.category.models import Category
