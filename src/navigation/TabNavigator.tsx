import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HustleDetailScreen } from '../screens/HustleDetailScreen';
import { PostHustleScreen } from '../screens/PostHustleScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

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
          tabBarActiveTintColor: '#059669', // Emerald Green from Figma
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused }) => {
            let iconName = '🏠';
            if (route.name === 'Home') iconName = '🏠';
            else if (route.name === 'Explore') iconName = '🧭';
            else if (route.name === 'Post') return null; // Handled by custom button
            else if (route.name === 'Favorites') iconName = focused ? '❤️' : '🤍';
            else if (route.name === 'Profile') iconName = '👤';

            return (
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: focused ? 18 : 16 }}>{iconName}</Text>
                {focused && <View style={styles.activeBar} />}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} options={{ tabBarLabel: 'Feed' }} />
        <Tab.Screen name="Explore" component={ExploreStackScreen} options={{ tabBarLabel: 'Explore' }} />
        
        {/* Central Big Elevated Floating Green '+' Post Button */}
        <Tab.Screen
          name="Post"
          component={PostHustleScreen}
          options={{
            tabBarLabel: 'Post',
            tabBarButton: (props) => (
              <TouchableOpacity
                style={styles.floatingPostBtn}
                onPress={props.onPress}
                activeOpacity={0.85}
              >
                <Text style={styles.plusIcon}>+</Text>
              </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBar: {
    width: 14,
    height: 3,
    backgroundColor: '#059669', // Emerald Green indicator bar
    borderRadius: 2,
    marginTop: 2,
  },
  floatingPostBtn: {
    top: -16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#059669', // Big Emerald Green Floating '+' Button from Figma
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    marginTop: -2,
  },
});
