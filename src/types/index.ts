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

export interface Hustle {
  id: string;
  title: string;
  description: string;
  price: number; // In GH₵
  priceType: PriceType;
  category: CategoryId;
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
  status?: 'OPEN' | 'BUSY';
}

export interface StudentProfile {
  id: string;
  name: string;
  program: string;
  campus: CampusId;
  hostelLocation: string;
  whatsAppNumber: string;
  bio: string;
  avatarUrl: string;
}
