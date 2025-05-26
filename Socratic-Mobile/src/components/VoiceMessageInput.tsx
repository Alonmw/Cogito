import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Conditional imports with fallbacks for development
let Audio: any = null;
let Haptics: any = null;
let FileSystem: any = null;

try {
  Audio = require('expo-av').Audio;
  Haptics = require('expo-haptics');
  FileSystem = require('expo-file-system');
  console.log('✅ Native modules loaded successfully');
} catch (error) {
  console.warn('❌ Native modules not available, voice recording will be disabled:', error);
}
import { Colors } from '@/src/constants/Colors';
import { spacing } from '@/src/constants/spacingAndShadows';

interface VoiceMessageInputProps {
  onVoiceMessageReady: (transcript: string) => void;
  isDisabled?: boolean;
  hasText: boolean;
  onSendPress: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const CANCEL_THRESHOLD = -screenWidth * 0.6; // Need to slide 60% of screen width to cancel
const MAX_RECORDING_DURATION_SECONDS = 120; // 2 minutes

const VoiceMessageInput: React.FC<VoiceMessageInputProps> = ({
  onVoiceMessageReady,
  isDisabled = false,
  hasText,
  onSendPress,
  onRecordingStateChange,
}) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);
  const [recording, setRecording] = useState<any | null>(null);
  const [showCancelZone, setShowCancelZone] = useState(false);
  const [isGestureOverCancelZone, setIsGestureOverCancelZone] = useState(false);

  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const cancelZoneOpacity = useRef(new Animated.Value(0)).current;
  const micButtonScale = useRef(new Animated.Value(1)).current;

  // Refs
  const durationIntervalId = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false); // Synchronous tracking for PanResponder
  const recordingRef = useRef<any | null>(null); // Keep a ref to the recording for cleanup
  const isGestureOverCancelZoneRef = useRef(false); // Synchronous tracking for cancel zone state
  const pressStartTime = useRef<number | null>(null); // Track press start time for short press detection
  const shortPressTimeoutId = useRef<NodeJS.Timeout | null>(null); // Timeout to auto-cancel short recordings

  // Cleanup function
  const cleanupRecording = async () => {
    console.log('🧹 Cleaning up recording resources');
    
    // Clear timers first
    if (durationIntervalId.current) {
      clearInterval(durationIntervalId.current);
      durationIntervalId.current = null;
    }
    
    if (shortPressTimeoutId.current) {
      clearTimeout(shortPressTimeoutId.current);
      shortPressTimeoutId.current = null;
    }
    
    // Reset states immediately
    setIsRecording(false);
    isRecordingRef.current = false;
    setShowCancelZone(false);
    setIsGestureOverCancelZone(false);
    isGestureOverCancelZoneRef.current = false;
    
    // Clean up recording object FIRST and SYNCHRONOUSLY
    const currentRecording = recording || recordingRef.current;
    setRecording(null); // Clear the state immediately
    recordingRef.current = null; // Clear the ref immediately
    
    if (currentRecording) {
      try {
        console.log('🧹 Stopping and unloading recording object...');
        await currentRecording.stopAndUnloadAsync();
        console.log('✅ Recording object cleaned up successfully');
      } catch (error) {
        console.warn('⚠️ Error during recording cleanup:', error);
        // Force cleanup even if there's an error
        try {
          await currentRecording.stopAndUnloadAsync();
        } catch (secondError) {
          console.error('❌ Failed to cleanup recording on second attempt:', secondError);
        }
      }
    }
    
    // Stop animations (recordingDotScale no longer used)
    
    // Reset animations (micButtonScale and pan are handled in PanResponder)
    Animated.timing(cancelZoneOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    console.log('🧹 Cleanup completed');
  };

  // Request audio permissions
  const getAudioPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setAudioPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      setAudioPermissionGranted(false);
      return false;
    }
  };

  // Setup audio mode
  useEffect(() => {
    const setupAudio = async () => {
      if (!Audio) {
        console.warn('Audio module not available, skipping audio setup');
        return;
      }
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    setupAudio();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up recording');
      cleanupRecording();
    };
  }, []);

  // Notify parent of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

  // Debug: Log cancel zone state changes
  useEffect(() => {
    console.log('🎯 isGestureOverCancelZone state changed to:', isGestureOverCancelZone);
  }, [isGestureOverCancelZone]);

  // Start recording
  const handleStartRecording = async () => {
    console.log('🎙️ handleStartRecording called', { isDisabled, hasText, isRecording, isRecordingRef: isRecordingRef.current, Audio: !!Audio, Haptics: !!Haptics });
    
    if (isDisabled || hasText || isRecordingRef.current) {
      console.log('❌ Recording blocked:', { isDisabled, hasText, alreadyRecording: isRecordingRef.current });
      return;
    }

    // Check if native modules are available
    if (!Audio || !Haptics) {
      console.log('❌ Native modules not available');
      Alert.alert(
        'Voice Recording Unavailable',
        'Voice recording requires a development build with native modules. Please rebuild the app with EAS.'
      );
      return;
    }

    // Check permissions
    if (audioPermissionGranted === null) {
      const granted = await getAudioPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is required to record voice messages.'
        );
        return;
      }
    } else if (!audioPermissionGranted) {
      Alert.alert(
        'Permission Required',
        'Microphone access is required to record voice messages.'
      );
      return;
    }

    try {
      // Force cleanup any existing recording first
      if (recording) {
        console.log('🧹 Force cleaning up existing recording before starting new one');
        await cleanupRecording();
        // Add a small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Haptic feedback for start
      if (Haptics) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Create recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      recordingRef.current = newRecording; // Keep a ref for cleanup
      setIsRecording(true);
      isRecordingRef.current = true; // Set synchronous flag immediately
      setRecordingDuration(0);
      setShowCancelZone(true);

      // Animate cancel zone in
      Animated.timing(cancelZoneOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate mic button scale
      Animated.timing(micButtonScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Recording dot stays static (no pulsing animation)

      // Start duration timer
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_RECORDING_DURATION_SECONDS) {
            handleStopRecordingAndProcess(true, recording || recordingRef.current);
            return prev;
          }
          return newDuration;
        });
      }, 1000);

      durationIntervalId.current = intervalId;
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // Clean up everything if recording failed to start
      await cleanupRecording();
      
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  };

  // Stop recording and process
  const handleStopRecordingAndProcess = async (wasAutoStopped: boolean = false, recordingToStop?: any) => {
    const currentRecording = recordingToStop || recording;
    if (!currentRecording) return;

    if (wasAutoStopped) {
      Alert.alert(
        'Recording Limit Reached',
        `Recording stopped automatically after ${MAX_RECORDING_DURATION_SECONDS} seconds.`
      );
      if (Haptics) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }

    try {
      // Stop recording and get URI first
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      // Manual cleanup for processing (don't use full cleanupRecording)
      // Clear timer
      if (durationIntervalId.current) {
        clearInterval(durationIntervalId.current);
        durationIntervalId.current = null;
      }
      
      // Reset remaining states (isRecording and isRecordingRef already set in PanResponder)
      setShowCancelZone(false);
      setRecording(null);
      recordingRef.current = null;
      
      // Stop animations (recordingDotScale no longer used)
      
      // Reset animations (pan and micButtonScale are handled in PanResponder)
      Animated.timing(cancelZoneOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      if (uri) {
        console.log('Recording stopped and stored at', uri);
        setIsProcessingAudio(true);
        // TODO: Process audio for STT in next phase
        // For now, just simulate processing
        setTimeout(() => {
          setIsProcessingAudio(false);
          onVoiceMessageReady('Voice message transcription will be implemented in the next phase.');
        }, 2000);
      } else {
        Alert.alert('Error', 'Could not get recording data.');
        setIsProcessingAudio(false);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Could not stop recording.');
      setIsProcessingAudio(false);
      await cleanupRecording(); // Ensure cleanup even on error
    }
  };

  // Cancel recording
  const handleCancelRecording = async () => {
    console.log('Recording cancelled by user.');
    
    if (Haptics) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Get the recording URI before cleanup for file deletion
    let recordingUri: string | null = null;
    if (recording) {
      try {
        recordingUri = recording.getURI();
      } catch (error) {
        console.warn('Could not get recording URI for cleanup:', error);
      }
    }

    // Manual cleanup for cancellation (states already set in PanResponder)
    // Clear timer
    if (durationIntervalId.current) {
      clearInterval(durationIntervalId.current);
      durationIntervalId.current = null;
    }
    
    // Reset remaining states
    setShowCancelZone(false);
    setIsGestureOverCancelZone(false);
    isGestureOverCancelZoneRef.current = false;
    
    // Clean up recording object
    const currentRecording = recording || recordingRef.current;
    setRecording(null);
    recordingRef.current = null;
    
    if (currentRecording) {
      try {
        console.log('🧹 Stopping and unloading cancelled recording object...');
        await currentRecording.stopAndUnloadAsync();
        console.log('✅ Cancelled recording object cleaned up successfully');
      } catch (error) {
        console.warn('⚠️ Error during cancelled recording cleanup:', error);
      }
    }
    
    // Stop animations (recordingDotScale no longer used)
    
    // Reset animations (pan and micButtonScale are handled in PanResponder)
    Animated.timing(cancelZoneOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Delete the audio file if we got the URI
    if (recordingUri && FileSystem) {
      try {
        await FileSystem.deleteAsync(recordingUri, { idempotent: true });
        console.log('🗑️ Deleted cancelled audio file');
      } catch (error) {
        console.warn('Could not delete cancelled audio file:', error);
      }
    }
    
    console.log('🧹 Cancel cleanup completed');
  };

  // PanResponder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('🎤 Microphone button pressed', { hasText, isProcessingAudio, isDisabled, Audio: !!Audio, Haptics: !!Haptics });
        // Check current state values (not captured at creation time)
        if (hasText || isProcessingAudio || isDisabled) {
          console.log('❌ Recording blocked due to current state');
          return;
        }
        // Record press start time for short press detection
        pressStartTime.current = Date.now();
        
        // Set up auto-cancel timeout for quick taps
        shortPressTimeoutId.current = setTimeout(() => {
          if (isRecordingRef.current && pressStartTime.current) {
            const pressDuration = Date.now() - pressStartTime.current;
            if (pressDuration < 500) {
              console.log('⚡ Auto-cancelling recording (quick tap timeout)');
              handleCancelRecording();
            }
          }
        }, 500); // Check after 0.5 seconds
        
        handleStartRecording();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Double-check state hasn't changed during gesture
        if (!isRecordingRef.current || isProcessingAudio || hasText || isDisabled) return;

        // Constrain movement to horizontal only and limit the range
        const constrainedX = Math.max(gestureState.dx, -screenWidth * 0.8); // Don't let it go beyond 80% of screen
        pan.setValue({ x: constrainedX, y: 0 });

        // Check if over cancel threshold
        if (gestureState.dx < CANCEL_THRESHOLD) {
          if (!isGestureOverCancelZoneRef.current) {
            console.log('🔴 Entering cancel zone');
            isGestureOverCancelZoneRef.current = true;
            setIsGestureOverCancelZone(true);
            if (Haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        } else {
          if (isGestureOverCancelZoneRef.current) {
            console.log('🟢 Exiting cancel zone');
            isGestureOverCancelZoneRef.current = false;
            setIsGestureOverCancelZone(false);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('🎤 Microphone button released', { isRecording, isRecordingRef: isRecordingRef.current, isProcessingAudio, gestureState: gestureState.dx });
        
        if (!isRecordingRef.current) {
          console.log('❌ Not recording, ignoring release');
          // Still reset button position and scale even if not recording
          pan.setValue({ x: 0, y: 0 });
          micButtonScale.setValue(1);
          
          Animated.timing(pan, {
            toValue: { x: 0, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start();
          
          Animated.timing(micButtonScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
          return;
        }

        // Additional safety check - if processing started during gesture, cancel
        if (isProcessingAudio) {
          console.log('❌ Processing already started, ignoring release');
          return;
        }

        // Immediately reset button position and scale FIRST
        // Set values immediately for instant visual feedback
        pan.setValue({ x: 0, y: 0 });
        micButtonScale.setValue(1);
        
        // Then animate smoothly to ensure clean transitions
        Animated.timing(pan, {
          toValue: { x: 0, y: 0 },
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(micButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Clear the auto-cancel timeout since we're handling the release manually
        if (shortPressTimeoutId.current) {
          clearTimeout(shortPressTimeoutId.current);
          shortPressTimeoutId.current = null;
        }
        
        // Check for short press (less than 0.5 seconds)
        const pressDuration = pressStartTime.current ? Date.now() - pressStartTime.current : 0;
        const isShortPress = pressDuration < 500; // 0.5 seconds
        
        console.log('📏 Press duration:', pressDuration, 'ms, isShortPress:', isShortPress);

        // Capture the current recording before clearing states
        const currentRecording = recording || recordingRef.current;

        // Immediately update UI states to stop recording appearance
        setIsRecording(false);
        isRecordingRef.current = false;
        setIsGestureOverCancelZone(false);
        isGestureOverCancelZoneRef.current = false;
        pressStartTime.current = null; // Reset press time

        if (gestureState.dx < CANCEL_THRESHOLD) {
          console.log('🗑️ Cancelling recording (slide to cancel)');
          handleCancelRecording();
        } else if (isShortPress) {
          console.log('⚡ Cancelling recording (short press)');
          handleCancelRecording();
        } else {
          console.log('✅ Stopping and processing recording');
          handleStopRecordingAndProcess(false, currentRecording);
        }
      },
      onPanResponderTerminate: () => {
        console.log('🎤 Gesture terminated', { isRecordingRef: isRecordingRef.current, isProcessingAudio });
        
        // Always reset button position when gesture is terminated
        // Set values immediately for instant visual feedback
        pan.setValue({ x: 0, y: 0 });
        micButtonScale.setValue(1);
        
        // Then animate smoothly to ensure clean transitions
        Animated.timing(pan, {
          toValue: { x: 0, y: 0 },
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(micButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // Clear the auto-cancel timeout
        if (shortPressTimeoutId.current) {
          clearTimeout(shortPressTimeoutId.current);
          shortPressTimeoutId.current = null;
        }
        
        if (isRecordingRef.current && !isProcessingAudio) {
          handleCancelRecording();
        }
        setIsGestureOverCancelZone(false);
        isGestureOverCancelZoneRef.current = false;
        pressStartTime.current = null; // Reset press time
      },
    })
  ).current;



  // Render cancel zone
  const renderCancelZone = () => {
    if (!showCancelZone) return null;

    return (
      <>
        {/* Background cancel zone */}
        <Animated.View
          style={[
            styles.cancelZone,
            {
              opacity: cancelZoneOpacity,
              backgroundColor: isGestureOverCancelZone 
                ? 'rgba(255, 107, 107, 0.9)' // Active state with red background
                : '#F5E9D7', // Solid parchment background to hide input
              borderWidth: 1,
              borderColor: isGestureOverCancelZone 
                ? 'rgba(255, 107, 107, 0.9)'
                : 'rgba(255, 107, 107, 0.3)',
            },
          ]}
        >
          <Ionicons
            name="trash"
            size={28}
            color={isGestureOverCancelZone ? '#FFF' : '#FF6B6B'}
          />
          <Text
            style={[
              styles.cancelText,
              { color: isGestureOverCancelZone ? '#FFF' : '#FF6B6B' },
            ]}
          >
            {isGestureOverCancelZone ? 'Release to Cancel' : '← Slide to Cancel'}
          </Text>
        </Animated.View>
        

        
        {/* Dynamic arrow that follows finger */}
        <Animated.View
          style={[
            styles.slideArrow,
            {
              opacity: cancelZoneOpacity,
              transform: [
                { translateX: Animated.multiply(pan.x, 0.5) }, // Move arrow at half the speed of finger
              ],
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isGestureOverCancelZone ? '#FF6B6B' : '#999'}
          />
        </Animated.View>
      </>
    );
  };





  return (
    <View style={styles.container}>
      {renderCancelZone()}
      
      <View style={styles.buttonContainer}>
        {hasText || isProcessingAudio ? (
          // Send button
          <TouchableOpacity
            style={[styles.sendButton, { opacity: isDisabled ? 0.5 : 1 }]}
            onPress={onSendPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {isProcessingAudio ? (
              <Ionicons name="hourglass" size={24} color="#fff" />
            ) : (
              <Ionicons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        ) : (
          // Microphone button
          <Animated.View
            style={[
              styles.micButtonInner,
              {
                backgroundColor: isRecording ? '#FF6B6B' : Colors.tint,
                opacity: (isDisabled || isProcessingAudio) ? 0.5 : 1,
                transform: [
                  { scale: micButtonScale },
                  ...(isRecording ? [{ translateX: pan.x }] : []),
                ],
                marginLeft: 8,
                marginRight: spacing.s,
                marginBottom: 5,
              },
            ]}
            {...panResponder.panHandlers}
            pointerEvents={isProcessingAudio || isDisabled ? 'none' : 'auto'}
            accessibilityRole="button"
            accessibilityLabel={
              isProcessingAudio 
                ? 'Processing voice message' 
                : isRecording 
                  ? 'Recording voice message' 
                  : 'Record voice message'
            }
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={24}
              color="#fff"
            />
            {/* Disabled overlay for extra visual feedback */}
            {(isProcessingAudio || isDisabled) && (
              <View style={styles.disabledOverlay} />
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: spacing.s,
    marginBottom: 5,
  },

  micButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelZone: {
    position: 'absolute',
    left: -screenWidth * 0.75, // Further adjusted to keep border visible
    top: 0,
    bottom: 0,
    width: screenWidth * 0.9, // Adjusted width to ensure border stays on screen
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 22,
    paddingLeft: spacing.m, // Reduced left padding to move content closer to left border
    paddingRight: spacing.m,
    backgroundColor: '#F5E9D7', // Solid background to hide input underneath
  },
  cancelText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },

  slideArrow: {
    position: 'absolute',
    right: screenWidth * 0.15,
    top: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },


  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 22,
  },
});

export default VoiceMessageInput; 