# Current Import Map - Reference for Refactor
## Mobile App @/src imports:
Socratic-Mobile/app/persona-selection.tsx:import { personas, PersonaUI } from '@/src/constants/personas';
Socratic-Mobile/app/persona-selection.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/app/persona-selection.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/app/persona-selection.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/app/persona-selection.tsx:import { ThemedCard } from '@/src/components/ThemedCard';
Socratic-Mobile/app/persona-selection.tsx:import { ThemedButton } from '@/src/components/ThemedButton';
Socratic-Mobile/app/persona-selection.tsx:import { analyticsService } from '@/src/services/analytics';
Socratic-Mobile/app/persona-selection.tsx:import { useAuth } from '@/src/context/AuthContext';
Socratic-Mobile/app/login.tsx:import LoginScreen from '@/src/screens/LoginScreen'; // Adjust path if needed (e.g., ../src/screens/LoginScreen)
Socratic-Mobile/app/(tabs)/index.tsx:import { useAuth } from '@/src/context/AuthContext';
Socratic-Mobile/app/(tabs)/index.tsx:import apiClientInstance from '@/src/services/api';
Socratic-Mobile/app/(tabs)/index.tsx:import { analyticsService } from '@/src/services/analytics';
Socratic-Mobile/app/(tabs)/index.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/app/(tabs)/index.tsx:import ChatHeader from '@/src/components/ChatHeader';
Socratic-Mobile/app/(tabs)/index.tsx:import { personas, getDefaultPersona, PersonaUI } from '@/src/constants/personas';
Socratic-Mobile/app/(tabs)/index.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/app/(tabs)/index.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/app/(tabs)/index.tsx:import { spacing, shadows } from '@/src/constants/spacingAndShadows';
Socratic-Mobile/app/(tabs)/index.tsx:import VoiceMessageInput from '@/src/components/VoiceMessageInput';
Socratic-Mobile/app/(tabs)/info.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/app/(tabs)/info.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/app/(tabs)/info.tsx:import { ThemedButton } from '@/src/components/ThemedButton';
Socratic-Mobile/app/(tabs)/info.tsx:import { ThemedCard } from '@/src/components/ThemedCard';
Socratic-Mobile/app/(tabs)/info.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/app/(tabs)/profile.tsx:import { useAuth } from '@/src/context/AuthContext';
Socratic-Mobile/app/(tabs)/profile.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/app/(tabs)/profile.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/app/(tabs)/profile.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/app/(tabs)/profile.tsx:import { ThemedButton } from '@/src/components/ThemedButton';
Socratic-Mobile/app/(tabs)/profile.tsx:import { ThemedCard } from '@/src/components/ThemedCard';
Socratic-Mobile/app/(tabs)/history.tsx:import { useAuth } from '@/src/context/AuthContext';
Socratic-Mobile/app/(tabs)/history.tsx:import apiClientInstance from '@/src/services/api';
Socratic-Mobile/app/(tabs)/history.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/app/(tabs)/history.tsx:import { personas, PersonaUI } from '@/src/constants/personas';
Socratic-Mobile/app/(tabs)/history.tsx:import { ThemedCard } from '@/src/components/ThemedCard';
Socratic-Mobile/app/(tabs)/history.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/app/(tabs)/history.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/app/(tabs)/history.tsx:import { ThemedButton } from '@/src/components/ThemedButton';
Socratic-Mobile/app/(tabs)/history.tsx:import { spacing, shadows } from '@/src/constants/spacingAndShadows';
Socratic-Mobile/app/(tabs)/_layout.tsx:import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
Socratic-Mobile/app/+not-found.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/app/+not-found.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/app/_layout.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/app/_layout.tsx:import { AuthProvider, useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
Socratic-Mobile/app/_layout.tsx:import { analyticsService } from '@/src/services/analytics';
Socratic-Mobile/app/_layout.tsx:    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'),
Socratic-Mobile/app/_layout.tsx:    'Lora-Bold': require('@/src/assets/fonts/Lora-Bold.ttf'),
Socratic-Mobile/app/_layout.tsx:    'Lora-SemiBold': require('@/src/assets/fonts/Lora-SemiBold.ttf'),
Socratic-Mobile/app/_layout.tsx:    'Inter-Regular': require('@/src/assets/fonts/Inter_24pt-Regular.ttf'),
Socratic-Mobile/src/constants/personas.ts:    // image: require('@/src/assets/images/socrates.png'), // Example
Socratic-Mobile/src/screens/LoginScreen.tsx:import { useAuth } from '@/src/context/AuthContext';
Socratic-Mobile/src/screens/LoginScreen.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/src/screens/LoginScreen.tsx:import { ThemedButton } from '@/src/components/ThemedButton';
Socratic-Mobile/src/screens/LoginScreen.tsx:import { ThemedCard } from '@/src/components/ThemedCard';
Socratic-Mobile/src/screens/LoginScreen.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/src/screens/LoginScreen.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/src/screens/LoginScreen.tsx:import { RandomQuote } from '@/src/components/RandomQuote';
Socratic-Mobile/src/components/ThemedText.tsx:import { useThemeColor } from '@/src/hooks/useThemeColor';
Socratic-Mobile/src/components/VoiceMessageInput.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/src/components/VoiceMessageInput.tsx:import { spacing } from '@/src/constants/spacingAndShadows';
Socratic-Mobile/src/components/VoiceMessageInput.tsx:import apiClient from '@/src/services/api';
Socratic-Mobile/src/components/VoiceMessageInput.tsx:import { analyticsService } from '@/src/services/analytics';
Socratic-Mobile/src/components/ThemedView.tsx:import { useThemeColor } from '@/src/hooks/useThemeColor';
Socratic-Mobile/src/components/ThemedView.tsx:import { shadows, spacing } from '@/src/constants/spacingAndShadows';
Socratic-Mobile/src/components/ChatHeader.tsx:import { useAuth } from '@/src/context/AuthContext'; // Adjust path if needed
Socratic-Mobile/src/components/ChatHeader.tsx:import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
Socratic-Mobile/src/components/ChatHeader.tsx:import { spacing } from '@/src/constants/spacingAndShadows';
Socratic-Mobile/src/components/RandomQuote.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/src/components/MessageBubble.tsx:import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
Socratic-Mobile/src/components/ChatInput.tsx:import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
Socratic-Mobile/src/components/ThemedButton.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/src/components/ThemedButton.tsx:import { spacing, shadows } from '@/src/constants/spacingAndShadows';
Socratic-Mobile/src/components/Collapsible.tsx:import { ThemedText } from '@/src/components/ThemedText';
Socratic-Mobile/src/components/Collapsible.tsx:import { ThemedView } from '@/src/components/ThemedView';
Socratic-Mobile/src/components/Collapsible.tsx:import { IconSymbol } from '@/src/components/ui/IconSymbol';
Socratic-Mobile/src/components/Collapsible.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/src/components/ThemedCard.tsx:import { Colors } from '@/src/constants/Colors';
Socratic-Mobile/src/hooks/useThemeColor.ts:import { Colors } from '@/src/constants/Colors';
