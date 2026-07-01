import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.auth.models import User, UserCreate, UserLogin
from app.services.auth.constant import EMAIL_ALREADY_EXISTS, INCORRECT_EMAIL_PASSWORD
from app.services.category.models import Category

# Các danh mục mặc định cho tài khoản mới
DEFAULT_CATEGORIES = [
    {"name": "Ăn uống", "type": "EXPENSE", "icon": "utensils", "color": "#FF6B6B"},
    {"name": "Di chuyển", "type": "EXPENSE", "icon": "car", "color": "#4DABF7"},
    {"name": "Mua sắm", "type": "EXPENSE", "icon": "shopping-bag", "color": "#FCC419"},
    {"name": "Nhà cửa", "type": "EXPENSE", "icon": "home", "color": "#FF922B"},
    {"name": "Giải trí", "type": "EXPENSE", "icon": "film", "color": "#B197FC"},
    {"name": "Lương", "type": "INCOME", "icon": "wallet", "color": "#2B8A3E"},
    {"name": "Thưởng", "type": "INCOME", "icon": "gift", "color": "#12B886"},
    {"name": "Đầu tư", "type": "INCOME", "icon": "trending-up", "color": "#0C8599"},
]

class AuthService:
    @staticmethod
    def register(session: Session, user_in: UserCreate) -> User:
        # Kiểm tra trùng email
        statement = select(User).where(User.email == user_in.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=EMAIL_ALREADY_EXISTS
            )

        # Tạo user mới
        user_db = User(
            id=str(uuid.uuid4()),
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            created_at=datetime.utcnow()
        )
        session.add(user_db)

        # Khởi tạo danh mục mặc định
        for cat in DEFAULT_CATEGORIES:
            category_db = Category(
                id=str(uuid.uuid4()),
                name=cat["name"],
                type=cat["type"],
                icon=cat["icon"],
                color=cat["color"],
                user_id=user_db.id,
                created_at=datetime.utcnow()
            )
            session.add(category_db)

        session.commit()
        session.refresh(user_db)
        return user_db

    @staticmethod
    def login(session: Session, login_in: UserLogin) -> dict:
        statement = select(User).where(User.email == login_in.email)
        user = session.exec(statement).first()
        if not user or not verify_password(login_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=INCORRECT_EMAIL_PASSWORD
            )

        access_token = create_access_token(subject=user.id)
        return {"access_token": access_token, "token_type": "bearer"}
