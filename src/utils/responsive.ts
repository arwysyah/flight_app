import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Responsive width based on screen size
 * @param size - Size in base width (375)
 */
export const wp = (size: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * size) / BASE_WIDTH);
};

/**
 * Responsive height based on screen size
 * @param size - Size in base height (812)
 */
export const hp = (size: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * size) / BASE_HEIGHT);
};

/**
 * Responsive font size
 * @param size - Font size in base scale
 */
export const fs = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }

  return (
    pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
  );
};

/**
 * Check if device is small (iPhone SE, etc.)
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 667;
};

/**
 * Get responsive padding for containers
 */
export const getContainerPadding = (): number => {
  if (isTablet()) return wp(32);
  if (isSmallDevice()) return wp(12);
  return wp(16);
};

/**
 * Get responsive spacing
 */
export const spacing = {
  xs: wp(4),
  sm: wp(8),
  md: wp(16),
  lg: wp(24),
  xl: wp(32),
};

/**
 * Get screen dimensions
 */
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
