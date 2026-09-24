import { CampusId, CategoryId, DeliveryMode, Hustle, PriceType } from '../types';

export function isUnfilteredLocation(location?: string | null): boolean {
  if (!location) return true;
  const value = location.trim().toLowerCase();
  return value === 'all locations' || value.startsWith('all ');
}

export function formatRating(rating: unknown): string {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function normalizeHustle(raw: any): Hustle {
  const tags = Array.isArray(raw?.tags)
    ? raw.tags.filter(Boolean).map((tag: unknown) => String(tag))
    : typeof raw?.tags === 'string'
      ? raw.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

  const rating = Number(raw?.rating);
  const reviewCount = Number(raw?.reviewCount ?? raw?.review_count ?? 0);
  const price = Number(raw?.price);

  return {
    id: String(raw?.id ?? ''),
    title: raw?.title || 'Untitled hustle',
    description: raw?.description || '',
    price: Number.isFinite(price) ? price : 0,
    priceType: (raw?.priceType || raw?.price_type || 'flat') as PriceType,
    category: (raw?.category || 'custom') as CategoryId,
    sellerId: raw?.sellerId || raw?.seller_id,
    sellerName: raw?.sellerName || raw?.seller_name || 'Student',
    sellerProgram: raw?.sellerProgram || raw?.seller_program || '',
    campus: (raw?.campus || 'knust') as CampusId,
    hostelLocation: raw?.hostelLocation || raw?.hostel_location || '',
    whatsAppNumber: raw?.whatsAppNumber || raw?.whatsappNumber || raw?.whatsapp_number || '',
    momoNumber: raw?.momoNumber || raw?.momo_number,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    imageUrl: raw?.imageUrl || raw?.image_url || '',
    tags,
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    isFeatured: Boolean(raw?.isFeatured ?? raw?.is_featured),
    isMyListing: Boolean(raw?.isMyListing ?? raw?.is_my_listing),
    deliveryMode: (raw?.deliveryMode || raw?.delivery_mode) as DeliveryMode | undefined,
    status: raw?.status === 'BUSY' ? 'BUSY' : 'OPEN',
  };
}

export function normalizeHustles(raw: unknown): Hustle[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeHustle).filter((hustle) => Boolean(hustle.id));
}
