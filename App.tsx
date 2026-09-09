import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HustleProvider, useHustleContext } from './src/context/HustleContext';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AuthModal } from './src/components/AuthModal';

function MainAppContent() {
  const { authModalVisible, setAuthModalVisible, loginUser } = useHustleContext();

  return (
    <>
      <StatusBar style="dark" />
      <TabNavigator />
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={(user, token) => {
          loginUser(user, token);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <HustleProvider>
        <MainAppContent />
      </HustleProvider>
    </SafeAreaProvider>
  );
}
