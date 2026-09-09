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
    console.warn(`Cloud API connection error:`, error);
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
