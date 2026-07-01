from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel

class SavingsGoal(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    target_amount: float
    current_amount: float = Field(default=0.0)
    target_date: datetime
    status: str = Field(default="ACTIVE") # "ACTIVE", "COMPLETED"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Quan hệ với User
    user_id: str = Field(foreign_key="user.id", ondelete="CASCADE")
    user: "User" = Relationship(back_populates="savings_goals")

# Schemas
class SavingsGoalCreate(SQLModel):
    name: str
    target_amount: float
    target_date: datetime

class SavingsGoalUpdate(SQLModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None

class SavingsGoalResponse(SQLModel):
    id: str
    name: str
    target_amount: float
    current_amount: float
    target_date: datetime
    status: str
    created_at: datetime
    user_id: str

class SavingsTransactionRequest(SQLModel):
    amount: float
