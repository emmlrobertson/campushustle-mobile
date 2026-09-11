import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CampusId, CategoryId, Hustle, StudentProfile } from '../types';
import { fetchHustlesFromApi, createHustleInApi, deleteHustleInApi } from '../services/api';
import { INITIAL_HUSTLES } from '../data/mockData';

const STORAGE_KEYS = {
  USER: '@campushustle_user',
  TOKEN: '@campushustle_token',
  FAVORITES: '@campushustle_favorites',
};

interface HustleContextType {
  hustles: Hustle[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: CategoryId;
  selectedLocation: string;
  selectedCampus: CampusId;
  filteredHustles: Hustle[];
  isLoading: boolean;
  user: StudentProfile | null;
  token: string | null;
  authModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  loginUser: (user: StudentProfile, token: string) => void;
  logoutUser: () => void;
  addHustle: (newHustleData: Omit<Hustle, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  deleteHustle: (id: string) => void;
  updateHustleStatus: (id: string, status: 'OPEN' | 'BUSY') => void;
  updateHustleRating: (id: string, rating: number, reviewCount: number) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: CategoryId) => void;
  setSelectedLocation: (location: string) => void;
  setSelectedCampus: (campus: CampusId) => void;
  refreshHustles: () => void;
}

const HustleContext = createContext<HustleContextType | undefined>(undefined);

export const HustleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hustles, setHustles] = useState<Hustle[]>(INITIAL_HUSTLES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('knust');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication State
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // 1. Initialize persistent session & favorites from AsyncStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedUser, savedToken, savedFavs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        ]);

        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }
        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }
      } catch (err) {
        console.warn('Failed to restore persistent session:', err);
      }
    };

    restoreSession();
  }, []);

  const loadHustles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchHustlesFromApi({ campus: selectedCampus });
      if (data && data.length > 0) {
        const mergedMap = new Map<string, Hustle>();
        INITIAL_HUSTLES.forEach((h) => mergedMap.set(h.id, h));
        data.forEach((h) => mergedMap.set(h.id, h));
        setHustles(Array.from(mergedMap.values()));
      } else {
        setHustles(INITIAL_HUSTLES);
      }
    } catch (e) {
      setHustles(INITIAL_HUSTLES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHustles();
  }, [selectedCampus]);

  const setSelectedCampusWithReset = (campus: CampusId) => {
    setSelectedCampus(campus);
    setSelectedLocation('All Locations');
    setSearchQuery('');
  };

  const loginUser = (newUser: StudentProfile, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken).catch(() => {});
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    AsyncStorage.removeItem(STORAGE_KEYS.USER).catch(() => {});
    AsyncStorage.removeItem(STORAGE_KEYS.TOKEN).catch(() => {});
  };

  const addHustle = async (newHustleData: Omit<Hustle, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const localNewHustle: Hustle = {
      ...newHustleData,
      id: `hst_${Date.now()}`,
      sellerId: user?.id,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewCount: 1,
      isMyListing: true,
      status: 'OPEN',
    };

    // Optimistic UI update
    setHustles((prev) => [localNewHustle, ...prev]);

    // Send to backend API with JWT token for verified seller attribution
    try {
      await createHustleInApi(newHustleData, token || undefined);
      loadHustles();
    } catch (e) {
      console.log('Server update notice:', e);
    }
  };

  const deleteHustle = async (id: string) => {
    // Optimistic UI removal
    setHustles((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));

    // Persist deletion to backend if token exists
    if (token) {
      try {
        await deleteHustleInApi(id, token);
      } catch (err) {
        console.warn('Failed to delete on server:', err);
      }
    }
  };

  const updateHustleStatus = (id: string, status: 'OPEN' | 'BUSY') => {
    setHustles((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status } : h))
    );
  };

  const updateHustleRating = (id: string, rating: number, reviewCount: number) => {
    setHustles((prev) =>
      prev.map((h) => (h.id === id ? { ...h, rating, reviewCount } : h))
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const filteredHustles = useMemo(() => {
    return hustles.map((hustle) => {
      // Accurately compute isMyListing based on authenticated student user id
      const isOwner = Boolean(user && hustle.sellerId && hustle.sellerId === user.id);
      return {
        ...hustle,
        isMyListing: isOwner || hustle.isMyListing || false,
      };
    }).filter((hustle) => {
      if (hustle.campus !== selectedCampus) return false;

      if (selectedCategory !== 'all' && hustle.category !== selectedCategory) {
        return false;
      }

      if (
        selectedLocation !== 'All Locations' &&
        !hustle.hostelLocation.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = hustle.title.toLowerCase().includes(query);
        const matchesDesc = hustle.description.toLowerCase().includes(query);
        const matchesSeller = hustle.sellerName.toLowerCase().includes(query);
        const matchesTags = hustle.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesHostel = hustle.hostelLocation.toLowerCase().includes(query);

        return matchesTitle || matchesDesc || matchesSeller || matchesTags || matchesHostel;
      }

      return true;
    });
  }, [hustles, selectedCampus, selectedCategory, selectedLocation, searchQuery, user]);

  return (
    <HustleContext.Provider
      value={{
        hustles,
        favorites,
        searchQuery,
        selectedCategory,
        selectedLocation,
        selectedCampus,
        filteredHustles,
        isLoading,
        user,
        token,
        authModalVisible,
        setAuthModalVisible,
        loginUser,
        logoutUser,
        addHustle,
        deleteHustle,
        updateHustleStatus,
        updateHustleRating,
        toggleFavorite,
        isFavorite,
        setSearchQuery,
        setSelectedCategory,
        setSelectedLocation,
        setSelectedCampus: setSelectedCampusWithReset,
        refreshHustles: loadHustles,
      }}
    >
      {children}
    </HustleContext.Provider>
  );
};

export const useHustleContext = () => {
  const context = useContext(HustleContext);
  if (!context) {
    throw new Error('useHustleContext must be used within a HustleProvider');
  }
  return context;
};
