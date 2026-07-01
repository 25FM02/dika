from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_user
from app.services.auth.models import User
from app.services.category.models import CategoryRead, CategoryCreate
from app.services.category.service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryRead])
def get_categories(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return CategoryService.get_categories(session, current_user.id)

@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return CategoryService.create_category(session, category_in, current_user.id)

@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: str,
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return CategoryService.update_category(session, category_id, category_in, current_user.id)

@router.delete("/{category_id}")
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return CategoryService.delete_category(session, category_id, current_user.id)
