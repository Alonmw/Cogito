// app/(tabs)/profile.tsx
import React from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '@features/auth/AuthContext';
import { Colors } from '@shared/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@shared/components/ThemedView';
import { ThemedText } from '@shared/components/ThemedText';
import { ThemedButton } from '@shared/components/ThemedButton';
import { ThemedCard } from '@shared/components/ThemedCard';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut, isGuest, exitGuestMode, deleteAccount, isDeletingAccount, deleteAccountError } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const success = await deleteAccount();
              if (success) {
                Alert.alert(
                  'Account Deleted', 
                  'Your account has been permanently deleted.',
                  [
                    { 
                      text: 'OK', 
                      onPress: () => {
                        // Navigate to login screen
                        router.replace('/login');
                      }
                    }
                  ]
                );
              } else if (deleteAccountError) {
                Alert.alert('Deletion Failed', deleteAccountError);
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred while deleting your account.');
            }
          }
        },
      ]
    );
  };

  const navigateToLogin = () => {
    exitGuestMode();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ThemedView style={{ flex: 1, padding: 20 }}>
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 28 }}>
          Profile
        </ThemedText>
        {user ? (
          <ThemedCard style={{ marginBottom: 30, padding: 18 }}>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Email:</ThemedText>
            <ThemedText style={{ marginBottom: 16 }}>{user.email || 'N/A'}</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Display Name:</ThemedText>
            <ThemedText style={{ marginBottom: 16 }}>{user.displayName || '(Not Set)'}</ThemedText>
            <ThemedButton
              title="Logout"
              onPress={handleLogout}
              variant="primary"
              style={{ marginTop: 10 }}
            />
            <ThemedButton
              title={isDeletingAccount ? "Deleting Account..." : "Delete Account"}
              onPress={handleDeleteAccount}
              variant="primary"
              style={{ 
                marginTop: 15, 
                backgroundColor: isDeletingAccount ? '#999' : '#dc3545',
                opacity: isDeletingAccount ? 0.7 : 1
              }}
              disabled={isDeletingAccount}
            />
          </ThemedCard>
        ) : isGuest ? (
          <ThemedCard style={{ marginBottom: 30, alignItems: 'center', padding: 18 }}>
            <ThemedText style={{ marginBottom: 10, textAlign: 'center' }}>
              You are currently using the app as a guest.
            </ThemedText>
            <ThemedText style={{ marginBottom: 30, textAlign: 'center' }}>
              Log in or sign up to save history and access all features.
            </ThemedText>
            <ThemedButton
              title="Log In / Sign Up"
              onPress={navigateToLogin}
              variant="primary"
              style={{ marginTop: 10 }}
            />
          </ThemedCard>
        ) : (
          <ThemedText style={{ textAlign: 'center' }}>Not logged in.</ThemedText>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
