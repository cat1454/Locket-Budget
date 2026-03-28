import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { categories } from '../data/categories';
import type { AppPreferences, Expense, ExpenseDraft, StoredUser, User } from '../types/domain';
import { sortExpensesByDate } from '../utils/analytics';
import { createId } from '../utils/id';

const STORAGE_KEY = 'locket_budget_store_v1';
const defaultPreferences: AppPreferences = {
  androidFrontCameraMirrorFixEnabled: false,
};

const avatarGradients: Array<[string, string]> = [
  ['#F4BA78', '#EF7D57'],
  ['#7AA6D9', '#4D7FC3'],
  ['#7CB8A5', '#4E8F70'],
  ['#E08C7A', '#C45B47'],
  ['#9AB67B', '#6F8D55'],
];

interface PersistedStore {
  users: StoredUser[];
  expenses: Expense[];
  sessionUserId: string | null;
  preferences: AppPreferences;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface ExpenseActionResult extends ActionResult {
  expense?: Expense;
}

interface SessionContextValue {
  isHydrating: boolean;
  isAuthenticated: boolean;
  user: User | null;
  expenses: Expense[];
  preferences: AppPreferences;
  signIn: (email: string, password: string) => Promise<ActionResult>;
  register: (displayName: string, email: string, password: string) => Promise<ActionResult>;
  signOut: () => Promise<void>;
  addExpense: (draft: ExpenseDraft) => Promise<ExpenseActionResult>;
  updateExpense: (expenseId: string, draft: ExpenseDraft) => Promise<ExpenseActionResult>;
  deleteExpense: (expenseId: string) => Promise<ActionResult>;
  getExpenseById: (expenseId: string) => Expense | null;
  setAndroidFrontCameraMirrorFixEnabled: (enabled: boolean) => Promise<void>;
}

const initialStore: PersistedStore = {
  users: [],
  expenses: [],
  sessionUserId: null,
  preferences: defaultPreferences,
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function sanitizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAvatarGradient(seed: string): [string, string] {
  const index = seed.length % avatarGradients.length;
  return avatarGradients[index];
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

async function hashPassword(password: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

function sanitizePreferences(rawValue: unknown): AppPreferences {
  if (!rawValue || typeof rawValue !== 'object') {
    return defaultPreferences;
  }

  const rawPreferences = rawValue as Partial<AppPreferences>;

  return {
    androidFrontCameraMirrorFixEnabled: Boolean(
      rawPreferences.androidFrontCameraMirrorFixEnabled,
    ),
  };
}

function sanitizeStore(rawValue: string | null): PersistedStore {
  if (!rawValue) {
    return initialStore;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedStore>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      sessionUserId:
        typeof parsed.sessionUserId === 'string' || parsed.sessionUserId === null
          ? parsed.sessionUserId
          : null,
      preferences: sanitizePreferences(parsed.preferences),
    };
  } catch {
    return initialStore;
  }
}

function validateExpenseDraft(draft: ExpenseDraft) {
  if (!draft.imageUri) {
    return 'Anh la bat buoc cho moi khoan chi trong MVP.';
  }

  if (!Number.isFinite(draft.amount) || draft.amount <= 0) {
    return 'So tien phai lon hon 0.';
  }

  if (!categories.some((category) => category.id === draft.categoryId)) {
    return 'Danh muc khong hop le.';
  }

  if (!draft.occurredAt) {
    return 'Ngay gio khoan chi khong hop le.';
  }

  return null;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<PersistedStore>(initialStore);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const rawStore = await AsyncStorage.getItem(STORAGE_KEY);

      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setStore(sanitizeStore(rawStore));
        setIsHydrating(false);
      });
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  async function persistStore(nextStore: PersistedStore) {
    startTransition(() => {
      setStore(nextStore);
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  }

  const user = store.users.find((item) => item.id === store.sessionUserId) ?? null;
  const expenses = user
    ? sortExpensesByDate(store.expenses.filter((expense) => expense.userId === user.id))
    : [];

  async function register(displayName: string, email: string, password: string): Promise<ActionResult> {
    const trimmedName = displayName.trim();
    const normalizedEmail = sanitizeEmail(email);
    const trimmedPassword = password.trim();

    if (trimmedName.length < 2) {
      return { ok: false, error: 'Ten hien thi can it nhat 2 ky tu.' };
    }

    if (!isValidEmail(normalizedEmail)) {
      return { ok: false, error: 'Email khong dung dinh dang.' };
    }

    if (trimmedPassword.length < 6) {
      return { ok: false, error: 'Mat khau can it nhat 6 ky tu.' };
    }

    if (store.users.some((item) => item.email === normalizedEmail)) {
      return { ok: false, error: 'Email nay da duoc dang ky.' };
    }

    const nextUser: StoredUser = {
      id: createId('user'),
      displayName: trimmedName,
      email: normalizedEmail,
      joinedAt: new Date().toISOString(),
      avatarGradient: getAvatarGradient(normalizedEmail),
      passwordHash: await hashPassword(trimmedPassword),
    };

    const nextStore: PersistedStore = {
      ...store,
      users: [...store.users, nextUser],
      sessionUserId: nextUser.id,
    };

    await persistStore(nextStore);
    return { ok: true };
  }

  async function signIn(email: string, password: string): Promise<ActionResult> {
    const normalizedEmail = sanitizeEmail(email);
    const passwordHash = await hashPassword(password.trim());
    const matchedUser = store.users.find(
      (item) => item.email === normalizedEmail && item.passwordHash === passwordHash,
    );

    if (!matchedUser) {
      return { ok: false, error: 'Email hoac mat khau khong dung.' };
    }

    const nextStore: PersistedStore = {
      ...store,
      sessionUserId: matchedUser.id,
    };

    await persistStore(nextStore);
    return { ok: true };
  }

  async function signOut() {
    const nextStore: PersistedStore = {
      ...store,
      sessionUserId: null,
    };

    await persistStore(nextStore);
  }

  async function setAndroidFrontCameraMirrorFixEnabled(enabled: boolean) {
    const nextStore: PersistedStore = {
      ...store,
      preferences: {
        ...store.preferences,
        androidFrontCameraMirrorFixEnabled: enabled,
      },
    };

    await persistStore(nextStore);
  }

  async function addExpense(draft: ExpenseDraft): Promise<ExpenseActionResult> {
    if (!user) {
      return { ok: false, error: 'Ban can dang nhap de luu khoan chi.' };
    }

    const validationError = validateExpenseDraft(draft);

    if (validationError) {
      return { ok: false, error: validationError };
    }

    const now = new Date().toISOString();
    const nextExpense: Expense = {
      id: createId('expense'),
      userId: user.id,
      categoryId: draft.categoryId,
      amount: draft.amount,
      note: draft.note.trim(),
      imageUri: draft.imageUri,
      occurredAt: draft.occurredAt,
      createdAt: now,
      updatedAt: now,
    };

    const nextStore: PersistedStore = {
      ...store,
      expenses: sortExpensesByDate([...store.expenses, nextExpense]),
    };

    await persistStore(nextStore);
    return { ok: true, expense: nextExpense };
  }

  async function updateExpense(expenseId: string, draft: ExpenseDraft): Promise<ExpenseActionResult> {
    if (!user) {
      return { ok: false, error: 'Ban can dang nhap de sua khoan chi.' };
    }

    const currentExpense = store.expenses.find(
      (expense) => expense.id === expenseId && expense.userId === user.id,
    );

    if (!currentExpense) {
      return { ok: false, error: 'Khong tim thay khoan chi can sua.' };
    }

    const validationError = validateExpenseDraft(draft);

    if (validationError) {
      return { ok: false, error: validationError };
    }

    const nextExpense: Expense = {
      ...currentExpense,
      categoryId: draft.categoryId,
      amount: draft.amount,
      note: draft.note.trim(),
      imageUri: draft.imageUri,
      occurredAt: draft.occurredAt,
      updatedAt: new Date().toISOString(),
    };

    const nextStore: PersistedStore = {
      ...store,
      expenses: sortExpensesByDate(
        store.expenses.map((expense) => (expense.id === expenseId ? nextExpense : expense)),
      ),
    };

    await persistStore(nextStore);
    return { ok: true, expense: nextExpense };
  }

  async function deleteExpense(expenseId: string): Promise<ActionResult> {
    if (!user) {
      return { ok: false, error: 'Ban can dang nhap de xoa khoan chi.' };
    }

    const exists = store.expenses.some(
      (expense) => expense.id === expenseId && expense.userId === user.id,
    );

    if (!exists) {
      return { ok: false, error: 'Khong tim thay khoan chi can xoa.' };
    }

    const nextStore: PersistedStore = {
      ...store,
      expenses: store.expenses.filter((expense) => expense.id !== expenseId),
    };

    await persistStore(nextStore);
    return { ok: true };
  }

  function getExpenseById(expenseId: string) {
    if (!user) {
      return null;
    }

    return store.expenses.find(
      (expense) => expense.id === expenseId && expense.userId === user.id,
    ) ?? null;
  }

  const value: SessionContextValue = {
    isHydrating,
    isAuthenticated: Boolean(user),
    user,
    expenses,
    preferences: store.preferences,
    signIn,
    register,
    signOut,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    setAndroidFrontCameraMirrorFixEnabled,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return context;
}
