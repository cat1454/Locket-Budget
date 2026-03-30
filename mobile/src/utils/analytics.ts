import { categoryById, categories } from '../data/categories';
import { moodById, moods } from '../data/moods';
import type { CategorySummary, Expense, MoodSummary, PeriodTotals } from '../types/domain';
import { formatCurrencyVnd, formatShortTime } from './format';

export interface MoodInsight {
  title: string;
  body: string;
  color: string;
}

export interface TodayRecap {
  title: string;
  body: string;
  badge: string;
}

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

export function getMoodSummaries(expenses: Expense[]): MoodSummary[] {
  return moods
    .map((mood) => {
      const relatedExpenses = expenses.filter((expense) => expense.moodId === mood.id);

      return {
        moodId: mood.id,
        label: mood.label,
        amount: relatedExpenses.reduce((total, expense) => total + expense.amount, 0),
        count: relatedExpenses.length,
        color: mood.color,
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

export function getTopMoodInsight(expenses: Expense[]): MoodInsight {
  const moodSummaries = getMoodSummaries(expenses);

  if (moodSummaries.length === 0) {
    return {
      title: 'Mood insights start here',
      body: 'Add a mood when you save an expense to see which feeling drives the most spending.',
      color: moodById.neutral.color,
    };
  }

  const topMood = moodSummaries[0];
  const relatedExpenses = expenses.filter((expense) => expense.moodId === topMood.moodId);
  const relatedCategories = getCategorySummaries(relatedExpenses);
  const averageSpend = Math.round(topMood.amount / topMood.count);
  const categoryLine = relatedCategories[0]
    ? ` ${relatedCategories[0].label} is the biggest category in this mood.`
    : '';

  return {
    title: `${topMood.label} spending stands out`,
    body: `${topMood.count} entries totaled ${formatCurrencyVnd(topMood.amount)}. Average spend is ${formatCurrencyVnd(averageSpend)}.${categoryLine}`,
    color: topMood.color,
  };
}

export function getRecentExpenses(expenses: Expense[], limit = 3) {
  return sortExpensesByDate(expenses).slice(0, limit);
}

export function getExpenseFallbackColors(expense: Expense) {
  return categoryById[expense.categoryId].coverColors;
}

export function getTodayRecap(expenses: Expense[]): TodayRecap {
  const now = new Date();
  const todayExpenses = sortExpensesByDate(
    expenses.filter((expense) => isSameDay(new Date(expense.occurredAt), now)),
  );

  if (todayExpenses.length === 0) {
    return {
      title: 'No spend saved yet',
      body: 'Capture the first spending moment today so your recap starts building.',
      badge: 'Ready for the first log',
    };
  }

  const topCategory = getCategorySummaries(todayExpenses)[0];
  const lastExpense = todayExpenses[0];

  if (!topCategory || !lastExpense) {
    return {
      title: `${todayExpenses.length} moments saved`,
      body: `You have already logged ${todayExpenses.length} spending moments today.`,
      badge: `${todayExpenses.length} logs today`,
    };
  }

  return {
    title: `${topCategory.label} leads today`,
    body: `${formatCurrencyVnd(topCategory.amount)} across ${topCategory.count} entries. Last capture ${formatShortTime(lastExpense.occurredAt)}.`,
    badge: `${todayExpenses.length} ${todayExpenses.length === 1 ? 'log' : 'logs'} today`,
  };
}
