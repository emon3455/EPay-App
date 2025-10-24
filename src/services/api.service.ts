import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants';
import { StorageService } from '../utils';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await StorageService.getAccessToken();
    if (token && config.headers) {
      // Send token directly without "Bearer" prefix to match backend expectation
      config.headers.Authorization = token;
      console.log('Request URL:', config.url);
      console.log('Authorization Header Set:', token.substring(0, 20) + '...');
    } else {
      console.log('Request URL:', config.url);
      console.log('No token available');
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    console.log('API Response Error:', error.config?.url, error.response?.status);
    console.log('Error Details:', error.response?.data);
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await StorageService.getRefreshToken();
        
        if (refreshToken) {
          console.log('Attempting token refresh...');
          // Send refresh token in the request body since mobile can't use cookies
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh-token`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          console.log('Token refresh successful');
          
          await StorageService.saveAccessToken(accessToken);
          if (newRefreshToken) {
            await StorageService.saveRefreshToken(newRefreshToken);
          }

          if (originalRequest.headers) {
            // Send token directly without "Bearer" prefix
            originalRequest.headers.Authorization = accessToken;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        await StorageService.clearAll();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
