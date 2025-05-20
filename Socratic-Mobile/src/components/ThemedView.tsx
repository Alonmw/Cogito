import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { shadows, spacing } from '@/src/constants/spacingAndShadows';

/**
 * ThemedView
 * - Uses theme background color by default
 * - Optional 'shadow' prop: 'low' | 'medium' | 'high' for elevation
 * - Optional 'margin' prop: spacing key ('xs', 's', 'm', 'l', 'xl') or number
 */
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  shadow?: keyof typeof shadows;
  margin?: keyof typeof spacing | number;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  shadow,
  margin,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const shadowStyle = shadow ? shadows[shadow] : undefined;
  let marginStyle = undefined;
  if (margin !== undefined) {
    const marginValue = typeof margin === 'string' ? spacing[margin] : margin;
    marginStyle = { margin: marginValue };
  }
  return <View style={[{ backgroundColor }, shadowStyle, marginStyle, style]} {...otherProps} />;
}
