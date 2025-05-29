import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@shared/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'Lora-Bold',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'Lora-Bold',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  link: {
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
