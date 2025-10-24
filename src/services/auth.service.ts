import apiClient from './api.service';
import { API_ENDPOINTS } from '../constants';
import { LoginCredentials, RegisterData, AuthResponse } from '../types';
import { StorageService } from '../utils';

export const AuthService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );

    // Save tokens to storage
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      
      console.log('Login Response:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        accessTokenPreview: accessToken?.substring(0, 20) + '...',
      });
      
      if (accessToken) {
        await StorageService.saveAccessToken(accessToken);
      }
      if (refreshToken) {
        await StorageService.saveRefreshToken(refreshToken);
      }
      if (user) {
        await StorageService.saveUserData(user);
      }
    }

    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data
    );

    // Save tokens to storage if registration includes auto-login
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      if (accessToken) {
        await StorageService.saveAccessToken(accessToken);
        await StorageService.saveRefreshToken(refreshToken);
        await StorageService.saveUserData(user);
      }
    }

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      await StorageService.clearAll();
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { email });
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getAccessToken();
    return !!token;
  },

  /**
   * Get current user data from storage
   */
  async getCurrentUser(): Promise<any | null> {
    return await StorageService.getUserData();
  },
};
