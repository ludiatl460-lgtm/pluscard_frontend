// types/Dashboard.ts

export type ReconcileStatus =
  | "MATCHED"
  | "AMOUNT_MISMATCH"
  | "PARTIAL_MATCH"
  | "ONLY_IN_FRONTEND"
  | "ONLY_IN_BACKEND";

export type Gender = "MALE" | "FEMALE";

export interface DashboardCards {
  resultCount: number;
  userCount: number;
  resultOlderThanThreeMonth: number;
  resultToday: number;
}

export type StatusCounts = Record<ReconcileStatus, number>;

export interface StatusChartItem {
  status: ReconcileStatus;
  count: number;
}

export interface LatestResult {
  id: string;
  name: string;
  lastname: string;
  gender: Gender;
  contact: string;
  email: string;
  createdAt: string; 
}

export interface DashboardReport {
  cards: DashboardCards;
  statusCounts: StatusCounts;
  statusChart: StatusChartItem[];
  latestResults: LatestResult[];
}
