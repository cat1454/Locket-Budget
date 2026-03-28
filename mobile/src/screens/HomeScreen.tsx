import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type AvailableLenses, type CameraType, type FlashMode } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryById } from '../data/categories';
import { CaptureHistorySheet } from '../components/CaptureHistorySheet';
import { QuickExpenseSheet } from '../components/QuickExpenseSheet';
import type { AppTabParamList, RootStackParamList } from '../navigation/types';
import { useSession } from '../state/SessionContext';
import { radius, spacing, typography } from '../theme';
import { colors } from '../theme/colors';
import { getPeriodTotals, getRecentExpenses } from '../utils/analytics';
import { formatCurrencyVnd } from '../utils/format';
import { cropImageToSquare } from '../utils/image';

type Props = BottomTabScreenProps<AppTabParamList, 'Home'>;

const ui = {
  gold: '#F6B117',
  goldBorder: 'rgba(246, 177, 23, 0.36)',
  goldSoft: 'rgba(246, 177, 23, 0.16)',
  ink: '#0E0E0E',
  panel: 'rgba(12, 12, 12, 0.9)',
} as const;

const guideShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.34,
  shadowRadius: 18,
  elevation: 16,
} as const;
const ZOOM_TRACK_WIDTH = 220;
const ZOOM_THUMB_SIZE = 18;
const ULTRA_WIDE_LENS = 'builtInUltraWideCamera';
const WIDE_LENS = 'builtInWideAngleCamera';

export function HomeScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const homeLift = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const { width: viewportWidth } = useWindowDimensions();
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

  function updateZoomFromTouch(locationX: number) {
    const clampedX = Math.max(0, Math.min(ZOOM_TRACK_WIDTH, locationX));
    const nextZoom = clampedX / ZOOM_TRACK_WIDTH;
    setZoomValue(Number(nextZoom.toFixed(4)));
  }

  function openHistorySheet() {
    setIsHistoryOpen(true);
  }

  function closeHistorySheet() {
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

  const homePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (isHistoryOpen) {
            return false;
          }

          const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) + 6;
          return isVertical && gestureState.dy < -20;
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
          const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) + 6;

          if (isVertical && gestureState.dy < -44) {
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
    [homeLift, isHistoryOpen],
  );

  const ultraWideSupported = facing === 'back' && availableLenses.includes(ULTRA_WIDE_LENS);
  const ultraWideActive = ultraWideSupported && selectedLens === ULTRA_WIDE_LENS;
  const zoomBase = ultraWideActive ? 0.5 : 1;
  const zoomLabel = `${(zoomBase + zoomValue * (10 - zoomBase)).toFixed(1)}x`;
  const thumbLeft = Math.max(
    0,
    Math.min(
      ZOOM_TRACK_WIDTH - ZOOM_THUMB_SIZE,
      zoomValue * ZOOM_TRACK_WIDTH - ZOOM_THUMB_SIZE / 2,
    ),
  );

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
      <Animated.View
        {...homePanResponder.panHandlers}
        style={[
          styles.gestureSurface,
          {
            transform: [{ translateY: homeLift }],
          },
        ]}
      >
      <View style={styles.topRow}>
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
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today</Text>
          <Text style={styles.todayAmount}>{formatCurrencyVnd(totals.day)}</Text>
        </View>

        <View style={styles.previewWrap}>
          <View style={styles.outsideMask} />
          <View style={[styles.captureGuide, { width: guideSize, height: guideSize }]}>
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
              <View style={[styles.guideCorner, styles.guideCornerTopLeft]} />
              <View style={[styles.guideCorner, styles.guideCornerTopRight]} />
              <View style={[styles.guideCorner, styles.guideCornerBottomLeft]} />
              <View style={[styles.guideCorner, styles.guideCornerBottomRight]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomDock}>
        <View style={styles.zoomDock}>
          <View style={styles.zoomHeaderRow}>
            {ultraWideSupported ? (
              <View style={styles.zoomModesRow}>
                <Pressable
                  onPress={() => {
                    setSelectedLens(ULTRA_WIDE_LENS);
                    setZoomValue(0);
                  }}
                  style={[styles.zoomModeChip, ultraWideActive && styles.zoomModeChipActive]}
                >
                  <Text style={[styles.zoomModeText, ultraWideActive && styles.zoomModeTextActive]}>
                    0.5x
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSelectedLens(WIDE_LENS);
                    setZoomValue(0);
                  }}
                  style={[styles.zoomModeChip, !ultraWideActive && styles.zoomModeChipActive]}
                >
                  <Text style={[styles.zoomModeText, !ultraWideActive && styles.zoomModeTextActive]}>
                    1x
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View />
            )}

            <View style={styles.zoomPill}>
              <Text style={styles.zoomPillText}>{zoomLabel}</Text>
            </View>
          </View>

          <View
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(event) => updateZoomFromTouch(event.nativeEvent.locationX)}
            onResponderMove={(event) => updateZoomFromTouch(event.nativeEvent.locationX)}
            onStartShouldSetResponder={() => true}
            style={styles.zoomRail}
          >
            <View style={styles.zoomRailTrack} />
            <View style={[styles.zoomFill, { width: zoomValue * ZOOM_TRACK_WIDTH }]} />
            <View style={[styles.zoomThumb, { left: thumbLeft }]} />
          </View>
        </View>

        <View style={styles.bottomRow}>
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

          <Text style={styles.historyLauncherText}>Lich su</Text>
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
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.panel,
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: ui.gold,
  },
  summaryText: {
    color: ui.ink,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.gold,
  },
  avatarText: {
    color: ui.ink,
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  centerColumn: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  todayCard: {
    width: '100%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(16, 16, 16, 0.94)',
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  todayLabel: {
    color: 'rgba(246, 177, 23, 0.82)',
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
  previewWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
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
    borderWidth: 2,
    borderColor: 'rgba(246, 177, 23, 0.82)',
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
  zoomDock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  zoomHeaderRow: {
    width: ZOOM_TRACK_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
    backgroundColor: 'rgba(12, 12, 12, 0.72)',
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  zoomModeChipActive: {
    backgroundColor: ui.gold,
  },
  zoomModeText: {
    color: ui.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  zoomModeTextActive: {
    color: ui.ink,
  },
  zoomPill: {
    borderRadius: radius.pill,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(12, 12, 12, 0.86)',
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  zoomPillText: {
    color: ui.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  zoomRail: {
    width: ZOOM_TRACK_WIDTH,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.72)',
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  zoomRailTrack: {
    position: 'absolute',
    height: 4,
    left: 10,
    right: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(246, 177, 23, 0.22)',
  },
  zoomFill: {
    position: 'absolute',
    left: 0,
    top: 17,
    bottom: 17,
    borderRadius: radius.pill,
    backgroundColor: ui.gold,
  },
  zoomThumb: {
    position: 'absolute',
    width: ZOOM_THUMB_SIZE,
    height: ZOOM_THUMB_SIZE,
    borderRadius: ZOOM_THUMB_SIZE / 2,
    backgroundColor: ui.gold,
    borderWidth: 2,
    borderColor: colors.white,
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
    paddingBottom: spacing.xl,
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
    borderColor: 'rgba(246, 177, 23, 0.28)',
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
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  historyThumb: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#161616',
  },
  historyThumbFallback: {
    width: 40,
    height: 40,
    borderRadius: 14,
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
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.94)',
    borderWidth: 1,
    borderColor: ui.goldBorder,
  },
  historyLauncherText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
});
