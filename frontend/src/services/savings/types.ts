export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'ACTIVE' | 'COMPLETED';
  created_at: string;
  user_id: string;
}

export interface SavingsGoalCreate {
  name: string;
  target_amount: number;
  target_date: string;
}

export interface SavingsGoalUpdate {
  name?: string;
  target_amount?: number;
  target_date?: string;
  status?: 'ACTIVE' | 'COMPLETED';
}

export interface SavingsTransactionRequest {
  amount: number;
}
