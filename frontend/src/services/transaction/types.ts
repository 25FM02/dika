import type { Category } from '../category/types';

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  category_id: string;
  category: Category | null;
  created_at: string;
}

export interface TransactionCreate {
  amount: number;
  type: string;
  description?: string;
  date: string;
  category_id: string;
}

export interface TransactionFilters {
  type?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
