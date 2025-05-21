/**
 * Hook to get colors from the theme.
 * Only uses light theme as dark mode is not supported.
 */

import { Colors } from '@/src/constants/Colors';

export function useThemeColor(
  props: { light?: string },
  colorName: keyof typeof Colors
) {
  // Use light color from props if provided, otherwise use theme color
  return props.light || Colors[colorName];
}
