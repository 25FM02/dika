from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_session
from app.core.security import get_current_user
from app.services.auth.models import User, UserCreate, UserRead, Token, UserLogin
from app.services.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    return AuthService.register(session, user_in)

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, session: Session = Depends(get_session)):
    return AuthService.login(session, user_in)

# Swagger OAuth2 password login endpoint
@router.post("/login/swagger", response_model=Token, include_in_schema=False)
def login_swagger(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # Đổi dữ liệu form sang schema UserLogin
    login_in = UserLogin(email=form_data.username, password=form_data.password)
    return AuthService.login(session, login_in)

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
