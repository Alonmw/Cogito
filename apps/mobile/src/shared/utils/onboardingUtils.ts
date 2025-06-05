import AsyncStorage from '@react-native-async-storage/async-storage';

export const INTRODUCTION_COMPLETED_KEY = 'hasCompletedIntroduction';
export const SELECTED_TOPICS_KEY = 'selectedTopics';

/**
 * Check if the user has completed the introduction
 */
export const hasCompletedIntroduction = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(INTRODUCTION_COMPLETED_KEY);
    const result = completed === 'true';
    console.log('[ONBOARDING_UTILS] hasCompletedIntroduction() - stored value:', completed, 'returning:', result);
    return result;
  } catch (error) {
    console.error('Error checking introduction status:', error);
    return false;
  }
};

/**
 * Mark the introduction as completed
 */
export const markIntroductionCompleted = async (): Promise<void> => {
  try {
    console.log('[ONBOARDING_UTILS] markIntroductionCompleted() - setting value to "true"');
    await AsyncStorage.setItem(INTRODUCTION_COMPLETED_KEY, 'true');
    console.log('[ONBOARDING_UTILS] markIntroductionCompleted() - AsyncStorage.setItem completed');
    
    // Immediately verify the write
    const verification = await AsyncStorage.getItem(INTRODUCTION_COMPLETED_KEY);
    console.log('[ONBOARDING_UTILS] markIntroductionCompleted() - verification read:', verification);
  } catch (error) {
    console.error('Error marking introduction as completed:', error);
  }
};

/**
 * Reset the introduction status (useful for development/testing)
 */
export const resetIntroductionStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(INTRODUCTION_COMPLETED_KEY);
    console.log('[ONBOARDING_UTILS] resetIntroductionStatus() - completed');
  } catch (error) {
    console.error('Error resetting introduction status:', error);
  }
};

/**
 * Get the user's selected philosophy topics
 */
export const getSelectedTopics = async (): Promise<string[]> => {
  try {
    const topics = await AsyncStorage.getItem(SELECTED_TOPICS_KEY);
    return topics ? JSON.parse(topics) : [];
  } catch (error) {
    console.error('Error getting selected topics:', error);
    return [];
  }
};

/**
 * Save the user's selected philosophy topics
 */
export const saveSelectedTopics = async (topics: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SELECTED_TOPICS_KEY, JSON.stringify(topics));
  } catch (error) {
    console.error('Error saving selected topics:', error);
  }
};

/**
 * Debug function to log all onboarding-related AsyncStorage values
 */
export const debugOnboardingStorage = async (): Promise<void> => {
  try {
    const introCompleted = await AsyncStorage.getItem(INTRODUCTION_COMPLETED_KEY);
    const topics = await AsyncStorage.getItem(SELECTED_TOPICS_KEY);
    
    console.log('[ONBOARDING_DEBUG] Introduction completed:', introCompleted);
    console.log('[ONBOARDING_DEBUG] Selected topics:', topics);
  } catch (error) {
    console.error('[ONBOARDING_DEBUG] Error reading storage:', error);
  }
}; 