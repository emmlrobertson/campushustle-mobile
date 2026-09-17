/**
 * Utility to safely resolve Hustle images and provide high-quality
 * category-matched fallbacks for broken, relative, or missing URLs.
 */

export const DEFAULT_HUSTLE_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  // Photography & Media
  photo_video: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  media: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',

  // Tech, Coding & Animation
  tech_repair: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=800&q=80',
  tech: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=800&q=80',
  animation: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',

  // Food & Catering
  food_delivery: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',

  // Beauty, Hair & Fashion
  fashion_beauty: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',

  // Academics & Tutoring
  tutoring: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  academics: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',

  // Laundry & Errands
  laundry_errands: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
  laundry: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
  clean: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',

  // Crafts & Design
  crafts: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
};

/**
 * Returns a guaranteed displayable HTTP/HTTPS image URL.
 * Detects broken local paths (e.g. /uploads/...) and keyword-matches title/category.
 */
export function getHustleImageUrl(
  url?: string | null,
  category?: string,
  title?: string
): string {
  // If it's a valid remote URL and NOT an ephemeral /uploads path
  if (url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/uploads/')) {
    return url;
  }

  // Check title keywords for the most accurate thematic match
  const lowerTitle = (title || '').toLowerCase();
  if (lowerTitle.includes('photo') || lowerTitle.includes('cam') || lowerTitle.includes('video') || lowerTitle.includes('shoot')) {
    return CATEGORY_FALLBACK_IMAGES.photography;
  }
  if (
    lowerTitle.includes('animat') ||
    lowerTitle.includes('code') ||
    lowerTitle.includes('tech') ||
    lowerTitle.includes('laptop') ||
    lowerTitle.includes('phone') ||
    lowerTitle.includes('soft') ||
    lowerTitle.includes('app')
  ) {
    return CATEGORY_FALLBACK_IMAGES.animation;
  }
  if (
    lowerTitle.includes('food') ||
    lowerTitle.includes('cook') ||
    lowerTitle.includes('bake') ||
    lowerTitle.includes('snack') ||
    lowerTitle.includes('rice') ||
    lowerTitle.includes('shawarma')
  ) {
    return CATEGORY_FALLBACK_IMAGES.food;
  }
  if (
    lowerTitle.includes('braid') ||
    lowerTitle.includes('hair') ||
    lowerTitle.includes('nail') ||
    lowerTitle.includes('beauty') ||
    lowerTitle.includes('makeup') ||
    lowerTitle.includes('wig')
  ) {
    return CATEGORY_FALLBACK_IMAGES.beauty;
  }
  if (
    lowerTitle.includes('tutor') ||
    lowerTitle.includes('assign') ||
    lowerTitle.includes('study') ||
    lowerTitle.includes('math') ||
    lowerTitle.includes('chem')
  ) {
    return CATEGORY_FALLBACK_IMAGES.tutoring;
  }
  if (
    lowerTitle.includes('laundry') ||
    lowerTitle.includes('wash') ||
    lowerTitle.includes('clean') ||
    lowerTitle.includes('iron')
  ) {
    return CATEGORY_FALLBACK_IMAGES.laundry;
  }

  // Fallback by category key
  const catKey = (category || '').toLowerCase().trim();
  if (CATEGORY_FALLBACK_IMAGES[catKey]) {
    return CATEGORY_FALLBACK_IMAGES[catKey];
  }

  return DEFAULT_HUSTLE_IMAGE;
}
