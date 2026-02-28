export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_completed: boolean;
  created_at: string;
}

export type FilterStatus = 'all' | 'pending' | 'completed';
