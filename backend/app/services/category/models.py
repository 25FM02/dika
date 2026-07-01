from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel

class Category(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    name: str
    type: str  # "INCOME" hoặc "EXPENSE"
    icon: str  # Tên icon từ Lucide (ví dụ: "utensils")
    color: str # Mã màu HEX
    user_id: Optional[str] = Field(default=None, foreign_key="user.id", nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="categories")
    transactions: List["Transaction"] = Relationship(back_populates="category")
    budgets: List["Budget"] = Relationship(back_populates="category")

class CategoryCreate(SQLModel):
    name: str
    type: str
    icon: str
    color: str

class CategoryRead(SQLModel):
    id: str
    name: str
    type: str
    icon: str
    color: str
    user_id: Optional[str] = None
    created_at: datetime

# Tránh circular import
from app.services.auth.models import User
from app.services.transaction.models import Transaction
from app.services.budget.models import Budget
