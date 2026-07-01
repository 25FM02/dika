import { Category } from '../category/types';

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  category_id: string;
  category: Category | null;
  created_at: string;
}

export interface BudgetCreate {
  amount: number;
  month: number;
  year: number;
  category_id: string;
}

export interface BudgetProgress {
  id: string | null;
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  limit_amount: number;
  spent_amount: number;
  month: number;
  year: number;
}
