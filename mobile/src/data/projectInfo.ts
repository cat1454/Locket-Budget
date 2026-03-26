import type { FoundationDecision } from '../types/domain';

export const foundationDecisions: FoundationDecision[] = [
  {
    label: 'Stack',
    value: 'Expo + React Native + TypeScript',
    note: 'Phu hop cho camera, image picker, reminder va widget trong cac phase sau.',
  },
  {
    label: 'Repo layout',
    value: 'Docs o root, app o /mobile',
    note: 'Giu repo sach va tach ro tai lieu voi source code.',
  },
  {
    label: 'Navigation',
    value: 'Auth stack + tabs + modal screen',
    note: 'Khong can dap lai flow khi di tu Phase 0 sang Phase 1.',
  },
  {
    label: 'State strategy',
    value: 'Local-first voi AsyncStorage',
    note: 'Phu hop cho MVP demo, sau do co the thay bang backend thuc te.',
  },
];

export const phaseZeroOutputs = [
  'Theme mau va component shell cho mobile-first UI.',
  'Navigation khung gom welcome, login/register, dashboard, timeline, stats, profile.',
  'Domain model va category mac dinh da duoc chot.',
  'Add expense va expense detail da co route san sang cho MVP.',
];

export const phaseOnePriority = [
  'Auth local + session persistence.',
  'Luu expense that va cap nhat timeline theo du lieu that.',
  'Them chuc nang sua va xoa tu expense detail.',
  'Noi image picker de co khoan chi gan voi anh.',
];
