export type NotificationSeverity = "overdue" | "due_today" | "upcoming";
export type NotificationDirection = "receivable" | "payable";

export interface DebtNotificationItem {
  entryId: string;
  contactId: string;
  contactName: string;
  contactPhone: string | null;
  direction: NotificationDirection;
  severity: NotificationSeverity;
  daysDiff: number;
  entryAmount: number;
  contactNetBalance: number;
  dueDate: string;
  note: string | null;
}

export interface NotificationsSummary {
  items: DebtNotificationItem[];
  currency: string;
  totalCount: number;
  urgentCount: number;
}

export interface NotificationActionResult {
  success: boolean;
  error?: string;
}
