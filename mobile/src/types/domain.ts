export type ExpenseCategoryId =
  | 'food'
  | 'shopping'
  | 'transport'
  | 'entertainment'
  | 'education'
  | 'other';

export type ExpenseMoodId = 'happy' | 'calm' | 'neutral' | 'stressed' | 'sad';

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

export interface MoodOption {
  id: ExpenseMoodId;
  label: string;
  shortLabel: string;
  color: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: ExpenseCategoryId;
  moodId: ExpenseMoodId | null;
  amount: number;
  note: string;
  imageUri: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDraft {
  categoryId: ExpenseCategoryId;
  moodId: ExpenseMoodId | null;
  amount: number;
  note: string;
  imageUri: string;
  occurredAt: string;
}

export interface AppPreferences {
  androidFrontCameraMirrorFixEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  dailyReminderNotificationId: string | null;
}

export interface CategorySummary {
  categoryId: ExpenseCategoryId;
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface MoodSummary {
  moodId: ExpenseMoodId;
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
