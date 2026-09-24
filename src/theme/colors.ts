// ==============================================================================
// Campus Hustle - Unified Design System Tokens (Figma Redesign Standard)
// ==============================================================================

export const colors = {
  // Brand Primary (Emerald Green matching Figma UI screenshots)
  primary: '#059669',       // Vibrant Emerald Green
  primaryDark: '#047857',   // Deep green for active pressed states
  primaryLight: '#10B981',  // Light vibrant green
  primaryMint: '#ECFDF5',   // Soft green tint
  primaryMintBorder: '#A7F3D0',

  // Status & Badges
  availableBg: '#DCFCE7',
  availableText: '#0D6535',
  busyBg: '#FEF3C7',
  busyText: '#92400E',
  busyDot: '#D97706',

  // Category Tag Badges from Figma
  badgeGoldBg: '#FEF9C3',
  badgeGoldText: '#854D0E',
  badgeBlueBg: '#E0F2FE',
  badgeBlueText: '#0369A1',
  badgePinkBg: '#FCE7F3',
  badgePinkText: '#BE185D',
  badgePurpleBg: '#F3E8FF',
  badgePurpleText: '#7E22CE',
  badgeGreenBg: '#DCFCE7',
  badgeGreenText: '#15803D',

  // Neutrals & Surfaces
  background: '#F8FAFC',    // App background
  surface: '#FFFFFF',       // Card & modal background
  surfaceAlt: '#F3F4F6',    // Input & unselected chip background
  border: '#E5E7EB',        // Clean border
  borderLight: '#F1F5F9',   // Very subtle card border
  borderFocus: '#0D6535',

  // Text Hierarchy
  textPrimary: '#111827',   // Deep dark slate/charcoal
  textSecondary: '#4B5563', // Subtext & descriptors
  textMuted: '#9CA3AF',     // Placeholders & hints
  textWhite: '#FFFFFF',

  // Accents
  ratingStar: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fab: {
    shadowColor: '#0D6535',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
};
