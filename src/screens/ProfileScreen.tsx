import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { CURRENT_USER } from '../data/mockData';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { hustles, favorites, deleteHustle } = useHustleContext();

  const myHustles = hustles.filter((h) => h.isMyListing);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Hustle', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteHustle(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <FlatList
        data={myHustles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <Image source={{ uri: CURRENT_USER.avatarUrl }} style={styles.avatar} />
              <Text style={styles.userName}>{CURRENT_USER.name}</Text>
              <Text style={styles.userProgram}>{CURRENT_USER.program}</Text>
              <View style={styles.locationBadge}>
                <Text style={styles.locationText}>📍 KNUST • {CURRENT_USER.hostelLocation}</Text>
              </View>
              <Text style={styles.bioText}>{CURRENT_USER.bio}</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{myHustles.length}</Text>
                <Text style={styles.statLabel}>My Listings</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{favorites.length}</Text>
                <Text style={styles.statLabel}>Saved Favorites</Text>
              </View>
            </View>

            {/* Expansion Roadmap Callout */}
            <View style={styles.roadmapCard}>
              <Text style={styles.roadmapTitle}>🚀 Expansion Roadmap</Text>
              <Text style={styles.roadmapText}>
                Currently live at <Text style={{ fontWeight: '800' }}>KNUST</Text>! Next campuses scaling up: University of Ghana (UG Legon) & UCC.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>My Published Side-Hustles</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.myHustleCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.myHustleThumb} />
            <View style={styles.myHustleInfo}>
              <Text style={styles.myHustleTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.myHustlePrice}>GH₵ {item.price}</Text>
              <Text style={styles.myHustleHostel}>📍 {item.hostelLocation}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id, item.title)}
            >
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't posted any side-hustles yet.</Text>
            <TouchableOpacity
              style={styles.postNowBtn}
              onPress={() => navigation.navigate('Post')}
            >
              <Text style={styles.postNowText}>➕ Post Your First Hustle</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userProgram: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  locationBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  locationText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  roadmapCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  roadmapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  roadmapText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  myHustleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myHustleThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  myHustleInfo: {
    flex: 1,
  },
  myHustleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  myHustlePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
    marginTop: 2,
  },
  myHustleHostel: {
    fontSize: 11,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  postNowBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  postNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
