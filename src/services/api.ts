import { Hustle, Review, EscrowTransaction } from '../types';

// Live Production Cloud Backend URL on Render
const API_BASE_URL = 'https://campushustle-backend-2.onrender.com/api';

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
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout for slow cold starts

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
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`Cloud API connection notice:`, error?.message || error);
    return [];
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
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create hustle in backend API');
  }

  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Registration failed.');
  }

  return data;
}

export async function loginStudentApi(credentials: {
  email: string;
  password: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Login failed.');
  }

  return data;
}

export async function initializeMoMoPayment(paymentData: {
  hustleId: string;
  buyerEmail: string;
  momoNumber: string;
  paymentMethod?: string;
  meetupSpot?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize Mobile Money payment.');
  }

  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/payments/release/${reference}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to release escrow funds');
  }

  return data;
}

