import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { getRandomQuote } from '../utils/quoteUtils';
import { Colors } from '@shared/constants/Colors';

interface RandomQuoteProps {
  // Additional props can be added as needed
}

/**
 * Component that displays a random philosophical quote with a fade-in animation
 */
export function RandomQuote({}: RandomQuoteProps) {
  // State to store the random quote
  const [quote, setQuote] = useState<string>('');
  
  // Animated opacity value for fade-in effect
  const opacity = useState(new Animated.Value(0))[0];

  // Generate a random quote when the component mounts
  useEffect(() => {
    setQuote(getRandomQuote());
    
    // Start fade-in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={{ opacity }}>
        <ThemedText style={styles.quoteText}>
          {quote}
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    marginBottom: 8,
  },
  quoteText: {
    fontFamily: 'Lora-SemiBold',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
}); 