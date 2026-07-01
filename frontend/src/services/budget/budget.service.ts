import api from '../api';
import type { Budget, BudgetCreate, BudgetProgress } from './types';

export const BudgetService = {
  async getBudgetsProgress(month: number, year: number): Promise<BudgetProgress[]> {
    const response = await api.get<BudgetProgress[]>('/budgets', { 
      params: { month, year } 
    });
    return response.data;
  },

  async setBudget(payload: BudgetCreate): Promise<Budget> {
    const response = await api.post<Budget>('/budgets', payload);
    return response.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  }
};
