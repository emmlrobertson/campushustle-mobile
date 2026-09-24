import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CampusId, CategoryId, Hustle, StudentProfile } from '../types';
import { isUnfilteredLocation } from '../utils/hustle';
import {
  fetchHustlesFromApi,
  createHustleInApi,
  deleteHustleInApi,
  fetchCurrentUserApi,
  logoutStudentApi,
  toggleFavoriteApi,
  fetchFavoritesApi,
} from '../services/api';

const STORAGE_KEYS = {
  USER: '@campushustle_user',
  TOKEN: '@campushustle_token',
  FAVORITES: '@campushustle_favorites',
};

interface HustleContextType {
  hustles: Hustle[];
  favorites: string[];
  savedHustles: Hustle[];
  searchQuery: string;
  selectedCategory: CategoryId;
  selectedLocation: string;
  selectedCampus: CampusId;
  filteredHustles: Hustle[];
  isLoading: boolean;
  error: string | null;
  user: StudentProfile | null;
  token: string | null;
  authModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  loginUser: (user: StudentProfile, token: string) => void;
  logoutUser: () => void;
  addHustle: (newHustleData: Omit<Hustle, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Promise<any>;
  deleteHustle: (id: string) => Promise<void>;
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
  const [hustles, setHustles] = useState<Hustle[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedHustles, setSavedHustles] = useState<Hustle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('knust');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication State
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // 1. Initialize persistent session & favorites from AsyncStorage & server
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedUser, savedToken, savedFavs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        ]);

        if (savedFavs) {
          try {
            setFavorites(JSON.parse(savedFavs));
          } catch (e) {}
        }

        if (savedUser && savedToken) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setToken(savedToken);

            // Revalidate token against server (checks tokenVersion & active status)
            fetchCurrentUserApi(savedToken)
              .then((res) => {
                if (res?.user) {
                  setUser((prev) => ({ ...prev, ...res.user }));
                  AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user)).catch(() => {});
                }
              })
              .catch((err: any) => {
                // If token has been revoked or expired on server (401/403), wipe invalid session
                if (
                  err.status === 401 ||
                  err.status === 403 ||
                  err.message?.includes('revoked') ||
                  err.message?.includes('expired') ||
                  err.message?.includes('Invalid')
                ) {
                  console.log('Session expired or revoked on server. Clearing local credentials.');
                  setUser(null);
                  setToken(null);
                  AsyncStorage.removeItem(STORAGE_KEYS.USER).catch(() => {});
                  AsyncStorage.removeItem(STORAGE_KEYS.TOKEN).catch(() => {});
                }
              });

            // Sync favorites from PostgreSQL server
            fetchFavoritesApi(savedToken)
              .then((res) => {
                if (res && Array.isArray(res.favoriteIds)) {
                  setFavorites(res.favoriteIds);
                  setSavedHustles(res.data || []);
                  AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(res.favoriteIds)).catch(() => {});
                }
              })
              .catch(() => {});
          } catch (e) {
            console.warn('Error parsing saved session:', e);
          }
        }
      } catch (err) {
        console.warn('Failed to restore persistent session:', err);
      }
    };

    restoreSession();
  }, []);

  const loadHustles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHustlesFromApi({ campus: selectedCampus });
      setHustles(data || []);
    } catch (e: any) {
      console.warn('Failed to load hustles from API:', e);
      setError(e.message || 'Unable to load listings. Please check your network connection.');
      setHustles([]);
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

    // Sync favorites with PostgreSQL on login
    fetchFavoritesApi(newToken)
      .then((res) => {
        if (res && Array.isArray(res.favoriteIds)) {
          setFavorites(res.favoriteIds);
          setSavedHustles(res.data || []);
          AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(res.favoriteIds)).catch(() => {});
        }
      })
      .catch(() => {});
  };

  const logoutUser = () => {
    if (token) {
      logoutStudentApi(token).catch((err) => console.log('Server logout notice:', err));
    }
    setUser(null);
    setToken(null);
    AsyncStorage.removeItem(STORAGE_KEYS.USER).catch(() => {});
    AsyncStorage.removeItem(STORAGE_KEYS.TOKEN).catch(() => {});
  };

  const addHustle = async (newHustleData: Omit<Hustle, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    // Send directly to backend API with JWT token for verified seller attribution
    try {
      const res = await createHustleInApi(newHustleData, token || undefined);
      if (res && res.data) {
        setHustles((prev) => [res.data, ...prev]);
      } else {
        await loadHustles();
      }
      return res;
    } catch (e) {
      console.warn('Failed to create hustle on server:', e);
      throw e;
    }
  };

  const deleteHustle = async (id: string) => {
    // Optimistic UI removal
    setHustles((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));
    setSavedHustles((prev) => prev.filter((item) => item.id !== id));

    // Persist deletion to backend if token exists
    if (token) {
      try {
        await deleteHustleInApi(id, token);
      } catch (err) {
        console.warn('Failed to delete on server:', err);
        loadHustles();
      }
    }
  };

  const updateHustleStatus = (id: string, status: 'OPEN' | 'BUSY') => {
    const patch = (h: Hustle) => (h.id === id ? { ...h, status } : h);
    setHustles((prev) => prev.map(patch));
    setSavedHustles((prev) => prev.map(patch));
  };

  const updateHustleRating = (id: string, rating: number, reviewCount: number) => {
    const patch = (h: Hustle) => (h.id === id ? { ...h, rating, reviewCount } : h);
    setHustles((prev) => prev.map(patch));
    setSavedHustles((prev) => prev.map(patch));
  };

  const toggleFavorite = (id: string) => {
    const isFav = favorites.includes(id);
    const updated = isFav ? favorites.filter((favId) => favId !== id) : [...favorites, id];
    setFavorites(updated);
    AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated)).catch(() => {});

    if (isFav) {
      setSavedHustles((prev) => prev.filter((hustle) => hustle.id !== id));
    } else {
      const match = hustles.find((hustle) => hustle.id === id);
      if (match) {
        setSavedHustles((prev) => (prev.some((hustle) => hustle.id === id) ? prev : [...prev, match]));
      }
    }

    if (token) {
      toggleFavoriteApi(id, token).catch((err) => {
        console.warn('Failed to toggle favorite on server:', err);
        setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((favId) => favId !== id)));
        if (isFav) {
          const match = hustles.find((hustle) => hustle.id === id);
          if (match) {
            setSavedHustles((prev) => (prev.some((h) => h.id === id) ? prev : [...prev, match]));
          }
        } else {
          setSavedHustles((prev) => prev.filter((hustle) => hustle.id !== id));
        }
      });
    }
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
        !isUnfilteredLocation(selectedLocation) &&
        !hustle.hostelLocation.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = hustle.title.toLowerCase().includes(query);
        const matchesDesc = hustle.description.toLowerCase().includes(query);
        const matchesSeller = (hustle.sellerName || '').toLowerCase().includes(query);
        const matchesTags = (hustle.tags || []).some((tag) => tag.toLowerCase().includes(query));
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
        savedHustles,
        searchQuery,
        selectedCategory,
        selectedLocation,
        selectedCampus,
        filteredHustles,
        isLoading,
        error,
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
