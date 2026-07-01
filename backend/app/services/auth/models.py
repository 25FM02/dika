from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr

class User(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    # Lưu ý: Category, Transaction, Budget sẽ được lazy load thông qua relationship string
    categories: List["Category"] = Relationship(back_populates="user", cascade_delete=True)
    transactions: List["Transaction"] = Relationship(back_populates="user", cascade_delete=True)
    budgets: List["Budget"] = Relationship(back_populates="user", cascade_delete=True)

class UserCreate(SQLModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(SQLModel):
    email: EmailStr
    password: str

class UserRead(SQLModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    user_id: Optional[str] = None

# Để tránh lỗi circular import khi load relationship của SQLModel,
# ta import các class khác ở cuối file hoặc định nghĩa relationship bằng string type annotation.
# SQLModel nhận diện các class Category, Transaction, Budget thông qua registry toàn cục.
from app.services.category.models import Category
from app.services.transaction.models import Transaction
from app.services.budget.models import Budget
