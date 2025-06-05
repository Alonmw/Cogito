import React, { useState, useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import { ThemedView } from '@shared/components/ThemedView';
import { Colors } from '@shared/constants/Colors';
import { markIntroductionCompleted, saveSelectedTopics, hasCompletedIntroduction, resetIntroductionStatus, debugOnboardingStorage } from '@shared/utils/onboardingUtils';

// Import individual slides
import WelcomeSlide from '@features/onboarding/slides/WelcomeSlide';
import PurposeSlide from '@features/onboarding/slides/PurposeSlide';
import PersonalizationSlide from '@features/onboarding/slides/PersonalizationSlide';
import AccountSlide from '@features/onboarding/slides/AccountSlide';
import GetStartedSlide from '@features/onboarding/slides/GetStartedSlide';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface IntroductionScreenProps {}

export default function IntroductionScreen({}: IntroductionScreenProps) {
  const router = useRouter();
  const swiperRef = useRef<Swiper>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Debug: Log storage state when component mounts
  React.useEffect(() => {
    debugOnboardingStorage();
  }, []);

  const handleNextSlide = () => {
    if (swiperRef.current && currentIndex < 4) {
      swiperRef.current.scrollBy(1);
    }
  };

  const handleSkipSlide = () => {
    handleNextSlide();
  };

  const handleTopicsSelected = async (topics: string[]) => {
    setSelectedTopics(topics);
    // Store topics in AsyncStorage for later use
    await saveSelectedTopics(topics);
  };

  const handleAccountCreated = () => {
    handleNextSlide();
  };

  const handleAccountSkipped = () => {
    handleNextSlide();
  };

  const handleIntroductionComplete = async () => {
    if (isCompleting) return; // Prevent multiple calls
    
    try {
      setIsCompleting(true);
      console.log('[ONBOARDING] Starting completion process...');
      
      // Mark introduction as completed
      await markIntroductionCompleted();
      console.log('[ONBOARDING] markIntroductionCompleted() finished');
      
      // Verify it was actually saved
      const completed = await hasCompletedIntroduction();
      console.log('[ONBOARDING] Verification check - introduction completed:', completed);
      
      if (!completed) {
        console.error('[ONBOARDING] WARNING: Introduction completion was not saved properly!');
      }
      
      // Wait longer to ensure AsyncStorage write is fully complete
      console.log('[ONBOARDING] Waiting before navigation...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[ONBOARDING] Navigating to persona selection...');
      
      // Navigate to persona selection
      router.replace('/persona-selection');
    } catch (error) {
      console.error('Error marking introduction as complete:', error);
      // Still navigate even if storage fails
      router.replace('/persona-selection');
    } finally {
      setIsCompleting(false);
    }
  };

  const onIndexChanged = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <ThemedView style={styles.container}>
      <Swiper
        ref={swiperRef}
        style={styles.wrapper}
        showsButtons={false}
        showsPagination={true}
        dot={<ThemedView style={styles.dot} />}
        activeDot={<ThemedView style={[styles.dot, styles.activeDot]} />}
        paginationStyle={styles.pagination}
        loop={false}
        index={0}
        onIndexChanged={onIndexChanged}
        scrollEnabled={false} // Disable manual swiping, control via buttons
      >
        {/* Slide 1: Welcome */}
        <WelcomeSlide onNext={handleNextSlide} />
        
        {/* Slide 2: Purpose */}
        <PurposeSlide onNext={handleNextSlide} />
        
        {/* Slide 3: Personalization */}
        <PersonalizationSlide 
          onNext={handleNextSlide}
          onSkip={handleSkipSlide}
          onTopicsSelected={handleTopicsSelected}
        />
        
        {/* Slide 4: Account Creation */}
        <AccountSlide 
          onAccountCreated={handleAccountCreated}
          onSkip={handleAccountSkipped}
        />
        
        {/* Slide 5: Get Started */}
        <GetStartedSlide 
          onGetStarted={handleIntroductionComplete}
          isLoading={isCompleting}
        />
      </Swiper>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wrapper: {},
  pagination: {
    bottom: 40,
  },
  dot: {
    backgroundColor: Colors.tabIconDefault,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: Colors.tint,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}); 