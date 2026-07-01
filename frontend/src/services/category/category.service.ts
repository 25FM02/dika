import api from '../api';
import type { Category, CategoryCreate } from './types';

export const CategoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async createCategory(payload: CategoryCreate): Promise<Category> {
    const response = await api.post<Category>('/categories', payload);
    return response.data;
  },

  async updateCategory(id: string, payload: CategoryCreate): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};
