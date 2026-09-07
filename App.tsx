import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HustleProvider } from './src/context/HustleContext';
import { TabNavigator } from './src/navigation/TabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <HustleProvider>
        <StatusBar style="light" />
        <TabNavigator />
      </HustleProvider>
    </SafeAreaProvider>
  );
}
