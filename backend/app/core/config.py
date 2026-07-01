import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Money Manager API"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./money_manager.db")
    
    # Security
    # Lưu ý: Trong môi trường thực tế, nên dùng secret ngẫu nhiên bảo mật cao từ env
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-money-manager-2026-deepmind-agentic-coding")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 ngày để test thoải mái

    class Config:
        case_sensitive = True

settings = Settings()
