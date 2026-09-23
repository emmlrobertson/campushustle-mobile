import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HustleDetailScreen } from '../screens/HustleDetailScreen';
import { PostHustleScreen } from '../screens/PostHustleScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, shadows } from '../theme/colors';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="HustleDetail" component={HustleDetailScreen} />
    </HomeStack.Navigator>
  );
}

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreScreen" component={ExploreScreen} />
      <ExploreStack.Screen name="HustleDetail" component={HustleDetailScreen} />
    </ExploreStack.Navigator>
  );
}

function FavoritesStackScreen() {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <FavoritesStack.Screen name="HustleDetail" component={HustleDetailScreen} />
    </FavoritesStack.Navigator>
  );
}

export function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary, // #0D6535 Forest Green from Figma
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused }) => {
            let iconGlyph = '🏠';
            if (route.name === 'Home') iconGlyph = '🏠';
            else if (route.name === 'Explore') iconGlyph = '🧭';
            else if (route.name === 'Post') return null; // Rendered by central FAB
            else if (route.name === 'Favorites') iconGlyph = focused ? '🔖' : '🏷️';
            else if (route.name === 'Profile') iconGlyph = '👤';

            return (
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: focused ? 18 : 16 }}>{iconGlyph}</Text>
                {focused && <View style={styles.activeBar} />}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Explore" component={ExploreStackScreen} options={{ tabBarLabel: 'Explore' }} />

        {/* Central Prominent Forest Green Floating '+' Post Button (Figma) */}
        <Tab.Screen
          name="Post"
          component={PostHustleScreen}
          options={{
            tabBarLabel: 'Post',
            tabBarButton: (props) => (
              <View style={styles.fabWrapper}>
                <TouchableOpacity
                  style={styles.floatingPostBtn}
                  onPress={props.onPress}
                  activeOpacity={0.88}
                >
                  <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>
                <Text style={styles.fabLabel}>Post</Text>
              </View>
            ),
          }}
        />

        <Tab.Screen name="Favorites" component={FavoritesStackScreen} options={{ tabBarLabel: 'Saved' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    height: Platform.OS === 'ios' ? 72 : 64,
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBar: {
    width: 14,
    height: 3,
    backgroundColor: colors.primary, // #0D6535
    borderRadius: 2,
    marginTop: 3,
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
  },
  floatingPostBtn: {
    width: 48,
    height: 48,
    borderRadius: 16, // Rounded square/pill matching Figma
    backgroundColor: colors.primary, // #0D6535
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.fab,
  },
  plusIcon: {
    color: colors.textWhite,
    fontSize: 26,
    fontWeight: '500',
    marginTop: -2,
  },
  fabLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
});
