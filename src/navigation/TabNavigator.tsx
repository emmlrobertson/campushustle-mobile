import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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

const linking: LinkingOptions<any> = {
  enabled: true,
  prefixes: [
    'campushustle://',
    ...(typeof window !== 'undefined' && window.location?.origin ? [window.location.origin] : []),
  ],
  config: {
    screens: {
      Home: {
        path: '',
        screens: {
          HomeScreen: '',
          HustleDetail: 'hustle/:hustleId',
        },
      },
      Explore: {
        path: 'explore',
        screens: {
          ExploreScreen: '',
          HustleDetail: 'hustle/:hustleId',
        },
      },
      Post: 'post',
      Favorites: {
        path: 'saved',
        screens: {
          FavoritesScreen: '',
          HustleDetail: 'hustle/:hustleId',
        },
      },
      Profile: 'profile',
    },
  },
};

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
    <NavigationContainer
      linking={linking}
      documentTitle={{
        formatter: (_options, route) => {
          if (route?.name === 'HustleDetail') return 'Service | CampusHustle';
          if (route?.name === 'Post') return 'Post a Service | CampusHustle';
          if (route?.name === 'Profile') return 'Profile | CampusHustle';
          if (route?.name === 'Favorites' || route?.name === 'FavoritesScreen') {
            return 'Saved | CampusHustle';
          }
          if (route?.name === 'Explore' || route?.name === 'ExploreScreen') {
            return 'Explore | CampusHustle';
          }
          return 'CampusHustle';
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Explore') iconName = focused ? 'compass' : 'compass-outline';
            else if (route.name === 'Post') return null;
            else if (route.name === 'Favorites') iconName = focused ? 'bookmark' : 'bookmark-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={22} color={color} />
                {focused && <View style={styles.activeBar} />}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Explore" component={ExploreStackScreen} options={{ tabBarLabel: 'Explore' }} />

        {/* Central Prominent Green '+' Post Button matching screenshots */}
        <Tab.Screen
          name="Post"
          component={PostHustleScreen}
          options={{
            tabBarLabel: 'Post',
            tabBarButton: ({ children: _children, style: _style, ...rest }) => (
              <View style={styles.fabWrapper}>
                <TouchableOpacity
                  {...rest}
                  style={styles.floatingPostBtn}
                  activeOpacity={0.88}
                >
                  <Ionicons name="add" size={26} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBar: {
    width: 16,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 3,
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  floatingPostBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.fab,
  },
  fabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 3,
  },
});
