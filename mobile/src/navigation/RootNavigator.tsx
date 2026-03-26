import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { ExpenseDetailScreen } from '../screens/ExpenseDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useSession } from '../state/SessionContext';
import { navigationTheme, radius, typography } from '../theme';
import { colors } from '../theme/colors';
import type { AppTabParamList, AuthStackParamList, RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={WelcomeScreen} name="Welcome" />
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
    </AuthStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarActiveTintColor: colors.accentStrong,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {
          height: 84,
          paddingBottom: 14,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === 'Home'
              ? focused
                ? 'sparkles'
                : 'sparkles-outline'
              : route.name === 'Timeline'
                ? focused
                  ? 'images'
                  : 'images-outline'
                : route.name === 'Stats'
                  ? focused
                    ? 'pie-chart'
                    : 'pie-chart-outline'
                  : focused
                    ? 'person-circle'
                    : 'person-circle-outline';

          return <Ionicons color={color} name={iconName} size={size} />;
        },
        headerRight: () => (
          <Pressable
            onPress={() => navigation.getParent()?.navigate('AddExpense')}
            style={styles.headerButton}
          >
            <Ionicons color={colors.textPrimary} name="add-circle-outline" size={24} />
          </Pressable>
        ),
      })}
    >
      <Tab.Screen component={HomeScreen} name="Home" options={{ title: 'Home' }} />
      <Tab.Screen component={TimelineScreen} name="Timeline" options={{ title: 'Timeline' }} />
      <Tab.Screen component={StatsScreen} name="Stats" options={{ title: 'Stats' }} />
      <Tab.Screen component={ProfileScreen} name="Profile" options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function BootstrapScreen() {
  return (
    <View style={styles.bootstrapScreen}>
      <ActivityIndicator color={colors.accentStrong} size="large" />
      <Text style={styles.bootstrapText}>Dang tai du lieu local...</Text>
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isHydrating } = useSession();

  if (isHydrating) {
    return <BootstrapScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator>
        {!isAuthenticated ? (
          <RootStack.Screen
            component={AuthNavigator}
            name="Auth"
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <RootStack.Screen component={AppTabs} name="App" options={{ headerShown: false }} />
            <RootStack.Screen
              component={AddExpenseScreen}
              name="AddExpense"
              options={({ route }) => ({
                title: route.params?.expenseId ? 'Edit Expense' : 'Add Expense',
                presentation: 'modal',
                headerStyle: { backgroundColor: colors.surface },
                headerShadowVisible: false,
                headerTintColor: colors.textPrimary,
              })}
            />
            <RootStack.Screen
              component={ExpenseDetailScreen}
              name="ExpenseDetail"
              options={{
                title: 'Expense Detail',
                headerStyle: { backgroundColor: colors.surface },
                headerShadowVisible: false,
                headerTintColor: colors.textPrimary,
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  bootstrapScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  bootstrapText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: typography.bodyLarge,
  },
});
