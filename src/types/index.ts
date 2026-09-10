export type CampusId = 'knust' | 'ug_legon' | 'ucc';

export type CategoryId =
  | 'all'
  | 'tutoring'
  | 'tech_repair'
  | 'photo_video'
  | 'food_delivery'
  | 'fashion_beauty'
  | 'laundry_errands'
  | 'custom';

export interface CategoryOption {
  id: CategoryId;
  label: string;
  icon: string;
}

export type PriceType = 'flat' | 'hourly' | 'starting_at' | 'negotiable';

export type DeliveryMode = 'to_client' | 'at_seller' | 'campus_spot' | 'remote';

export interface Hustle {
  id: string;
  title: string;
  description: string;
  price: number; // In GH₵
  priceType: PriceType;
  category: CategoryId;
  sellerId?: string;
  sellerName: string;
  sellerProgram: string; // e.g. "Computer Engineering, Yr 3"
  campus: CampusId;
  hostelLocation: string; // e.g. "Ayeduase", "Katanga", "Brunei"
  whatsAppNumber: string; // Format: 233...
  momoNumber?: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  tags: string[];
  createdAt: string;
  isFeatured?: boolean;
  isMyListing?: boolean;
  deliveryMode?: DeliveryMode;
  status?: 'OPEN' | 'BUSY';
}

export interface Review {
  id: string;
  hustleId: string;
  reviewerId?: string;
  reviewerName: string;
  reviewerProgram: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  program: string;
  campus: CampusId;
  hostelLocation: string;
  whatsAppNumber: string;
  bio?: string;
  avatarUrl?: string;
}

export type PriceBracket = 'all' | 'under_30' | '30_70' | '70_150' | 'above_150';
export type SortOption = 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc' | 'reviews_desc';

export interface EscrowTransaction {
  id: string;
  hustle_id: string;
  buyer_email: string;
  seller_name: string;
  amount: number;
  payment_method: string;
  momo_number: string;
  status: string;
  reference: string;
  created_at: string;
  escrow_status?: 'held' | 'released' | 'refunded';
  meetup_spot?: string;
}

