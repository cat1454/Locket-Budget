import type { Category, ExpenseCategoryId } from '../types/domain';

export const categories: Category[] = [
  {
    id: 'food',
    label: 'An uong',
    shortLabel: 'Food',
    color: '#F4BA78',
    coverColors: ['#F8D6A9', '#F4BA78'],
  },
  {
    id: 'shopping',
    label: 'Mua sam',
    shortLabel: 'Shop',
    color: '#E08C7A',
    coverColors: ['#F6CEC3', '#E08C7A'],
  },
  {
    id: 'transport',
    label: 'Di lai',
    shortLabel: 'Ride',
    color: '#7AA6D9',
    coverColors: ['#B8D2F0', '#7AA6D9'],
  },
  {
    id: 'entertainment',
    label: 'Giai tri',
    shortLabel: 'Fun',
    color: '#7CB8A5',
    coverColors: ['#CBE8E0', '#7CB8A5'],
  },
  {
    id: 'education',
    label: 'Hoc tap',
    shortLabel: 'Study',
    color: '#9AB67B',
    coverColors: ['#D7E4BC', '#9AB67B'],
  },
  {
    id: 'other',
    label: 'Khac',
    shortLabel: 'Other',
    color: '#B89E87',
    coverColors: ['#DFD2C5', '#B89E87'],
  },
];

export const categoryById = categories.reduce<Record<ExpenseCategoryId, Category>>(
  (result, category) => {
    result[category.id] = category;
    return result;
  },
  {} as Record<ExpenseCategoryId, Category>,
);
