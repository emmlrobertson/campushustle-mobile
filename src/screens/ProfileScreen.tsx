import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { fetchPaymentHistoryApi, releaseEscrowPaymentApi } from '../services/api';
import { EscrowTransaction } from '../types';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { hustles, favorites, deleteHustle, user, token, logoutUser, setAuthModalVisible } =
    useHustleContext();

  const [orders, setOrders] = useState<EscrowTransaction[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [releasingRef, setReleasingRef] = useState<string | null>(null);

  const myHustles = hustles.filter((h) => h.isMyListing);

  useEffect(() => {
    if (!token) return;
    setLoadingOrders(true);
    fetchPaymentHistoryApi(token)
      .then((data) => {
        if (data) setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [token]);

  const handleReleaseEscrow = (order: EscrowTransaction) => {
    Alert.alert(
      'Confirm Service Received',
      `Are you sure you want to release GH₵ ${order.amount} to ${order.seller_name}? Only release once you are satisfied with the delivered hustle.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release Escrow',
          onPress: async () => {
            if (!token) return;
            setReleasingRef(order.reference);
            try {
              await releaseEscrowPaymentApi(order.reference, token);
              setOrders((prev) =>
                prev.map((o) =>
                  o.reference === order.reference ? { ...o, escrow_status: 'released' } : o
                )
              );
              Alert.alert('🎉 Escrow Released', `GH₵ ${order.amount} has been paid out to ${order.seller_name}!`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not release escrow.');
            } finally {
              setReleasingRef(null);
            }
          },
        },
      ]
    );
  };

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
        renderItem={({ item }) => {
          const itemStatus = item.status || 'OPEN';
          const deliveryIcon =
            item.deliveryMode === 'campus_spot'
              ? '🎓'
              : item.deliveryMode === 'at_seller'
              ? '📍'
              : item.deliveryMode === 'remote'
              ? '💻'
              : '🏠';

          return (
            <TouchableOpacity
              style={styles.myHustleCard}
              onPress={() => navigation.navigate('HustleDetail', { hustleId: item.id })}
              activeOpacity={0.88}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.myHustleThumb} />
              <View style={styles.myHustleInfo}>
                <View style={styles.myHustleBadgeRow}>
                  <View
                    style={[
                      styles.statusPillMini,
                      itemStatus === 'OPEN' ? styles.statusPillOpen : styles.statusPillBusy,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusDotMini,
                        itemStatus === 'OPEN' ? styles.dotOpen : styles.dotBusy,
                      ]}
                    >
                      ●
                    </Text>
                    <Text style={styles.statusTextMini}>
                      {itemStatus === 'OPEN' ? 'AVAILABLE' : 'BUSY'}
                    </Text>
                  </View>
                  <Text style={styles.deliveryModeMini}>{deliveryIcon}</Text>
                </View>

                <Text style={styles.myHustleTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.myHustlePrice}>GH₵ {item.price}</Text>
                <Text style={styles.myHustleHostel}>📍 {item.hostelLocation}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
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
        ListFooterComponent={
          <View style={styles.ordersSection}>
            <View style={styles.ordersHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>🛡️ My Escrow & Payment Orders</Text>
                <Text style={styles.ordersSub}>
                  Funds held safely until verified campus meetup & delivery
                </Text>
              </View>
              {loadingOrders && <ActivityIndicator size="small" color="#059669" />}
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyOrdersCard}>
                <Text style={styles.emptyOrdersText}>
                  No orders yet. When you pay for a side-hustle with MoMo, your transaction and escrow status will appear here!
                </Text>
              </View>
            ) : (
              orders.map((order) => {
                const isHeld = (order.escrow_status || 'held') === 'held';
                const isReleasing = releasingRef === order.reference;

                return (
                  <View key={order.id || order.reference} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderSeller}>Hustler: {order.seller_name}</Text>
                        <Text style={styles.orderAmount}>GH₵ {order.amount}</Text>
                      </View>

                      <View
                        style={[
                          styles.escrowBadge,
                          isHeld ? styles.escrowBadgeHeld : styles.escrowBadgeReleased,
                        ]}
                      >
                        <Text
                          style={[
                            styles.escrowBadgeText,
                            isHeld ? styles.escrowBadgeTextHeld : styles.escrowBadgeTextReleased,
                          ]}
                        >
                          {isHeld ? '🛡️ HELD IN ESCROW' : '✅ RELEASED'}
                        </Text>
                      </View>
                    </View>

                    {order.meetup_spot && (
                      <View style={styles.orderMeetupRow}>
                        <Text style={styles.orderMeetupText}>
                          Meetup Spot: <Text style={{ fontWeight: '700' }}>{order.meetup_spot}</Text>
                        </Text>
                      </View>
                    )}

                    <View style={styles.orderMetaRow}>
                      <Text style={styles.orderRef}>Ref: {order.reference}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    {isHeld && (
                      <TouchableOpacity
                        style={styles.releaseBtn}
                        onPress={() => handleReleaseEscrow(order)}
                        disabled={isReleasing}
                        activeOpacity={0.85}
                      >
                        {isReleasing ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.releaseBtnText}>
                            ✅ Confirm Received (Release GH₵ {order.amount})
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
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
  myHustleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  statusPillMini: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  statusPillOpen: {
    backgroundColor: '#DCFCE7',
  },
  statusPillBusy: {
    backgroundColor: '#FEF9C3',
  },
  statusDotMini: {
    fontSize: 8,
  },
  dotOpen: {
    color: '#16A34A',
  },
  dotBusy: {
    color: '#CA8A04',
  },
  statusTextMini: {
    fontSize: 9,
    fontWeight: '800',
    color: '#334155',
  },
  deliveryModeMini: {
    fontSize: 12,
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
  // Orders & Escrow Styles
  ordersSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 18,
    marginBottom: 20,
  },
  ordersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ordersSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderSeller: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  escrowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  escrowBadgeHeld: {
    backgroundColor: '#FEF3C7',
  },
  escrowBadgeReleased: {
    backgroundColor: '#DCFCE7',
  },
  escrowBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  escrowBadgeTextHeld: {
    color: '#B45309',
  },
  escrowBadgeTextReleased: {
    color: '#15803D',
  },
  orderMeetupRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  orderMeetupText: {
    fontSize: 12,
    color: '#334155',
  },
  orderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderRef: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  releaseBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  releaseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
