import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from './ThemedView';
import { Colors } from '@shared/constants/Colors';

export type ThemedCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  shadowVariant?: 'low' | 'medium' | 'high';
};

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  style,
  onPress,
  shadowVariant = 'medium',
}) => {
  // Card background: slightly different from main background for contrast
  const cardBackground = '#F5E9D7'; // a bit darker than #FAF3E0

  const content = (
    <ThemedView
      style={[styles.card, { backgroundColor: cardBackground }, style]}
      shadow={shadowVariant}
    >
      {children}
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
}); 