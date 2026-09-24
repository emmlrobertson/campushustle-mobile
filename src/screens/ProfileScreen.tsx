import React, { useState, useEffect, useMemo } from 'react';
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
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHustleContext } from '../context/HustleContext';
import { fetchMyHustlesApi } from '../services/api';
import { Hustle } from '../types';
import { CAMPUS_METADATA } from '../data/mockData';
import { getHustleImageUrl } from '../utils/imageHelper';
import { colors, shadows } from '../theme/colors';

interface ProfileScreenProps {
  navigation: any;
}

const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n\n${message}`);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

const MyHustleThumb: React.FC<{ item: Hustle }> = ({ item }) => {
  const [thumbUri, setThumbUri] = useState(() =>
    getHustleImageUrl(item.imageUrl, item.category, item.title)
  );

  useEffect(() => {
    setThumbUri(getHustleImageUrl(item.imageUrl, item.category, item.title));
  }, [item.imageUrl, item.category, item.title]);

  return (
    <Image
      source={{ uri: thumbUri }}
      style={styles.myHustleThumb}
      onError={() => {
        const fallback = getHustleImageUrl(null, item.category, item.title);
        if (thumbUri !== fallback) setThumbUri(fallback);
      }}
    />
  );
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const {
    hustles,
    favorites,
    deleteHustle,
    user,
    token,
    logoutUser,
    setAuthModalVisible,
    selectedCampus,
  } = useHustleContext();

  const campusInfo = CAMPUS_METADATA[selectedCampus] || CAMPUS_METADATA.knust;

  const [refreshing, setRefreshing] = useState(false);
  const [remoteListings, setRemoteListings] = useState<Hustle[]>([]);

  const loadProfileData = async () => {
    if (!token) return;
    try {
      const listings = await fetchMyHustlesApi(token);
      if (listings && Array.isArray(listings)) {
        setRemoteListings(listings);
      }
    } catch (e) {
      console.warn('Failed to refresh profile data:', e);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadProfileData();
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const myHustles = useMemo(() => {
    const local = hustles.filter((h) => h.isMyListing || (user && h.sellerId === user.id));
    const merged = new Map<string, Hustle>();
    remoteListings.forEach((h) => merged.set(h.id, h));
    local.forEach((h) => merged.set(h.id, h));
    return Array.from(merged.values());
  }, [hustles, remoteListings, user]);

  const handleDelete = (id: string, title: string) => {
    const msg = `Are you sure you want to delete "${title}"?`;
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(msg);
      if (confirmed) {
        deleteHustle(id);
        showAlert('Deleted', `"${title}" has been removed from your listings.`);
      }
    } else {
      Alert.alert('Delete Hustle', msg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHustle(id);
            showAlert('Deleted', `"${title}" has been removed from your listings.`);
          },
        },
      ]);
    }
  };

  const handleLogout = () => {
    const msg = 'Are you sure you want to log out of your student account?';
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(msg);
      if (confirmed) {
        logoutUser();
        showAlert('Logged Out', 'You have been logged out.');
      }
    } else {
      Alert.alert('Log Out', msg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logoutUser();
            showAlert('Logged Out', 'You have been logged out.');
          },
        },
      ]);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loggedOutContainer}>
          <View style={styles.loggedOutIconBox}>
            <Ionicons name="person-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.loggedOutTitle}>{campusInfo.shortName} Student Profile</Text>
          <Text style={styles.loggedOutSub}>
            Sign in with your @{campusInfo.domain} email to view your profile, manage active listings, and track saved hustles.
          </Text>

          <TouchableOpacity
            style={styles.loginNowBtn}
            onPress={() => setAuthModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              <Text style={styles.loginNowText}>Log In / Register Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <Text style={styles.headerSubtitle}>{campusInfo.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myHustles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userProgram}>{user.program}</Text>
              <View style={styles.locationBadge}>
                <Ionicons name="location-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
                <Text style={styles.locationText}>
                  {user.campus ? CAMPUS_METADATA[user.campus as keyof typeof CAMPUS_METADATA]?.shortName || campusInfo.shortName : campusInfo.shortName} • {user.hostelLocation}
                </Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="globe-outline" size={16} color={colors.primary} />
                <Text style={styles.roadmapTitle}>Campus Network</Text>
              </View>
              <Text style={styles.roadmapText}>
                Live across <Text style={{ fontWeight: '800' }}>KNUST (Kumasi)</Text>, <Text style={{ fontWeight: '800' }}>UG Legon (Accra)</Text>, and <Text style={{ fontWeight: '800' }}>UCC (Cape Coast)</Text> with verified student isolation.
              </Text>
            </View>

            {/* Seller Payout Destination Card */}
            <View style={styles.payoutCard}>
              <View style={styles.payoutHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="card-outline" size={16} color={colors.primary} />
                    <Text style={styles.payoutSectionTitle}>Mobile Money Payout Account</Text>
                  </View>
                  <Text style={styles.payoutSectionSubtitle}>
                    Verified Ghanaian MoMo destination where proceeds are settled
                  </Text>
                </View>
                <View
                  style={[
                    styles.payoutBadge,
                    payoutAccount?.isPayoutVerified ? styles.payoutBadgeVerified : styles.payoutBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.payoutBadgeText,
                      payoutAccount?.isPayoutVerified ? styles.payoutBadgeTextVerified : styles.payoutBadgeTextPending,
                    ]}
                  >
                    {payoutAccount?.isPayoutVerified ? 'VERIFIED' : 'SETUP REQUIRED'}
                  </Text>
                </View>
              </View>

              {!isEditingPayout ? (
                <View style={styles.payoutDetailsBox}>
                  <View style={styles.payoutInfoRow}>
                    <Text style={styles.payoutInfoLabel}>Network:</Text>
                    <Text style={styles.payoutInfoValue}>
                      {payoutAccount?.payoutMomoNetwork === 'TELECEL_CASH'
                        ? 'Telecel Cash'
                        : payoutAccount?.payoutMomoNetwork === 'AIRTEL_TIGO_MONEY'
                        ? 'AirtelTigo Money'
                        : 'MTN Mobile Money'}
                    </Text>
                  </View>
                  <View style={styles.payoutInfoRow}>
                    <Text style={styles.payoutInfoLabel}>MoMo Number:</Text>
                    <Text style={styles.payoutInfoValue}>
                      {payoutAccount?.maskedPhoneNumber || 'No MoMo linked'}
                    </Text>
                  </View>
                  {payoutAccount?.verifiedAccountName ? (
                    <View style={styles.payoutInfoRow}>
                      <Text style={styles.payoutInfoLabel}>Account Name:</Text>
                      <Text style={styles.payoutInfoValue}>{payoutAccount.verifiedAccountName}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={styles.configurePayoutBtn}
                    onPress={() => {
                      setPayoutNetwork(payoutAccount?.payoutMomoNetwork || 'MTN_MOMO');
                      setPayoutPhone(payoutAccount?.maskedPhoneNumber ? '' : user?.whatsAppNumber || '');
                      setPayoutName(payoutAccount?.verifiedAccountName || user?.name || '');
                      setIsEditingPayout(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.configurePayoutBtnText}>
                      {payoutAccount?.hasConfiguredPayout
                        ? 'Update Payout Destination'
                        : 'Configure Payout Destination'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.payoutFormBox}>
                  <Text style={styles.formInputLabel}>Mobile Money Network</Text>
                  <View style={styles.networkSelectorRow}>
                    {(['MTN_MOMO', 'TELECEL_CASH', 'AIRTEL_TIGO_MONEY'] as const).map((net) => {
                      const isSelected = payoutNetwork === net;
                      const label =
                        net === 'MTN_MOMO'
                          ? 'MTN MoMo'
                          : net === 'TELECEL_CASH'
                          ? 'Telecel'
                          : 'AirtelTigo';
                      return (
                        <TouchableOpacity
                          key={net}
                          style={[styles.networkOption, isSelected && styles.networkOptionSelected]}
                          onPress={() => setPayoutNetwork(net)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.networkOptionText,
                              isSelected && styles.networkOptionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.formInputLabel}>Mobile Money Phone Number</Text>
                  <TextInput
                    style={styles.payoutInput}
                    placeholder="e.g. 0241234567 or 233..."
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={payoutPhone}
                    onChangeText={setPayoutPhone}
                  />

                  <Text style={styles.formInputLabel}>Registered Account Name</Text>
                  <TextInput
                    style={styles.payoutInput}
                    placeholder="e.g. Kwame Mensah"
                    placeholderTextColor="#9CA3AF"
                    value={payoutName}
                    onChangeText={setPayoutName}
                  />

                  <View style={styles.formActionRow}>
                    <TouchableOpacity
                      style={styles.cancelPayoutBtn}
                      onPress={() => setIsEditingPayout(false)}
                      activeOpacity={0.8}
                      disabled={savingPayout}
                    >
                      <Text style={styles.cancelPayoutBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.savePayoutBtn}
                      onPress={handleSavePayout}
                      activeOpacity={0.85}
                      disabled={savingPayout}
                    >
                      {savingPayout ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.savePayoutBtnText}>Verify & Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>My Active Side-Hustles</Text>
          </View>
        }
        renderItem={({ item }) => {
          const itemStatus = item.status || 'OPEN';
          const deliveryIcon: keyof typeof Ionicons.glyphMap =
            item.deliveryMode === 'campus_spot'
              ? 'school-outline'
              : item.deliveryMode === 'at_seller'
              ? 'location-outline'
              : item.deliveryMode === 'remote'
              ? 'laptop-outline'
              : 'home-outline';

          return (
            <TouchableOpacity
              style={styles.myHustleCard}
              onPress={() => navigation.navigate('HustleDetail', { hustleId: item.id })}
              activeOpacity={0.88}
            >
              <MyHustleThumb item={item} />
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
                  <Ionicons name={deliveryIcon} size={14} color="#64748B" style={{ marginLeft: 6 }} />
                </View>

                <Text style={styles.myHustleTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.myHustlePrice}>GH₵ {item.price}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location-outline" size={11} color="#94A3B8" style={{ marginRight: 3 }} />
                  <Text style={styles.myHustleHostel}>{item.hostelLocation}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
              activeOpacity={0.85}
            >
              <Text style={styles.postNowText}>Post Your First Hustle</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.ordersSection}>
            <View style={styles.ordersHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary} />
                  <Text style={styles.sectionTitle}>My Orders & Escrow Settlements</Text>
                </View>
                <Text style={styles.ordersSub}>
                  Funds held safely until verified campus meetup & delivery
                </Text>
              </View>
              {loadingOrders && <ActivityIndicator size="small" color={colors.primary} />}
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyOrdersCard}>
                <Text style={styles.emptyOrdersText}>
                  No orders yet. When you pay for a side-hustle with MoMo, your transaction and escrow status will appear here!
                </Text>
              </View>
            ) : (
              orders.map((order) => {
                const sellerName = order.seller_name || order.sellerName || 'Classmate Hustler';
                const rawStatus = (order.escrow_status || order.escrowStatus || 'held').toLowerCase();
                const isHeld = rawStatus === 'held';
                const meetupSpot = order.meetup_spot || order.meetupSpot;
                const createdAtRaw = order.created_at || order.createdAt;
                const orderDate = createdAtRaw ? new Date(createdAtRaw).toLocaleDateString() : '';
                const isReleasing = releasingRef === order.reference;

                return (
                  <View key={order.id || order.reference} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderSeller}>Hustler: {sellerName}</Text>
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
                          {isHeld ? 'HELD IN ESCROW' : 'RELEASED'}
                        </Text>
                      </View>
                    </View>

                    {meetupSpot ? (
                      <View style={styles.orderMeetupRow}>
                        <Text style={styles.orderMeetupText}>
                          Meetup Spot: <Text style={{ fontWeight: '700' }}>{meetupSpot}</Text>
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.orderMetaRow}>
                      <Text style={styles.orderRef}>Ref: {order.reference}</Text>
                      {orderDate ? <Text style={styles.orderDate}>{orderDate}</Text> : null}
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Ionicons name="checkmark-circle-outline" size={17} color="#FFFFFF" />
                            <Text style={styles.releaseBtnText}>
                              Confirm Received (Release GH₵ {order.amount})
                            </Text>
                          </View>
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
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.card,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.fab,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  userProgram: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  locationBadge: {
    backgroundColor: colors.busyBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  locationText: {
    color: colors.busyText,
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
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  roadmapCard: {
    backgroundColor: colors.availableBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryMintBorder,
    marginBottom: 20,
  },
  roadmapTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  roadmapText: {
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  myHustleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  myHustleThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
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
    backgroundColor: colors.availableBg,
  },
  statusPillBusy: {
    backgroundColor: colors.busyBg,
  },
  statusDotMini: {
    fontSize: 8,
  },
  dotOpen: {
    color: colors.primary,
  },
  dotBusy: {
    color: colors.busyDot,
  },
  statusTextMini: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  deliveryModeMini: {
    fontSize: 12,
  },
  myHustleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  myHustlePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  myHustleHostel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  postNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    ...shadows.fab,
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
    padding: 28,
  },
  loggedOutIconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loggedOutIcon: {
    fontSize: 44,
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loggedOutSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  loginNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    ...shadows.fab,
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
    borderTopColor: colors.borderLight,
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
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyOrdersCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    ...shadows.card,
  },
  emptyOrdersText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
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
    color: colors.textPrimary,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  escrowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  escrowBadgeHeld: {
    backgroundColor: colors.busyBg,
  },
  escrowBadgeReleased: {
    backgroundColor: colors.availableBg,
  },
  escrowBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  escrowBadgeTextHeld: {
    color: colors.busyText,
  },
  escrowBadgeTextReleased: {
    color: colors.availableText,
  },
  orderMeetupRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  orderMeetupText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderRef: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  releaseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  releaseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  // Payout Destination Styles
  payoutCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    ...shadows.card,
  },
  payoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  payoutSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  payoutSectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  payoutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payoutBadgeVerified: {
    backgroundColor: colors.availableBg,
    borderWidth: 1,
    borderColor: colors.primaryMintBorder,
  },
  payoutBadgePending: {
    backgroundColor: colors.busyBg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  payoutBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  payoutBadgeTextVerified: {
    color: colors.availableText,
  },
  payoutBadgeTextPending: {
    color: colors.busyText,
  },
  payoutDetailsBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
  },
  payoutInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  payoutInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  payoutInfoValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  configurePayoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  configurePayoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  payoutFormBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
  },
  formInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  networkSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  networkOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  networkOptionSelected: {
    backgroundColor: colors.availableBg,
    borderColor: colors.primary,
  },
  networkOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  networkOptionTextSelected: {
    color: colors.primary,
  },
  payoutInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  formActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelPayoutBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelPayoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  savePayoutBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  savePayoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

