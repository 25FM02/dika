from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel

class Budget(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    amount: float
    month: int  # 1 - 12
    year: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: str = Field(foreign_key="user.id")
    category_id: str = Field(foreign_key="category.id")

    # Relationships
    user: "User" = Relationship(back_populates="budgets")
    category: "Category" = Relationship(back_populates="budgets")

class BudgetCreate(SQLModel):
    amount: float
    month: int
    year: int
    category_id: str

# Tránh circular import
from app.services.category.models import CategoryRead

class BudgetRead(SQLModel):
    id: str
    amount: float
    month: int
    year: int
    category_id: str
    category: Optional[CategoryRead] = None
    created_at: datetime

class BudgetProgress(SQLModel):
    id: Optional[str] = None
    category_id: str
    category_name: str
    category_color: str
    category_icon: str
    limit_amount: float
    spent_amount: float
    month: int
    year: int

# Tránh circular import
from app.services.auth.models import User
from app.services.category.models import Category
