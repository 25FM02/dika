import api from '../api';
import { Transaction, TransactionCreate, TransactionFilters } from './types';

export const TransactionService = {
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions', { 
      params: filters 
    });
    return response.data;
  },

  async createTransaction(payload: TransactionCreate): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', payload);
    return response.data;
  },

  async updateTransaction(id: string, payload: TransactionCreate): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, payload);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }
};
