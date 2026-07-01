import api from '../api';
import type { 
  SavingsGoal, 
  SavingsGoalCreate, 
  SavingsGoalUpdate, 
  SavingsTransactionRequest 
} from './types';

export const SavingsService = {
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const response = await api.get<SavingsGoal[]>('/savings');
    return response.data;
  },

  async createSavingsGoal(payload: SavingsGoalCreate): Promise<SavingsGoal> {
    const response = await api.post<SavingsGoal>('/savings', payload);
    return response.data;
  },

  async updateSavingsGoal(goalId: string, payload: SavingsGoalUpdate): Promise<SavingsGoal> {
    const response = await api.put<SavingsGoal>(`/savings/${goalId}`, payload);
    return response.data;
  },

  async deleteSavingsGoal(goalId: string): Promise<void> {
    await api.delete(`/savings/${goalId}`);
  },

  async depositToGoal(goalId: string, amount: number): Promise<SavingsGoal> {
    const payload: SavingsTransactionRequest = { amount };
    const response = await api.post<SavingsGoal>(`/savings/${goalId}/deposit`, payload);
    return response.data;
  },

  async withdrawFromGoal(goalId: string, amount: number): Promise<SavingsGoal> {
    const payload: SavingsTransactionRequest = { amount };
    const response = await api.post<SavingsGoal>(`/savings/${goalId}/withdraw`, payload);
    return response.data;
  },
};
