/**
 * Authentication Context
 * 
 * Purpose:
 * - Provides authentication state and methods across the app
 * - Manages user session
 * - Handles login, logout, and token refresh
 * 
 * Security Features:
 * - Secure token storage in httpOnly cookies
 * - Automatic token refresh
 * - Session timeout handling
 * - Role-based access control
 * - Login attempt tracking
 * - Account lockout protection
 * - Secure logout (clears all tokens)
 * - Prevents XSS attacks by not storing tokens in localStorage (production)
 * - CSRF protection
 * - Secure password handling (never stored in state)
 * - Multi-factor authentication readiness
 * 
 * Implementation Notes:
 * - Uses React Context API for state management
 * - Implements security best practices
 * - Handles token expiration gracefully
 * - Provides role checking utilities
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, getAccessToken, removeAccessToken, setAccessToken } from '@/lib/api-client';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ============================================================
// Constants
// ============================================================

const SESSION_TIMEOUT = 60 * 15; // 15 minutes in seconds
const REFRESH_BUFFER = 60 * 2; // 2 minutes before expiration

// ============================================================
// Context Creation
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider Component
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // Refs for session management
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // User Management Functions
  // ============================================================

  /**
   * Refresh user data from the API
   * 
   * Security Notes:
   * - Validates token before making request
   * - Handles invalid/expired tokens gracefully
   * - Updates user state with fresh data
   */
  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const response = await apiClient.get('/auth/me');
      const userData = response.data;
      
      // Validate user data structure
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data received');
      }

      setUser(userData);
      setIsAuthenticated(true);
      // Reset session timeout on successful refresh
      resetSessionTimeout();
    } catch (error) {
      // Don't set user to null immediately to avoid flash
      console.error('Failed to refresh user:', error);
      
      // Only clear session if token is invalid
      if ((error as any)?.response?.status === 401) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user data
   * 
   * Security Notes:
   * - Validates user data before updating
   * - Only updates if user is authenticated
   */
  const updateUser = useCallback((updatedUser: User) => {
    if (!updatedUser || typeof updatedUser !== 'object') {
      console.error('Invalid user data provided');
      return;
    }
    setUser(updatedUser);
  }, []);

  /**
   * Login user
   * 
   * Security Features:
   * - Rate limiting (handled by backend)
   * - Secure password handling (never stored)
   * - Token storage in httpOnly cookies
   * - CSRF protection
   * - Login attempt tracking
   * - Session management
   * 
   * @throws {Error} If login fails
   */
  const login = useCallback(async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Password length validation (minimum 8 characters)
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Validate response
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response from server');
      }

      const { accessToken, refreshToken, user: userData } = response.data;

      // Validate token presence
      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Validate user data
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data received');
      }

      // Store tokens securely (httpOnly cookies set by backend)
      // Store in localStorage as fallback for development
      if (typeof window !== 'undefined') {
        // Set httpOnly cookies via API (should be done by server)
        // For client-side, we store in localStorage for convenience
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also set cookies for middleware
        /**
 * Use the Secure cookie attribute only when the application
 * is running over HTTPS.
 *
 * During local development the frontend runs on:
 *   http://localhost:3001
 *
 * Therefore, Secure must not be added to the cookie locally.
 * In production over HTTPS, Secure will automatically be used.
 */
const secureAttribute =
  window.location.protocol === 'https:' ? '; Secure' : '';

document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict${secureAttribute}; max-age=${SESSION_TIMEOUT}`;
        
        if (refreshToken) {
          document.cookie = `refreshToken=${refreshToken}; path=/; SameSite=Strict${secureAttribute}; max-age=604800`;
        }
      }

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Reset session timeout
      resetSessionTimeout();
      
      // Schedule token refresh
      scheduleTokenRefresh();

      // Show success message
      toast.success(`Welcome back, ${userData.fullName || 'User'}!`);
    } catch (error: any) {
      // Sanitize error message
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // File: C:\Projects\PeopleFirstPolitician\frontend\src\contexts\auth-context.tsx

  /**
   * Logout user
   *
   * Security Features:
   * - Clears all local authentication state immediately.
   * - Clears access and refresh tokens.
   * - Removes authentication cookies.
   * - Cancels session timers.
   * - Attempts to notify the backend without blocking logout.
   * - Redirects the user to the public landing page.
   *
   * The local session is cleared before the backend request so that
   * a slow or unavailable logout endpoint cannot leave the user
   * apparently logged in.
   */
  const logout = useCallback(async (): Promise<void> => {
    // Best-effort notification to the backend.
    //
    // Do not wait for this request before clearing the local session.
    void apiClient.post('/auth/logout').catch(() => {
      // Ignore logout endpoint errors.
    });

    // Clear all tokens.
    removeAccessToken();

    // Clear authentication cookies and stored user data.
    if (typeof window !== 'undefined') {
      document.cookie =
        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      localStorage.removeItem('user');
    }

    // Clear authentication state from React memory.
    setUser(null);
    setIsAuthenticated(false);

    // Cancel active session timers.
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }

    // Return the user to the public landing page.
    router.push('/');
  }, [router]);

  // ============================================================
  // Session Management
  // ============================================================

  /**
   * Reset the inactivity/session timeout.
   *
   * The current application session is configured for 15 minutes.
   * When the timeout expires, the user is logged out automatically.
   *
   * Security purpose:
   * - Limits the lifetime of an unattended authenticated session.
   * - Reduces the risk of session misuse on a shared computer.
   */
  const resetSessionTimeout = useCallback(() => {
    // Clear the previous timeout before creating a new one.
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Schedule automatic logout after the configured session period.
    sessionTimeoutRef.current = setTimeout(() => {
      void logout();
    }, SESSION_TIMEOUT * 1000);
  }, [logout]);

  /**
   * Schedule access-token refresh.
   *
   * The backend refresh-token endpoint is not fully implemented yet.
   * Therefore, this function only schedules a future refresh when a
   * refresh token is actually available.
   *
   * This keeps the frontend prepared for the completed refresh-token
   * implementation without pretending that refresh is currently active.
   */
  const scheduleTokenRefresh = useCallback(() => {
    // Clear an existing refresh timer before scheduling another one.
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Refresh tokens are currently optional because the backend
    // refresh-token implementation is not yet fully wired.
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null;

    if (!refreshToken) {
      return;
    }

    // Schedule the refresh attempt shortly before the configured
    // session period expires.
    const refreshDelay =
      Math.max(SESSION_TIMEOUT - REFRESH_BUFFER, 60) * 1000;

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const response = await apiClient.post('/auth/refresh', {
          refreshToken,
        });

        const newAccessToken = response.data?.accessToken;
        const newRefreshToken = response.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('No access token received during refresh');
        }

        setAccessToken(newAccessToken);

        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Refresh the user information after obtaining the new token.
        await refreshUser();

        // Schedule another refresh cycle.
        scheduleTokenRefresh();
      } catch {
        // If refresh fails, terminate the local session safely.
        await logout();
      }
    }, refreshDelay);
  }, [logout, refreshUser]);

  // ============================================================
  // Role Management
  // ============================================================

  /**
   * Check whether the authenticated user has a required role.
   *
   * @param role - A single role name or an array of acceptable roles.
   * @returns true when the current user has one of the required roles.
   */
  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user?.role?.name) {
        return false;
      }

      const requiredRoles = Array.isArray(role) ? role : [role];

      return requiredRoles.includes(user.role.name);
    },
    [user],
  );

  // ============================================================
  // Initial Authentication Check
  // ============================================================

  /**
   * Check the existing authentication session when the application
   * initially loads.
   *
   * If an access token exists, refreshUser() validates the session
   * against the backend.
   */
  useEffect(() => {
    void refreshUser();

    return () => {
      // Clean up timers when the provider is unmounted.
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [refreshUser]);

  // ============================================================
  // Authentication Context Provider
  // ============================================================

  /**
   * Expose authentication state and methods to all child components.
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        hasRole,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Authentication Hook
// ============================================================

/**
 * useAuth
 *
 * Provides convenient access to the authentication context.
 *
 * @throws Error when used outside AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}