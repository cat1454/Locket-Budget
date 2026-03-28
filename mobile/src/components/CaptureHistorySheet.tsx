import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ExpenseQuickTile } from './ExpenseQuickTile';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import type { Expense } from '../types/domain';

interface CaptureHistorySheetProps {
  visible: boolean;
  expenses: Expense[];
  onClose: () => void;
  onOpenExpense: (expenseId: string) => void;
}

const ui = {
  backdrop: 'rgba(4, 4, 4, 0.56)',
  panel: '#16110B',
  panelBorder: 'rgba(246, 177, 23, 0.16)',
  gold: '#F6B117',
} as const;

const OPEN_BACKDROP_OPACITY = 1;
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 1;

export function CaptureHistorySheet({
  visible,
  expenses,
  onClose,
  onOpenExpense,
}: CaptureHistorySheetProps) {
  const { height: viewportHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(viewportHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const maxSheetHeight = Math.min(viewportHeight * 0.82, 760);

  const animateOpen = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: OPEN_BACKDROP_OPACITY,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY]);

  const animateBackToOpen = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: OPEN_BACKDROP_OPACITY,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY]);

  const animateClose = useCallback(
    (onDone?: () => void) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: viewportHeight,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }

        onDone?.();
      });
    },
    [backdropOpacity, translateY, viewportHeight],
  );

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.setValue(viewportHeight);
      backdropOpacity.setValue(0);

      requestAnimationFrame(() => {
        animateOpen();
      });

      return;
    }

    if (isMounted) {
      animateClose(() => {
        setIsMounted(false);
      });
    }
  }, [animateClose, animateOpen, backdropOpacity, isMounted, translateY, viewportHeight, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation();
          backdropOpacity.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          const nextTranslateY = Math.max(0, gestureState.dy);
          const nextOpacity = Math.max(
            0,
            OPEN_BACKDROP_OPACITY - nextTranslateY / Math.max(maxSheetHeight, 1),
          );

          translateY.setValue(nextTranslateY);
          backdropOpacity.setValue(nextOpacity);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > CLOSE_DISTANCE || gestureState.vy > CLOSE_VELOCITY) {
            onClose();
            return;
          }

          animateBackToOpen();
        },
        onPanResponderTerminate: () => {
          animateBackToOpen();
        },
      }),
    [animateBackToOpen, backdropOpacity, maxSheetHeight, onClose, translateY],
  );

  if (!isMounted) {
    return null;
  }

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible>
      <View style={styles.root}>
        <Pressable onPress={onClose} style={styles.backdropTouch}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: maxSheetHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.sheetHeader}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>Lich su</Text>
              <Ionicons color="rgba(255, 255, 255, 0.72)" name="chevron-down" size={18} />
            </View>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Chua co khoan chi nao</Text>
              <Text style={styles.emptyBody}>Anh va gia tien se hien o day ngay sau khi ban luu.</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {expenses.map((expense) => (
                  <ExpenseQuickTile
                    expense={expense}
                    key={expense.id}
                    onPress={() => onOpenExpense(expense.id)}
                  />
                ))}
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ui.backdrop,
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: ui.panel,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: ui.panelBorder,
    paddingTop: spacing.xs,
  },
  sheetHeader: {
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: ui.panelBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyBody: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: typography.body,
    lineHeight: 22,
  },
});
