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

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { hustles, favorites, deleteHustle, user, logoutUser, setAuthModalVisible } =
    useHustleContext();

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

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loggedOutContainer}>
          <Text style={styles.loggedOutIcon}>👤</Text>
          <Text style={styles.loggedOutTitle}>KNUST Student Profile</Text>
          <Text style={styles.loggedOutSub}>
            Sign in with your @st.knust.edu.gh email to view your profile, manage active listings, and track saved hustles.
          </Text>

          <TouchableOpacity
            style={styles.loginNowBtn}
            onPress={() => setAuthModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.loginNowText}>🔑 Log In / Register Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myHustles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarLetter}>{user.name.charAt(0)}</Text>
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userProgram}>{user.program}</Text>
              <View style={styles.locationBadge}>
                <Text style={styles.locationText}>📍 KNUST • {user.hostelLocation}</Text>
              </View>
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
              <Text style={styles.roadmapTitle}>🚀 Campus Expansion</Text>
              <Text style={styles.roadmapText}>
                Currently live at <Text style={{ fontWeight: '800' }}>KNUST</Text>! Next campuses scaling up: University of Ghana (UG Legon) & UCC.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>My Active Side-Hustles</Text>
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
    backgroundColor: '#059669',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  avatarBig: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 1,
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
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  roadmapCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  roadmapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 4,
  },
  roadmapText: {
    fontSize: 12,
    color: '#065F46',
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
    color: '#059669',
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
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  postNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  loggedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loggedOutIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  loggedOutSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  loginNowBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginNowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
