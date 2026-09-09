import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CampusId, CategoryId, Hustle, StudentProfile } from '../types';
import { fetchHustlesFromApi, createHustleInApi } from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('knust');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication State (Starts as null -> Logged Out)
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const loadHustles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchHustlesFromApi({ campus: selectedCampus });
      setHustles(data || []);
    } catch (e) {
      setHustles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHustles();
  }, [selectedCampus]);

  const loginUser = (newUser: StudentProfile, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
  };

  const addHustle = async (newHustleData: Omit<Hustle, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const localNewHustle: Hustle = {
      ...newHustleData,
      id: `hst_${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewCount: 1,
      isMyListing: true,
      status: 'OPEN',
    };

    // Optimistic UI update
    setHustles((prev) => [localNewHustle, ...prev]);

    // Send to backend API
    try {
      await createHustleInApi(newHustleData, token || undefined);
      loadHustles();
    } catch (e) {
      console.log('Server update finished');
    }
  };

  const deleteHustle = (id: string) => {
    setHustles((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const filteredHustles = useMemo(() => {
    return hustles.filter((hustle) => {
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
  }, [hustles, selectedCampus, selectedCategory, selectedLocation, searchQuery]);

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
        toggleFavorite,
        isFavorite,
        setSearchQuery,
        setSelectedCategory,
        setSelectedLocation,
        setSelectedCampus,
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
