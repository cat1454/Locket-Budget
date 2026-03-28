import { FlipType, SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { Image as ReactNativeImage } from 'react-native';

interface SquareImageInput {
  uri: string;
  width?: number;
  height?: number;
  flipHorizontal?: boolean;
}

async function resolveImageSize(uri: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    ReactNativeImage.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve(null),
    );
  });
}

export async function cropImageToSquare({
  uri,
  width,
  height,
  flipHorizontal = false,
}: SquareImageInput): Promise<string> {
  if (!uri) {
    return uri;
  }

  let resolvedWidth = width;
  let resolvedHeight = height;

  if (!resolvedWidth || !resolvedHeight || resolvedWidth <= 0 || resolvedHeight <= 0) {
    const resolvedSize = await resolveImageSize(uri);

    if (!resolvedSize) {
      return uri;
    }

    resolvedWidth = resolvedSize.width;
    resolvedHeight = resolvedSize.height;
  }

  if (resolvedWidth === resolvedHeight && !flipHorizontal) {
    return uri;
  }

  const actions: Parameters<typeof manipulateAsync>[1] = [];

  if (resolvedWidth !== resolvedHeight) {
    const size = Math.min(resolvedWidth, resolvedHeight);
    const originX = Math.max(0, Math.round((resolvedWidth - size) / 2));
    const originY = Math.max(0, Math.round((resolvedHeight - size) / 2));

    actions.push({
      crop: {
        originX,
        originY,
        width: size,
        height: size,
      },
    });
  }

  if (flipHorizontal) {
    actions.push({
      flip: FlipType.Horizontal,
    });
  }

  const result = await manipulateAsync(
    uri,
    actions,
    {
      compress: 0.82,
      format: SaveFormat.JPEG,
    },
  );

  return result.uri;
}
