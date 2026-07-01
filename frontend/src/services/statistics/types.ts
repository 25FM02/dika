export interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
  month: number;
  year: number;
}

export interface CategoryDist {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month_label: string;
  month: number;
  year: number;
  income: number;
  expense: number;
}
