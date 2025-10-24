export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'AGENT';
  nid?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
