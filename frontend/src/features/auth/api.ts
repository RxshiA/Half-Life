import api from '@/lib/api';

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  me: async (): Promise<PublicUser> => {
    const res = await api.get<{ user: PublicUser }>('/auth/me');
    return res.data.user;
  },
};
