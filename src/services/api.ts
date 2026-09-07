import { Hustle } from '../types';

// Live Production Cloud Backend URL on Render
const API_BASE_URL = 'https://campushustle-backend-2.onrender.com/api';

export async function fetchHustlesFromApi(params?: {
  campus?: string;
  category?: string;
  location?: string;
  search?: string;
}): Promise<Hustle[]> {
  try {
    const queryParts: string[] = [];
    if (params?.campus) queryParts.push(`campus=${encodeURIComponent(params.campus)}`);
    if (params?.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.location) queryParts.push(`location=${encodeURIComponent(params.location)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await fetch(`${API_BASE_URL}/hustles${queryString}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn(`Cloud API connection failed (${API_BASE_URL}), falling back to local state:`, error);
    throw error;
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
    throw new Error('Failed to create hustle in backend API');
  }

  return response.json();
}

export async function initializeMoMoPayment(paymentData: {
  hustleId: string;
  buyerEmail: string;
  momoNumber: string;
  paymentMethod?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize Mobile Money payment.');
  }

  return response.json();
}

export async function verifyMoMoPayment(reference: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`);
  if (!response.ok) {
    throw new Error('Failed to verify payment reference.');
  }
  return response.json();
}
