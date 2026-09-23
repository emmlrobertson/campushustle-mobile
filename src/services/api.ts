import { Platform } from 'react-native';
import { Hustle, Review, EscrowTransaction } from '../types';

const LOCAL_API_URL = 'http://localhost:5000/api';
const CLOUD_API_URL = 'https://campushustle-backend-4.onrender.com/api';

// Use environment variable if configured, else dev server on localhost, cloud URL in production/mobile
const CONFIG_API_URL = process.env.EXPO_PUBLIC_API_URL;
export const API_BASE_URL =
  CONFIG_API_URL ||
  (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? LOCAL_API_URL
    : CLOUD_API_URL);

/**
 * Standardizes Ghana phone numbers to international 233 format without spaces or symbols.
 * Examples:
 *   "0241234567" -> "233241234567"
 *   "+233 55 123 4567" -> "233551234567"
 *   "233201234567" -> "233201234567"
 */
export function formatGhanaPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return '233' + digits.substring(1);
  }
  if (digits.startsWith('233')) {
    return digits;
  }
  if (digits.length === 9) {
    return '233' + digits;
  }
  return digits;
}

export async function fetchHustlesFromApi(params?: {
  campus?: string;
  category?: string;
  location?: string;
  search?: string;
  sellerId?: string;
}): Promise<Hustle[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const queryParts: string[] = [];
    if (params?.campus) queryParts.push(`campus=${encodeURIComponent(params.campus)}`);
    if (params?.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.location) queryParts.push(`location=${encodeURIComponent(params.location)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.sellerId) queryParts.push(`sellerId=${encodeURIComponent(params.sellerId)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await fetch(`${API_BASE_URL}/hustles${queryString}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load hustles from server (HTTP ${response.status})`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your internet connection.');
    }
    throw error;
  }
}

export async function fetchMyHustlesApi(token: string): Promise<Hustle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/hustles/my/listings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    const result = await response.json();
    return result.data || [];
  } catch (e) {
    return [];
  }
}

export async function createHustleInApi(
  hustleData: Omit<Hustle, 'id' | 'createdAt' | 'rating' | 'reviewCount'>,
  token?: string
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/hustles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(hustleData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create hustle listing.');
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Listing creation timed out. Please check your network.');
    }
    throw err;
  }
}

export async function uploadHustleImageApi(
  imageUri: string,
  token: string
): Promise<{ imageUrl: string; thumbnailUrl: string; publicId: string }> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    formData.append('image', blob, 'upload.jpg');
  } else {
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }

  const response = await fetch(`${API_BASE_URL}/hustles/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload image to server');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteHustleInApi(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/hustles/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete hustle in backend API');
  }

  return response.json();
}

export async function registerStudentApi(userData: {
  name: string;
  email: string;
  password: string;
  program: string;
  hostelLocation: string;
  whatsAppNumber: string;
  campus?: string;
}): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Registration failed. Please check your information and try again.');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network and try again.');
    }
    throw error;
  }
}

export async function loginStudentApi(credentials: {
  email: string;
  password: string;
}): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const err = new Error(data.error || 'Invalid student email or password.') as any;
      if (data.requiresVerification) {
        err.requiresVerification = true;
        err.email = data.email;
        err.phoneNumber = data.phoneNumber;
      }
      throw err;
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network connection.');
    }
    throw error;
  }
}

export async function sendSmsOtpApi(params: {
  email?: string;
  whatsAppNumber?: string;
  purpose: 'register' | 'login';
  campus?: string;
}): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        phone: params.whatsAppNumber,
        purpose: params.purpose,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to dispatch verification code. Please try again later.');
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out while sending SMS. Please try again.');
    }
    throw err;
  }
}

export async function verifySmsOtpApi(params: {
  email?: string;
  phone?: string;
  otp: string;
  purpose: 'register' | 'login';
}): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        phone: params.phone,
        otp: params.otp,
        purpose: params.purpose,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Invalid or expired verification code.');
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Verification request timed out. Please try again.');
    }
    throw err;
  }
}

export async function fetchCurrentUserApi(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    const err = new Error(data.error || 'Unauthorized session.') as any;
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function logoutStudentApi(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json().catch(() => ({}));
  } catch (e) {
    return { success: false };
  }
}

export async function initializeMoMoPayment(
  paymentData: {
    hustleId: string;
    momoNumber: string;
    paymentMethod?: string;
    meetupSpot?: string;
  },
  token: string
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to initialize Mobile Money payment.');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Payment initialization timed out. Please check your network connection.');
    }
    throw error;
  }
}

export async function verifyPaymentApi(reference: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment verification failed.');
  }
  return data;
}



export async function fetchHustleReviewsApi(hustleId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/hustles/${hustleId}/reviews`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function submitHustleReviewApi(
  hustleId: string,
  rating: number,
  comment: string,
  token: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/hustles/${hustleId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit review');
  }

  return data;
}

export async function toggleHustleStatusApi(
  hustleId: string,
  status: 'OPEN' | 'BUSY',
  token: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/hustles/${hustleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }

  return response.json();
}

export async function fetchPaymentHistoryApi(token: string): Promise<EscrowTransaction[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function releaseEscrowPaymentApi(
  reference: string,
  token: string
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/payments/release/${reference}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to release escrow funds.');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Escrow release request timed out. Please check your network connection.');
    }
    throw error;
  }
}

