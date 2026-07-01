import calendar
from datetime import datetime
from typing import List, Dict, Any
from sqlmodel import Session, select, and_

from app.services.transaction.models import Transaction
from app.services.category.models import Category

class StatisticsService:
    @staticmethod
    def get_month_range(year: int, month: int):
        _, num_days = calendar.monthrange(year, month)
        start_date = datetime(year, month, 1, 0, 0, 0)
        end_date = datetime(year, month, num_days, 23, 59, 59)
        return start_date, end_date

    @classmethod
    def get_summary(cls, session: Session, user_id: str, month: int, year: int) -> dict:
        start_date, end_date = cls.get_month_range(year, month)
        
        statement = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
        transactions = session.exec(statement).all()
        
        total_income = sum(tx.amount for tx in transactions if tx.type == "INCOME")
        total_expense = sum(tx.amount for tx in transactions if tx.type == "EXPENSE")
        balance = total_income - total_expense
        
        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "month": month,
            "year": year
        }

    @classmethod
    def get_category_distribution(cls, session: Session, user_id: str, type: str, month: int, year: int) -> List[dict]:
        start_date, end_date = cls.get_month_range(year, month)
        
        statement = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.type == type,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
        transactions = session.exec(statement).all()
        
        total_amount = sum(tx.amount for tx in transactions)
        
        cat_totals = {}
        for tx in transactions:
            cat_totals[tx.category_id] = cat_totals.get(tx.category_id, 0.0) + tx.amount
            
        result = []
        for cat_id, amount in cat_totals.items():
            category = session.get(Category, cat_id)
            if category:
                percentage = (amount / total_amount * 100) if total_amount > 0 else 0
                result.append({
                    "category_id": cat_id,
                    "category_name": category.name,
                    "category_color": category.color,
                    "category_icon": category.icon,
                    "amount": amount,
                    "percentage": round(percentage, 2)
                })
                
        result.sort(key=lambda x: x["amount"], reverse=True)
        return result

    @classmethod
    def get_monthly_trend(cls, session: Session, user_id: str, limit_months: int = 6) -> List[dict]:
        now = datetime.utcnow()
        current_year = now.year
        current_month = now.month
        
        trend_data = []
        months_list = []
        y, m = current_year, current_month
        for _ in range(limit_months):
            months_list.append((y, m))
            m -= 1
            if m == 0:
                m = 12
                y -= 1
                
        months_list.reverse()
        
        for y, m in months_list:
            start_date, end_date = cls.get_month_range(y, m)
            statement = select(Transaction).where(
                Transaction.user_id == user_id,
                Transaction.date >= start_date,
                Transaction.date <= end_date
            )
            transactions = session.exec(statement).all()
            
            income = sum(tx.amount for tx in transactions if tx.type == "INCOME")
            expense = sum(tx.amount for tx in transactions if tx.type == "EXPENSE")
            
            month_label = f"T{m}/{str(y)[2:]}"
            
            trend_data.append({
                "month_label": month_label,
                "month": m,
                "year": y,
                "income": income,
                "expense": expense
            })
            
        return trend_data
