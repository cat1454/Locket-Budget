import type { ExpenseMoodId, MoodOption } from '../types/domain';

export const moods: MoodOption[] = [
  {
    id: 'happy',
    label: 'Happy',
    shortLabel: 'Happy',
    color: '#F6B117',
  },
  {
    id: 'calm',
    label: 'Calm',
    shortLabel: 'Calm',
    color: '#7CB8A5',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    shortLabel: 'Neutral',
    color: '#B89E87',
  },
  {
    id: 'stressed',
    label: 'Stressed',
    shortLabel: 'Stress',
    color: '#E08C7A',
  },
  {
    id: 'sad',
    label: 'Sad',
    shortLabel: 'Sad',
    color: '#7AA6D9',
  },
];

export const moodById = moods.reduce<Record<ExpenseMoodId, MoodOption>>((result, mood) => {
  result[mood.id] = mood;
  return result;
}, {} as Record<ExpenseMoodId, MoodOption>);
