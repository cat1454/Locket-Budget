import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type AvailableLenses, type CameraType, type FlashMode } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, InteractionManager, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryById } from '../data/categories';
import { CaptureHistorySheet } from '../components/CaptureHistorySheet';
import { QuickExpenseSheet } from '../components/QuickExpenseSheet';
import type { AppTabParamList, RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import { getPeriodTotals, getRecentExpenses, getTodayRecap } from '../utils/analytics';
import { formatCurrencyVnd } from '../utils/format';
import { cropImageToSquare } from '../utils/image';

type Props = BottomTabScreenProps<AppTabParamList, 'Home'>;

const ui = {
  gold: '#F6B117',
  goldBorder: 'rgba(246, 177, 23, 0.22)',
  goldSoft: 'rgba(246, 177, 23, 0.16)',
  glow: 'rgba(246, 177, 23, 0.24)',
  ink: '#0E0E0E',
  panel: 'rgba(255, 255, 255, 0.06)',
  panelStrong: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#F7F7F5',
  textSoft: 'rgba(247, 247, 245, 0.68)',
} as const;

const guideShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.34,
  shadowRadius: 18,
  elevation: 16,
} as const;
const ULTRA_WIDE_LENS = 'builtInUltraWideCamera';
const WIDE_LENS = 'builtInWideAngleCamera';
const HOME_SWIPE_MIN_DISTANCE = 24;
const HOME_SWIPE_OPEN_DISTANCE = 48;

type ZoneName = 'topRow' | 'bottomDock' | 'zoomDock' | 'bottomRow' | 'historyLauncher';

interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getTouchDistance(
  touches: ReadonlyArray<{
    pageX: number;
    pageY: number;
  }>,
) {
  if (touches.length < 2) {
    return 0;
  }

  const [firstTouch, secondTouch] = touches;
  const deltaX = secondTouch.pageX - firstTouch.pageX;
  const deltaY = secondTouch.pageY - firstTouch.pageY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export function HomeScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const homeLift = useRef(new Animated.Value(0)).current;
  const pinchDistanceRef = useRef(0);
  const pinchStartZoomRef = useRef(0);
  const zoomFeedbackOpacity = useRef(new Animated.Value(0)).current;
  const zoomFeedbackTranslateY = useRef(new Animated.Value(8)).current;
  const zoomFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHistoryOpenRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  const zoneLayoutsRef = useRef<Partial<Record<ZoneName, LayoutRect>>>({});
  const isFocused = useIsFocused();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoomValue, setZoomValue] = useState(0);
  const [availableLenses, setAvailableLenses] = useState<string[]>([]);
  const [selectedLens, setSelectedLens] = useState<string | undefined>(undefined);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [draftImageUri, setDraftImageUri] = useState<string | null>(null);
  const { expenses, user } = useSession();
  const totals = getPeriodTotals(expenses);
  const todayRecap = getTodayRecap(expenses);
  const recentExpenses = getRecentExpenses(expenses, 6);
  const latestExpense = recentExpenses[0] ?? null;
  const latestCategory = latestExpense ? categoryById[latestExpense.categoryId] : null;
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const availableWidth = Math.max(0, viewportWidth - spacing.md * 2);
  const guideSize = Math.min(availableWidth, 340);

  async function handleCapture() {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        shutterSound: false,
      });

      if (photo?.uri) {
        const squaredUri = await cropImageToSquare({
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
        });

        setDraftImageUri(squaredUri);
      }
    } catch {
      Alert.alert('Capture failed', 'Try again once the camera is stable.');
    } finally {
      setIsCapturing(false);
    }
  }

  async function handlePickImage() {
    const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResponse.granted) {
      Alert.alert('Library access needed', 'Allow photo library access to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const squaredUri = await cropImageToSquare({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });

      setDraftImageUri(squaredUri);
    }
  }

  function toggleFlash() {
    setFlash((current) => (current === 'on' ? 'off' : 'on'));
  }

  function toggleFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    setSelectedLens(undefined);
    setZoomValue(0);
  }

  function showZoomFeedback() {
    zoomFeedbackTimerRef.current && clearTimeout(zoomFeedbackTimerRef.current);

    Animated.parallel([
      Animated.timing(zoomFeedbackOpacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(zoomFeedbackTranslateY, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();

    zoomFeedbackTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(zoomFeedbackOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(zoomFeedbackTranslateY, {
          toValue: -8,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);
  }

  function setZoomWithFeedback(nextZoom: number) {
    const normalizedZoom = Number(clamp(nextZoom, 0, 1).toFixed(4));
    setZoomValue(normalizedZoom);
    showZoomFeedback();
  }

  function setLensWithFeedback(nextLens: string | undefined) {
    setSelectedLens(nextLens);
    setZoomValue(0);
    showZoomFeedback();
  }

  function openHistorySheet() {
    if (isHistoryOpen) {
      return;
    }

    pendingHistoryOpenRef.current?.cancel();
    pendingHistoryOpenRef.current = InteractionManager.runAfterInteractions(() => {
      pendingHistoryOpenRef.current = null;
      setIsHistoryOpen(true);
    });
  }

  function closeHistorySheet() {
    pendingHistoryOpenRef.current?.cancel();
    pendingHistoryOpenRef.current = null;
    setIsHistoryOpen(false);
  }

  function resetHomeLift(duration = 180) {
    Animated.spring(homeLift, {
      toValue: 0,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    return () => {
      zoomFeedbackTimerRef.current && clearTimeout(zoomFeedbackTimerRef.current);
      pendingHistoryOpenRef.current?.cancel();
      zoomFeedbackTimerRef.current = null;
      pendingHistoryOpenRef.current = null;
    };
  }, []);

  function handleZoneLayout(zoneName: ZoneName) {
    return (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      zoneLayoutsRef.current[zoneName] = { x, y, width, height };
    };
  }

  function isPointInsideRect(pointX: number, pointY: number, rect?: LayoutRect) {
    if (!rect) {
      return false;
    }

    return (
      pointX >= rect.x
      && pointX <= rect.x + rect.width
      && pointY >= rect.y
      && pointY <= rect.y + rect.height
    );
  }

  function isPointInsideDeadZone(pointX: number, pointY: number) {
    const topRow = zoneLayoutsRef.current.topRow;
    const bottomDock = zoneLayoutsRef.current.bottomDock;
    const zoomDock = zoneLayoutsRef.current.zoomDock;
    const bottomRow = zoneLayoutsRef.current.bottomRow;
    const historyLauncher = zoneLayoutsRef.current.historyLauncher;

    if (isPointInsideRect(pointX, pointY, topRow)) {
      return true;
    }

    if (!bottomDock) {
      return false;
    }

    const absoluteZoomDock = zoomDock
      ? {
          x: bottomDock.x + zoomDock.x,
          y: bottomDock.y + zoomDock.y,
          width: zoomDock.width,
          height: zoomDock.height,
        }
      : undefined;
    const absoluteBottomRow = bottomRow
      ? {
          x: bottomDock.x + bottomRow.x,
          y: bottomDock.y + bottomRow.y,
          width: bottomRow.width,
          height: bottomRow.height,
        }
      : undefined;
    const absoluteHistoryLauncher = historyLauncher
      ? {
          x: bottomDock.x + historyLauncher.x,
          y: bottomDock.y + historyLauncher.y,
          width: historyLauncher.width,
          height: historyLauncher.height,
        }
      : undefined;

    return (
      isPointInsideRect(pointX, pointY, absoluteZoomDock)
      || isPointInsideRect(pointX, pointY, absoluteBottomRow)
      || isPointInsideRect(pointX, pointY, absoluteHistoryLauncher)
    );
  }

  const homePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (event, gestureState) => {
          if (isHistoryOpen || draftImageUri || isCapturing) {
            return false;
          }

          if (gestureState.numberActiveTouches > 1) {
            return false;
          }

          if (gestureState.dy >= 0) {
            return false;
          }

          const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) + 8;

          if (!isVertical || gestureState.dy > -HOME_SWIPE_MIN_DISTANCE) {
            return false;
          }

          const gestureStartX = event.nativeEvent.locationX - gestureState.dx;
          const startY = event.nativeEvent.locationY - gestureState.dy;
          return !isPointInsideDeadZone(gestureStartX, startY);
        },
        onPanResponderGrant: () => {
          homeLift.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy >= 0) {
            homeLift.setValue(0);
            return;
          }

          const liftedY = Math.max(-64, gestureState.dy * 0.22);
          homeLift.setValue(liftedY);
        },
        onPanResponderRelease: (_, gestureState) => {
          const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) + 8;

          if (isVertical && gestureState.dy < -HOME_SWIPE_OPEN_DISTANCE) {
            resetHomeLift();
            openHistorySheet();
            return;
          }

          resetHomeLift();
        },
        onPanResponderTerminate: () => {
          resetHomeLift();
        },
      }),
    [draftImageUri, homeLift, isCapturing, isHistoryOpen],
  );

  const previewPinchResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (event, gestureState) => {
          const touches = event.nativeEvent.touches;
          return touches.length === 2 && Math.abs(gestureState.dy) + Math.abs(gestureState.dx) > 2;
        },
        onPanResponderGrant: (event) => {
          const nextDistance = getTouchDistance(event.nativeEvent.touches);
          pinchDistanceRef.current = nextDistance;
          pinchStartZoomRef.current = zoomValue;
        },
        onPanResponderMove: (event) => {
          const nextDistance = getTouchDistance(event.nativeEvent.touches);

          if (nextDistance <= 0) {
            return;
          }

          if (pinchDistanceRef.current <= 0) {
            pinchDistanceRef.current = nextDistance;
            pinchStartZoomRef.current = zoomValue;
            return;
          }

          const scaleDelta = (nextDistance - pinchDistanceRef.current) / 220;
          const nextZoom = clamp(pinchStartZoomRef.current + scaleDelta, 0, 1);
          setZoomWithFeedback(nextZoom);
        },
        onPanResponderRelease: () => {
          pinchDistanceRef.current = 0;
          pinchStartZoomRef.current = zoomValue;
        },
        onPanResponderTerminate: () => {
          pinchDistanceRef.current = 0;
          pinchStartZoomRef.current = zoomValue;
        },
      }),
    [zoomValue],
  );

  const ultraWideSupported = facing === 'back' && availableLenses.includes(ULTRA_WIDE_LENS);
  const ultraWideActive = ultraWideSupported && selectedLens === ULTRA_WIDE_LENS;
  const zoomLabel = ultraWideActive
    ? `${(0.5 + zoomValue * 0.5).toFixed(1)}x`
    : `${(1 + zoomValue * 4).toFixed(1)}x`;

  if (!permission) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.white} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <StatusBar style="light" />
        <Text style={styles.permissionTitle}>Open camera first</Text>
        <Text style={styles.permissionBody}>
          Camera access lets you capture a spending moment the second the app opens.
        </Text>
        <Pressable
          onPress={() => {
            void requestPermission();
          }}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Timeline')} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Open timeline</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#040404', '#090909', '#050505']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.ambientBlobTop} />
      <View pointerEvents="none" style={styles.ambientBlobBottom} />
      <Animated.View
        {...homePanResponder.panHandlers}
        style={[
          styles.gestureSurface,
          {
            transform: [{ translateY: homeLift }],
          },
        ]}
      >
      <View onLayout={handleZoneLayout('topRow')} style={styles.topRow}>
        <Pressable onPress={toggleFlash} style={styles.iconButton}>
          <Ionicons
            color={ui.gold}
            name={flash === 'on' ? 'flash' : 'flash-off'}
            size={22}
          />
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Timeline')} style={styles.summaryPill}>
          <Ionicons color={ui.ink} name="images-outline" size={18} />
          <Text style={styles.summaryText}>{totals.entriesToday} today</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarButton}>
          <Text style={styles.avatarText}>{user?.displayName.slice(0, 1).toUpperCase() ?? 'U'}</Text>
        </Pressable>
      </View>

      <View style={styles.centerColumn}>
        <View style={styles.insightRow}>
          <View style={styles.todayCard}>
            <Text style={styles.todayLabel}>Today</Text>
            <Text style={styles.todayAmount}>{formatCurrencyVnd(totals.day)}</Text>
          </View>

          <View style={styles.recapCardCompact}>
            <Text style={styles.recapCompactLabel}>Recap</Text>
            <Text numberOfLines={2} style={styles.recapCompactTitle}>
              {todayRecap.title}
            </Text>
            <View style={styles.recapBadgeCompact}>
              <Text style={styles.recapBadgeText}>{todayRecap.badge}</Text>
            </View>
          </View>
        </View>

        <View style={styles.previewWrap}>
          <View style={styles.outsideMask} />
          <View
            {...previewPinchResponder.panHandlers}
            style={[styles.captureGuide, { width: guideSize, height: guideSize }]}
          >
            {isFocused ? (
              <CameraView
                active={isFocused}
                animateShutter={false}
                facing={facing}
                flash={flash}
                mode="picture"
                onAvailableLensesChanged={(event: AvailableLenses) => {
                  setAvailableLenses(event.lenses);

                  if (selectedLens && !event.lenses.includes(selectedLens)) {
                    setSelectedLens(undefined);
                  }
                }}
                ratio="1:1"
                ref={cameraRef}
                selectedLens={selectedLens}
                style={styles.guideCamera}
                zoom={zoomValue}
              />
            ) : (
              <View style={styles.guideFallback} />
            )}

            <View style={styles.guideOverlay}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.zoomFeedbackPill,
                  {
                    opacity: zoomFeedbackOpacity,
                    transform: [{ translateY: zoomFeedbackTranslateY }],
                  },
                ]}
              >
                <Text style={styles.zoomFeedbackText}>{zoomLabel}</Text>
              </Animated.View>
              <View style={[styles.guideCorner, styles.guideCornerTopLeft]} />
              <View style={[styles.guideCorner, styles.guideCornerTopRight]} />
              <View style={[styles.guideCorner, styles.guideCornerBottomLeft]} />
              <View style={[styles.guideCorner, styles.guideCornerBottomRight]} />
            </View>
          </View>
        </View>
      </View>

      <View onLayout={handleZoneLayout('bottomDock')} style={styles.bottomDock}>
        <View onLayout={handleZoneLayout('zoomDock')} style={styles.zoomDock}>
          {ultraWideSupported ? (
            <View style={styles.zoomModesRow}>
              <Pressable
                onPress={() => {
                  setLensWithFeedback(ULTRA_WIDE_LENS);
                }}
                style={[styles.zoomModeChip, ultraWideActive && styles.zoomModeChipActive]}
              >
                <Text style={[styles.zoomModeText, ultraWideActive && styles.zoomModeTextActive]}>
                  0.5x
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setLensWithFeedback(WIDE_LENS);
                }}
                style={[styles.zoomModeChip, !ultraWideActive && styles.zoomModeChipActive]}
              >
                <Text style={[styles.zoomModeText, !ultraWideActive && styles.zoomModeTextActive]}>
                  1x
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View onLayout={handleZoneLayout('bottomRow')} style={styles.bottomRow}>
          <Pressable
            onPress={() => {
              void handlePickImage();
            }}
            style={styles.sideAction}
          >
            <Ionicons color={ui.gold} name="images-outline" size={26} />
          </Pressable>

          <Pressable
            disabled={isCapturing}
            onPress={() => {
              void handleCapture();
            }}
            style={[styles.shutterButton, isCapturing && styles.buttonDisabled]}
          >
            <View style={styles.shutterCore}>
              {isCapturing ? <ActivityIndicator color={colors.textPrimary} /> : null}
            </View>
          </Pressable>

          <Pressable onPress={toggleFacing} style={styles.sideAction}>
            <Ionicons color={ui.gold} name="camera-reverse-outline" size={26} />
          </Pressable>
        </View>

        <Pressable
          onPress={openHistorySheet}
          onLayout={handleZoneLayout('historyLauncher')}
          style={styles.historyLauncher}
        >
          {latestExpense ? (
            latestExpense.imageUri ? (
              <Image source={{ uri: latestExpense.imageUri }} style={styles.historyThumb} />
            ) : (
              <LinearGradient
                colors={latestCategory?.coverColors ?? ['#6A553A', '#3F321F']}
                style={styles.historyThumbFallback}
              >
                <Text style={styles.historyThumbFallbackText}>
                  {latestCategory?.shortLabel ?? 'H'}
                </Text>
              </LinearGradient>
            )
          ) : (
            <View style={styles.historyThumbPlaceholder}>
              <Ionicons color={ui.gold} name="images-outline" size={18} />
            </View>
          )}

          <Text style={styles.historyLauncherText}>History</Text>
          <Ionicons color="rgba(255, 255, 255, 0.72)" name="chevron-up" size={18} />
        </Pressable>
      </View>
      </Animated.View>

      {draftImageUri ? (
        <QuickExpenseSheet
          imageUri={draftImageUri}
          onClose={() => setDraftImageUri(null)}
          onOpenFullForm={() => {
            rootNavigation?.navigate('AddExpense', {
              prefilledImageUri: draftImageUri,
            });
            setDraftImageUri(null);
          }}
          onSaved={() => {
            setDraftImageUri(null);
          }}
        />
      ) : null}

      <CaptureHistorySheet
        expenses={expenses}
        onClose={closeHistorySheet}
        onOpenExpense={(expenseId) => {
          closeHistorySheet();
          setTimeout(() => {
            rootNavigation?.navigate('ExpenseDetail', { expenseId });
          }, 180);
        }}
        visible={isHistoryOpen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: spacing.md,
  },
  ambientBlobTop: {
    position: 'absolute',
    top: -20,
    right: -8,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(246, 177, 23, 0.05)',
  },
  ambientBlobBottom: {
    position: 'absolute',
    bottom: 90,
    left: -24,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gestureSurface: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    paddingHorizontal: spacing.xl,
  },
  permissionTitle: {
    color: ui.gold,
    fontSize: typography.display,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionBody: {
    color: 'rgba(255, 230, 168, 0.82)',
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    borderRadius: radius.pill,
    backgroundColor: ui.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    color: ui.ink,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  secondaryAction: {
    paddingVertical: spacing.sm,
  },
  secondaryActionText: {
    color: 'rgba(246, 177, 23, 0.78)',
    fontSize: typography.body,
    fontWeight: '600',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.panel,
    borderWidth: 1,
    borderColor: ui.border,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.pill,
    backgroundColor: ui.panelStrong,
    borderWidth: 1,
    borderColor: ui.border,
  },
  summaryText: {
    color: ui.text,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.panelStrong,
    borderWidth: 1,
    borderColor: ui.border,
  },
  avatarText: {
    color: ui.text,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  centerColumn: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  insightRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  todayCard: {
    flex: 1.15,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: ui.border,
  },
  todayLabel: {
    color: ui.textSoft,
    fontSize: typography.eyebrow,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  todayAmount: {
    color: ui.gold,
    fontSize: typography.title,
    fontWeight: '800',
  },
  recapCardCompact: {
    flex: 0.85,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: ui.border,
  },
  recapCompactLabel: {
    color: ui.textSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  recapCompactTitle: {
    color: ui.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: spacing.sm,
    flex: 1,
  },
  recapBadgeCompact: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: 'rgba(246, 177, 23, 0.12)',
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  recapBadgeText: {
    color: ui.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  previewWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  outsideMask: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  captureGuide: {
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#090909',
    ...guideShadow,
  },
  guideCamera: {
    ...StyleSheet.absoluteFillObject,
  },
  guideFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111111',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  zoomFeedbackPill: {
    position: 'absolute',
    top: spacing.lg,
    alignSelf: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(12, 12, 12, 0.76)',
    borderWidth: 1,
    borderColor: ui.border,
  },
  zoomFeedbackText: {
    color: ui.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  zoomDock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  zoomModesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  zoomModeChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: ui.panel,
    borderWidth: 1,
    borderColor: ui.border,
  },
  zoomModeChipActive: {
    backgroundColor: ui.goldSoft,
    borderColor: ui.goldBorder,
  },
  zoomModeText: {
    color: ui.textSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  zoomModeTextActive: {
    color: ui.gold,
  },
  guideCorner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: ui.gold,
  },
  guideCornerTopLeft: {
    top: spacing.lg,
    left: spacing.lg,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  guideCornerTopRight: {
    top: spacing.lg,
    right: spacing.lg,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  guideCornerBottomLeft: {
    bottom: spacing.lg,
    left: spacing.lg,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  guideCornerBottomRight: {
    bottom: spacing.lg,
    right: spacing.lg,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  bottomDock: {
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sideAction: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.panel,
    borderWidth: 1,
    borderColor: ui.border,
  },
  shutterButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.gold,
  },
  shutterCore: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.ink,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.88)',
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  historyLauncher: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: ui.border,
  },
  historyThumb: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#161616',
  },
  historyThumbFallback: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyThumbFallbackText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  historyThumbPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: ui.border,
  },
  historyLauncherText: {
    color: ui.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
