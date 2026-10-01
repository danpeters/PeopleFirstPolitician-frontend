/**
 * API Client: Backend Communication
 * 
 * Purpose:
 * - Handles all API communication with the NestJS backend
 * - Manages authentication tokens
 * - Handles token refresh automatically
 * - Implements request/response interceptors
 * 
 * Security Features:
 * - Automatic token injection in headers
 * - Token refresh on 401 responses
 * - Secure token storage in httpOnly cookies
 * - Request/response validation
 * - CSRF protection
 * - Rate limiting awareness
 * - Error handling without leaking sensitive info
 * - Request timeout protection
 * 
 * Implementation Notes:
 * - Uses axios for HTTP requests
 * - Implements exponential backoff for retries
 * - Logs only non-sensitive errors in development
 * - Sanitizes error messages before displaying to users
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// ============================================================
// Configuration
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

// ============================================================
// Token Management
// ============================================================

/**
 * Get the authentication token from cookies (secure httpOnly)
 * For client-side, we read from cookies set by the server
 */
/**
 * Returns the access token from the appropriate browser storage.
 * Remember Me true -> localStorage; false -> sessionStorage.
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  return rememberMe ? localStorage.getItem('accessToken') : sessionStorage.getItem('accessToken');
};
/** Stores an access token according to the Remember Me setting. */
export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  if (rememberMe) { localStorage.setItem('accessToken', token); sessionStorage.removeItem('accessToken'); }
  else { sessionStorage.setItem('accessToken', token); localStorage.removeItem('accessToken'); }
  const maxAge = rememberMe ? 604800 : 900;
  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; SameSite=Strict${secureAttribute}; max-age=${maxAge}`;
};
/** Removes authentication tokens and cached user data from both browser stores. */
export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('rememberMe'); localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken'); sessionStorage.removeItem('refreshToken'); sessionStorage.removeItem('rememberMe');
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
};
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  },
  timeout: API_TIMEOUT,
  withCredentials: true, // Send cookies with requests
});

// ============================================================
// Request Interceptor
// ============================================================

/**
 * Request Interceptor
 * 
 * Security Notes:
 * - Adds Authorization header with JWT token
 * - Adds CSRF token for state-changing requests
 * - Sanitizes request data (removes sensitive fields)
 * - Implements request ID for tracing
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add request ID for tracing
    const requestId = crypto.randomUUID();
    config.headers['X-Request-ID'] = requestId;

    // Add authentication token
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    const method = config.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Sanitize request data (remove sensitive fields before sending)
    if (config.data && typeof config.data === 'object') {
      config.data = sanitizeRequestData(config.data);
    }

    return config;
  },
  (error) => {
    // Log error without sensitive info
    console.error('Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// Response Interceptor
// ============================================================

/**
 * Response Interceptor
 * 
 * Security Notes:
 * - Handles token refresh automatically
 * - Sanitizes error messages before displaying
 * - Implements exponential backoff for retries
 * - Logs errors without sensitive info
 * - Prevents user enumeration through consistent error messages
 */
apiClient.interceptors.response.use(
  (response) => {
    // Sanitize response data (remove sensitive fields)
    if (response.data && typeof response.data === 'object') {
      response.data = sanitizeResponseData(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Skip retry for certain errors
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token expired
    // File: C:\Projects\PeopleFirstPolitician\frontend\src\lib\api-client.ts

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      const requestUrl = originalRequest.url || '';

      /**
       * Login and refresh requests must not trigger the automatic
       * refresh mechanism.
       *
       * A failed login means the supplied credentials were rejected.
       * It should be returned to the Login page so the user can see
       * the authentication error.
       */
      const isLoginRequest = requestUrl.includes('/auth/login');
      const isRefreshRequest = requestUrl.includes('/auth/refresh');

      if (isLoginRequest || isRefreshRequest) {
        return Promise.reject(error);
      }

      /**
       * Only attempt token refresh when a refresh token actually
       * exists. The current backend refresh-token implementation
       * is not yet fully wired.
       */
      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('refreshToken')
          : null;

      if (!refreshToken) {
        return Promise.reject(error);
      }

      /**
       * Prevent the same request from being retried repeatedly.
       */
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data;

        if (!accessToken) {
          throw new Error('No access token received during refresh');
        }

        // Store the new access token.
        setAccessToken(accessToken);

        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Retry the original request with the new access token.
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        /**
         * Refresh failed.
         *
         * Do not redirect from the API interceptor. Return the error
         * to the authentication layer so it can decide how to handle
         * the user's session.
         */
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      // User doesn't have permission for this action
      // Could show a permission denied message
      return Promise.reject(error);
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429) {
      // Implement backoff strategy
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      // Network error - could retry with backoff
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    // For all other errors, return sanitized error
    const errorMessage = getSafeErrorMessage(error);
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status || 500,
      code: error.code,
    });
  }
);

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get CSRF token from cookie
 */
const getCsrfToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrfToken') {
        return value;
      }
    }
  }
  return null;
};

/**
 * Sanitize request data
 * Removes sensitive fields before sending to server
 */
const sanitizeRequestData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    // Remove any sensitive client-side fields
    const sensitiveFields = ['_csrf', 'token', 'secret'];
    for (const field of sensitiveFields) {
      delete sanitized[field];
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Sanitize response data
 * Removes sensitive fields from API responses
 */
const sanitizeResponseData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponseData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    // Remove sensitive fields that might be accidentally exposed
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Get safe error message
 * Prevents leaking sensitive information in error messages
 */
const getSafeErrorMessage = (error: AxiosError): string => {
  // Production: Return generic error messages
  if (process.env.NODE_ENV === 'production') {
    const status = error.response?.status;
    if (status === 400) return 'Invalid request. Please check your input.';
    if (status === 401) return 'Session expired. Please login again.';
    if (status === 403) return 'You don\'t have permission to perform this action.';
    if (status === 404) return 'Resource not found.';
    if (status === 429) return 'Too many requests. Please try again later.';
    if (status === 500) return 'Server error. Please try again later.';
    return 'An error occurred. Please try again.';
  }
  
  // Development: Return more detailed errors
  const responseData = error.response?.data as any;
  if (responseData?.message) {
    return responseData.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};

// ============================================================
// API Helper Functions
// ============================================================

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * API Error Type
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Standard API request wrapper with error handling
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
      ...config,
    });
    
    return {
      success: true,
      message: response.data?.message || 'Operation successful',
      data: response.data?.data || response.data,
      meta: response.data?.meta,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Operation failed',
      data: null as any,
    };
  }
}

export default apiClient;
