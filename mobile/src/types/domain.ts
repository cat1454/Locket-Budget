export type ExpenseCategoryId =
  | 'food'
  | 'shopping'
  | 'transport'
  | 'entertainment'
  | 'education'
  | 'other';

export interface User {
  id: string;
  displayName: string;
  email: string;
  joinedAt: string;
  avatarGradient: [string, string];
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface Category {
  id: ExpenseCategoryId;
  label: string;
  shortLabel: string;
  color: string;
  coverColors: [string, string];
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: ExpenseCategoryId;
  amount: number;
  note: string;
  imageUri: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDraft {
  categoryId: ExpenseCategoryId;
  amount: number;
  note: string;
  imageUri: string;
  occurredAt: string;
}

export interface AppPreferences {
  androidFrontCameraMirrorFixEnabled: boolean;
}

export interface CategorySummary {
  categoryId: ExpenseCategoryId;
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface PeriodTotals {
  day: number;
  week: number;
  month: number;
  entriesToday: number;
}

export interface FoundationDecision {
  label: string;
  value: string;
  note: string;
}
