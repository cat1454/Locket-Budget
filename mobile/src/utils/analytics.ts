import { categoryById, categories } from '../data/categories';
import type { CategorySummary, Expense, PeriodTotals } from '../types/domain';

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function sortExpensesByDate(expenses: Expense[]) {
  return [...expenses].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

export function getPeriodTotals(expenses: Expense[]): PeriodTotals {
  const now = new Date();
  const weekStart = getWeekStart(now);

  return expenses.reduce(
    (result, expense) => {
      const occurredAt = new Date(expense.occurredAt);

      if (isSameDay(occurredAt, now)) {
        result.day += expense.amount;
        result.entriesToday += 1;
      }

      if (occurredAt >= weekStart && occurredAt <= now) {
        result.week += expense.amount;
      }

      if (isSameMonth(occurredAt, now)) {
        result.month += expense.amount;
      }

      return result;
    },
    { day: 0, week: 0, month: 0, entriesToday: 0 },
  );
}

export function getCategorySummaries(expenses: Expense[]): CategorySummary[] {
  return categories
    .map((category) => {
      const relatedExpenses = expenses.filter((expense) => expense.categoryId === category.id);

      return {
        categoryId: category.id,
        label: category.label,
        amount: relatedExpenses.reduce((total, expense) => total + expense.amount, 0),
        count: relatedExpenses.length,
        color: category.color,
      };
    })
    .filter((summary) => summary.count > 0)
    .sort((left, right) => right.amount - left.amount);
}

export function getPeakWindowLabel(expenses: Expense[]) {
  if (expenses.length === 0) {
    return 'Chua du du lieu de phan tich.';
  }

  const buckets = expenses.reduce<Record<string, number>>((result, expense) => {
    const hour = new Date(expense.occurredAt).getHours();
    const label = `${hour.toString().padStart(2, '0')}:00`;

    result[label] = (result[label] ?? 0) + 1;
    return result;
  }, {});

  const topBucket = Object.entries(buckets).sort((left, right) => right[1] - left[1])[0];

  if (!topBucket) {
    return 'Chua du du lieu de phan tich.';
  }

  return `${topBucket[0]} - ${topBucket[1]} khoan chi`;
}

export function getHeroSummary(expenses: Expense[]) {
  if (expenses.length === 0) {
    return 'Bat dau luu khoan chi dau tien de mo photo timeline.';
  }

  const topCategory = getCategorySummaries(expenses)[0];

  if (!topCategory) {
    return 'Ban da co du lieu, hay xem lai timeline de theo doi thoi quen chi tieu.';
  }

  return `Danh muc chi nhieu nhat hien tai la ${topCategory.label.toLowerCase()}.`;
}

export function getRecentExpenses(expenses: Expense[], limit = 3) {
  return sortExpensesByDate(expenses).slice(0, limit);
}

export function getExpenseFallbackColors(expense: Expense) {
  return categoryById[expense.categoryId].coverColors;
}
