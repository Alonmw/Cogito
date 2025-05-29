/**
 * Hook to get colors from the theme.
 * Only uses light theme as dark mode is not supported.
 */

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@shared/constants/Colors';

export function useThemeColor(
  props: { light?: string },
  colorName: keyof typeof Colors
) {
  // Use light color from props if provided, otherwise use theme color
  return props.light || Colors[colorName];
}
