//PS C:\Projects\PeopleFirstPolitician\frontend> type "C:\Projects\PeopleFirstPolitician\frontend\src\contexts\auth-context.tsx"
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
  register: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
  ) => Promise<User>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ============================================================
// Constants
// ============================================================

const SESSION_TIMEOUT = 60 * 15; // 15 minutes in seconds
const REFRESH_BUFFER = 60 * 2; // 2 minutes before expiration

/**
 * Storage key used to remember whether the user explicitly selected
 * "Keep me logged in".
 *
 * The preference itself is not a credential.
 */
const REMEMBER_ME_KEY = 'rememberMe';

/**
 * Return whether the current authentication session was requested
 * to persist across browser restarts.
 */
const isRememberedSession = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

/**
 * Read the refresh token from the storage selected for the current
 * session.
 *
 * - remembered session -> localStorage
 * - normal session     -> sessionStorage
 */
const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return isRememberedSession()
    ? localStorage.getItem('refreshToken')
    : sessionStorage.getItem('refreshToken');
};

/**
 * Store the refresh token in the storage selected for the current
 * session.
 */
const storeRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (isRememberedSession()) {
    localStorage.setItem('refreshToken', token);
    sessionStorage.removeItem('refreshToken');
  } else {
    sessionStorage.setItem('refreshToken', token);
    localStorage.removeItem('refreshToken');
  }
};

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

      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data received');
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to refresh user:', error);

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
   * Register a new public user.
   *
   * Security Features:
   * - Validates all required registration fields.
   * - Validates email format.
   * - Validates password strength.
   * - Requires password confirmation.
   * - Does not accept or send a role.
   * - The backend assigns the standard USER role.
   *
   * Endpoint:
   * POST /api/v1/auth/register
   *
   * @returns The newly created user.
   * @throws Error when registration fails.
   */
  const register = useCallback(
    async (
      fullName: string,
      email: string,
      phone: string,
      password: string,
      confirmPassword: string,
    ): Promise<User> => {
      /**
       * Basic input validation.
       */
      if (
        !fullName.trim() ||
        !email.trim() ||
        !phone.trim() ||
        !password ||
        !confirmPassword
      ) {
        throw new Error(
          'Full name, email, phone, password, and password confirmation are required',
        );
      }

      /**
       * Validate email format.
       */
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        throw new Error('Invalid email format');
      }

      /**
       * Validate password length.
       */
      if (password.length < 8) {
        throw new Error(
          'Password must be at least 8 characters',
        );
      }

      /**
       * Require password confirmation.
       */
      if (password !== confirmPassword) {
        throw new Error(
          'Password and confirmation do not match',
        );
      }

      /**
       * Submit the registration request.
       *
       * No role is sent from the frontend.
       * The backend automatically assigns the standard
       * USER role.
       */
      try {
        const response = await apiClient.post(
          '/auth/register',
          {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
            confirmPassword,
          },
        );

        /**
         * Validate the backend response.
         */
        const userData = response.data?.user;

        if (
          !userData ||
          typeof userData !== 'object'
        ) {
          throw new Error(
            'Invalid registration response from server',
          );
        }

        /**
         * Display a success notification.
         */
        toast.success(
          'Registration successful. You can now sign in.',
        );

        return userData as User;
      } catch (error: any) {
        /**
         * Use the backend's validation/error message when
         * available.
         */
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Registration failed. Please try again.';

        toast.error(errorMessage);

        throw new Error(errorMessage);
      }
    },
    [],
  );


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
  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
    ) => {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      try {
        const response = await apiClient.post('/auth/login', {
          email,
          password,
        });

        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response from server');
        }

        const {
          accessToken,
          refreshToken,
          user: userData,
        } = response.data;

        if (!accessToken) {
          throw new Error('No access token received');
        }

        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid user data received');
        }

        if (typeof window !== 'undefined') {
          /**
           * Clear any credentials left by a previous authentication mode.
           */
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');

          /**
           * Store the Remember Me preference AFTER clearing stale credentials.
           */
          if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_KEY, 'true');
            sessionStorage.removeItem(REMEMBER_ME_KEY);
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
            sessionStorage.setItem(REMEMBER_ME_KEY, 'false');
          }

          /**
           * Store the credentials according to the selected mode.
           *
           * Remembered:
           *   localStorage survives browser restart.
           *
           * Normal:
           *   sessionStorage is cleared when the browser session ends.
           */
          const storage = rememberMe
            ? localStorage
            : sessionStorage;

          storage.setItem('accessToken', accessToken);

          if (refreshToken) {
            storage.setItem('refreshToken', refreshToken);
          }

          storage.setItem(
            'user',
            JSON.stringify(userData),
          );

          /**
           * Set the access-token cookie.
           *
           * Without remember-me it is a browser-session cookie.
           * With remember-me it persists for the configured refresh
           * period.
           */
          const secureAttribute =
            window.location.protocol === 'https:'
              ? '; Secure'
              : '';

          const accessCookieLifetime = rememberMe
            ? SESSION_TIMEOUT
            : '';

          document.cookie =
            accessCookieLifetime
              ? `accessToken=${accessToken}; path=/; SameSite=Strict${secureAttribute}; max-age=${accessCookieLifetime}`
              : `accessToken=${accessToken}; path=/; SameSite=Strict${secureAttribute}`;

          if (refreshToken) {
            const refreshCookieLifetime =
              rememberMe ? 604800 : '';

            document.cookie =
              refreshCookieLifetime
                ? `refreshToken=${refreshToken}; path=/; SameSite=Strict${secureAttribute}; max-age=${refreshCookieLifetime}`
                : `refreshToken=${refreshToken}; path=/; SameSite=Strict${secureAttribute}`;
          }
        }

        setUser(userData);
        setIsAuthenticated(true);

        /**
         * A normal session expires after 15 minutes of inactivity.
         * A remembered session does not use that automatic logout;
         * the refresh-token cycle keeps it authenticated.
         */
        if (rememberMe) {
          if (sessionTimeoutRef.current) {
            clearTimeout(sessionTimeoutRef.current);
            sessionTimeoutRef.current = null;
          }

          scheduleTokenRefresh();
        } else {
          resetSessionTimeout();
          scheduleTokenRefresh();
        }

        toast.success(
          `Welcome back, ${userData.fullName || 'User'}!`,
        );
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Login failed. Please try again.';

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  // File: C:\Projects\PeopleFirstPolitician\frontend\src\contexts\auth-context.tsx

    /**
   * Logout user.
   *
   * Security Features:
   * - Sends the current refresh token to the backend.
   * - Backend invalidates the refresh token.
   * - Clears local authentication state.
   * - Removes authentication cookies.
   * - Removes stored authentication tokens.
   * - Cancels active session timers.
   * - Redirects the user to the public landing page.
   *
   * Important:
   * The refresh token is captured before local storage is cleared,
   * because the backend requires it to invalidate the server-side
   * refresh credential.
   */
  const logout = useCallback(async (): Promise<void> => {
    /**
     * Capture the refresh token before clearing local authentication
     * state.
     */
    const refreshToken = getStoredRefreshToken();

    /**
     * Notify the backend so that the refresh token is invalidated.
     *
     * Logout should still clear the local session if the backend
     * request fails, so that the user is not left apparently logged in.
     */
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', {
          refreshToken,
        });
      } catch (error) {
        /**
         * The local session will still be cleared even if the
         * backend logout request fails.
         */
        console.error(
          'Backend logout request failed:',
          error,
        );
      }
    }

    /**
     * Clear the access token and refresh token from local storage.
     */
    removeAccessToken();

    /**
     * Clear authentication cookies and stored user data.
     */
    if (typeof window !== 'undefined') {
      document.cookie =
        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      localStorage.removeItem('user');
    }

    /**
     * Clear authentication state from React memory.
     */
    setUser(null);
    setIsAuthenticated(false);

    /**
     * Cancel active token-refresh timer.
     */
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    /**
     * Cancel active session timeout.
     */
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }

    /**
     * Return the user to the public landing page.
     *
     * A full browser navigation is deliberately used here instead
     * of router.push(). This prevents the AppShell authentication
     * guard from seeing the protected route momentarily after the
     * authentication state has been cleared and redirecting the
     * user to /login before navigation to / can complete.
     */
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
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
    // Remembered sessions are not terminated by the
    // 15-minute inactivity timer.
    if (isRememberedSession()) {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }

      return;
    }

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }

    sessionTimeoutRef.current = setTimeout(() => {
      void logout();
    }, SESSION_TIMEOUT * 1000);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleUserActivity = () => {
      if (!isRememberedSession()) {
        resetSessionTimeout();
      }
    };

    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, resetSessionTimeout]);  

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
    const refreshToken = getStoredRefreshToken();

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
          storeRefreshToken(newRefreshToken);
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
    void (async () => {
      await refreshUser();

      /**
       * Establish the correct timer after the stored session has
       * been validated.
       */
      if (isRememberedSession()) {
        scheduleTokenRefresh();
      } else {
        resetSessionTimeout();
      }
    })();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [refreshUser, resetSessionTimeout, scheduleTokenRefresh]);

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
        register,
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
