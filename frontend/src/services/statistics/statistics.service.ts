import api from '../api';
import { Summary, CategoryDist, MonthlyTrend } from './types';

export const StatisticsService = {
  async getSummary(month: number, year: number): Promise<Summary> {
    const response = await api.get<Summary>('/statistics/summary', { 
      params: { month, year } 
    });
    return response.data;
  },

  async getCategoryDistribution(month: number, year: number, type: string = 'EXPENSE'): Promise<CategoryDist[]> {
    const response = await api.get<CategoryDist[]>('/statistics/category-distribution', { 
      params: { month, year, type } 
    });
    return response.data;
  },

  async getMonthlyTrend(limitMonths: number = 6): Promise<MonthlyTrend[]> {
    const response = await api.get<MonthlyTrend[]>('/statistics/monthly-trend', { 
      params: { limit_months: limitMonths } 
    });
    return response.data;
  }
};
