from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Cấu hình cho SQLite (cần connect_args), các database khác như PostgreSQL không cần
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url, connect_args=connect_args, echo=False)

def create_db_and_tables():
    # Import các models của từng Service để SQLAlchemy nhận dạng bảng
    from app.services.auth.models import User
    from app.services.category.models import Category
    from app.services.transaction.models import Transaction
    from app.services.budget.models import Budget
    from app.services.savings.models import SavingsGoal
    
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
