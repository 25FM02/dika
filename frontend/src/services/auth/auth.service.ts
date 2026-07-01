import api from '../api';
import { User, Token } from './types';

export const AuthService = {
  async login(email: string, password: string): Promise<Token> {
    const response = await api.post<Token>('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await api.post<User>('/auth/register', { 
      email, 
      password, 
      full_name: fullName 
    });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};
