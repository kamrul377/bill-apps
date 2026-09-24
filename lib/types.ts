export type UserRole = 'admin' | 'support' | 'manager' | 'accounts';

export type BillStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';

export interface User {
  id: number;
  user_id: string;
  name: string;
  password?: string;
  role: UserRole;
  created_at: string;
}

export interface Bill {
  id: number;
  ticket_id: string;
  user_id: string;
  amount: number;
  description: string;
  date: string;
  status: BillStatus;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  created_by?: string;
  paid_by?: string;
  paid_at?: string;
  payment_method?: string;
  payment_note?: string;
}

export interface DashboardStats {
  totalBills: number;
  pendingBills: number;
  approvedBills: number;
  rejectedBills: number;
  paidBills: number;
  totalVolumeTk: number;
  pendingVolumeTk: number;
  approvedVolumeTk: number;
  rejectedVolumeTk: number;
  paidVolumeTk: number;
}
