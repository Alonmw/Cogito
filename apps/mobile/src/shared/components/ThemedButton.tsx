import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Colors } from '@shared/constants/Colors';
import { spacing, shadows } from '@shared/constants/spacingAndShadows';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  // Variant styles
  const backgroundColor =
    variant === 'primary'
      ? Colors.tint
      : variant === 'secondary'
      ? Colors.icon + '22' // faded icon color
      : 'transparent';
  const borderColor =
    variant === 'outline' ? Colors.tint : 'transparent';
  const textColor =
    variant === 'primary'
      ? Colors.background
      : variant === 'secondary'
      ? Colors.text
      : Colors.tint;

  // Size styles
  const sizeStyle =
    size === 'small'
      ? styles.small
      : size === 'large'
      ? styles.large
      : styles.medium;

  // Disabled style
  const opacity = disabled ? 0.5 : 1;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 * opacity : opacity,
        },
        styles.base,
        sizeStyle,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        variant === 'outline' ? styles.outline : null,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        {isLoading ? (
          <ActivityIndicator size="small" color={textColor} style={{ marginHorizontal: 4 }} />
        ) : (
          <ThemedText
            type={variant === 'text' ? 'link' : 'defaultSemiBold'}
            style={[{ color: textColor }, styles.text, textStyle]}
          >
            {title}
          </ThemedText>
        )}
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.low,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.m,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: spacing.xs,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  small: {
    height: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
  },
  medium: {
    height: 44,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  large: {
    height: 56,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  outline: {
    backgroundColor: 'transparent',
  },
}); 