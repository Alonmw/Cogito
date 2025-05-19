import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

interface SwipeableScreenProps {
  children: React.ReactNode;
  currentTab: 'index' | 'history' | 'info' | 'profile';
}

// Define the tab order for navigation
const tabOrder = ['index', 'history', 'info', 'profile'] as const;
type TabName = typeof tabOrder[number];

const SwipeableScreen: React.FC<SwipeableScreenProps> = ({ children, currentTab }) => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  
  // Function to navigate to the next or previous tab
  const navigateToTab = (direction: 'next' | 'prev') => {
    const currentIndex = tabOrder.indexOf(currentTab as TabName);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % tabOrder.length;
    } else {
      newIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    }
    
    const nextTab = tabOrder[newIndex];
    
    // Use the appropriate path for navigation
    if (nextTab === 'index') {
      router.push('/(tabs)');
    } else {
      router.push(`/(tabs)/${nextTab}` as any);
    }
  };
  
  // Create swipe gestures for left and right
  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .onEnd((event) => {
      // Determine if this is a significant horizontal swipe
      const { translationX } = event;
      const significantSwipe = Math.abs(translationX) > screenWidth * 0.2;
      
      if (significantSwipe) {
        if (translationX > 0) {
          // Swiped right, go to previous tab
          runOnJS(navigateToTab)('prev');
        } else {
          // Swiped left, go to next tab
          runOnJS(navigateToTab)('next');
        }
      }
    });
    
  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        {children}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwipeableScreen; 