import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Timeline: undefined;
  Stats: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
  AddExpense:
    | {
        expenseId?: string;
        prefilledImageUri?: string;
      }
    | undefined;
  ExpenseDetail: {
    expenseId: string;
  };
};
