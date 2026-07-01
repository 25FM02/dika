export interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  user_id?: string | null;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  type: string;
  icon: string;
  color: string;
}