// ============================================================================
// FAVORITES APIS (PostgreSQL Source of Truth)
// ============================================================================
export async function toggleFavoriteApi(
  hustleId: string,
  token: string
): Promise<{ success: boolean; isFavorite: boolean }> {
  const response = await fetch(`${API_BASE_URL}/hustles/${hustleId}/favorite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update favorite status');
  }
  return data;
}

export async function fetchFavoritesApi(
  token: string
): Promise<{ favoriteIds: string[]; data: Hustle[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/hustles/my/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return { favoriteIds: [], data: [] };
    const result = await response.json();
    return {
      favoriteIds: result.favoriteIds || [],
      data: result.data || [],
    };
  } catch (error) {
    return { favoriteIds: [], data: [] };
  }
}

// ============================================================================
// ORDERS & SUB-ORDERS APIS
// ============================================================================
export async function checkoutOrderApi(
  orderPayload: {
    items: Array<{ hustleId: string; quantity: number; meetupLocation?: string; notesToSeller?: string }>;
    contactPhone?: string;
    idempotencyKey?: string;
  },
  token: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(orderPayload.idempotencyKey ? { 'idempotency-key': orderPayload.idempotencyKey } : {}),
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Checkout failed');
  }
  return data;
}

export async function fetchMyOrdersApi(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function confirmSubOrderReceiptApi(subOrderId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/orders/sub-orders/${subOrderId}/confirm-receipt`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to confirm receipt of order');
  }
  return data;
}

// ============================================================================
// CART APIS (PostgreSQL Multi-Seller Cart)
// ============================================================================
export async function fetchCartApi(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to load cart');
  }
  return data.data;
}

export async function addToCartApi(hustleId: string, quantity: number, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hustleId, quantity }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to add item to cart');
  }
  return data.data;
}

export async function updateCartItemApi(itemId: string, quantity: number, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update cart quantity');
  }
  return data.data;
}

export async function removeFromCartApi(itemId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to remove item from cart');
  }
  return data.data;
}

export async function clearCartApi(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to clear cart');
  }
  return data.data;
}

// ----------------------------------------------------------------------------
// SELLER PAYOUT ACCOUNT API
// ----------------------------------------------------------------------------

export interface PayoutAccountData {
  hasConfiguredPayout: boolean;
  isPayoutVerified: boolean;
  payoutMomoNetwork: 'MTN_MOMO' | 'TELECEL_CASH' | 'AIRTEL_TIGO_MONEY' | null;
  maskedPhoneNumber: string | null;
  verifiedAccountName: string | null;
  businessName?: string | null;
}

export async function fetchPayoutAccountApi(token: string): Promise<PayoutAccountData> {
  const response = await fetch(`${API_BASE_URL}/seller/payout-account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch payout account settings');
  }
  return data.data;
}

export async function updatePayoutAccountApi(
  payload: {
    network: 'MTN_MOMO' | 'TELECEL_CASH' | 'AIRTEL_TIGO_MONEY';
    phoneNumber: string;
    accountName: string;
  },
  token: string
): Promise<PayoutAccountData> {
  const response = await fetch(`${API_BASE_URL}/seller/payout-account`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update payout account');
  }
  return data.data;
}


