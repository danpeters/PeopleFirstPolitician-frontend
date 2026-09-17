// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\settings\page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';


/**
 * Settings Page
 *
 * Purpose:
 * - Provides the central settings interface for the PeopleFirst Politician platform.
 * - Displays and manages authenticated user account information.
 * - Provides sections for account, security, application and session settings.
 *
 * Account features:
 * - View profile information.
 * - Edit full name, email address and phone number.
 * - Save profile changes through the existing Users API.
 * - Keep role and account status read-only.
 */
export default function SettingsPage() {
  
  const { user, refreshUser, updateUser } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // File: C:\Projects\PeopleFirstPolitician\frontend\src\app\settings\page.tsx

  /**
   * Controls whether the Change Password form is visible.
   */
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  /**
   * Load the authenticated user's current profile information
   * into the editable form.
   */
  useEffect(() => {
    setFullName(user?.fullName || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user]);

  /**
   * Format the user's role safely.
   *
   * The application may receive the role as either:
   * - a string, such as "super_admin"
   * - an object containing a name property
   */
  // File: C:\Projects\PeopleFirstPolitician\frontend\src\app\settings\page.tsx

  const formatRole = () => {
    if (user?.role?.name) {
      return user.role.name.replace(/_/g, ' ');
    }

    return 'Not available';
  };

  /**
   * Cancel profile editing and restore the current account values.
   */
  const handleCancelEdit = () => {
    setFullName(user?.fullName || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setSaveMessage('');
    setSaveError('');
    setIsEditingProfile(false);
  };

  /**
   * Save the authenticated user's profile changes.
   */
  // File: C:\Projects\PeopleFirstPolitician\frontend\src\app\settings\page.tsx

  /**
   * Save the authenticated user's profile changes.
   */
  const handleSaveProfile = async () => {
    if (!user?.id) {
      setSaveError('Unable to identify the current user.');
      return;
    }

    if (!fullName.trim()) {
      setSaveError('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setSaveError('Email address is required.');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const response = await apiClient.patch(`/users/${user.id}`, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });

      /**
       * The backend returns the updated user without sensitive fields.
       * Update AuthContext directly so the active session is preserved.
       */
      if (response.data) {
        updateUser(response.data);

        /**
         * Keep the locally stored user information synchronised.
         */
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'user',
            JSON.stringify(response.data),
          );
        }
      }

      setSaveMessage('Profile updated successfully.');
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Profile update error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update your profile. Please try again.';

      setSaveError(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // File: C:\Projects\PeopleFirstPolitician\frontend\src\app\settings\page.tsx

  /**
   * Change the authenticated user's password.
   *
   * Security:
   * - Sends the current password for server-side verification.
   * - Sends the new password only through the authenticated API request.
   * - Does not log password values.
   * - Clears the password form after a successful change.
   */
  const handleChangePassword = async () => {
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }

    if (!confirmPassword) {
      setPasswordError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError('New password must be at least 12 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError(
        'New password must contain at least one uppercase letter.',
      );
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError(
        'New password must contain at least one lowercase letter.',
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError(
        'New password must contain at least one number.',
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError(
        'New password must contain at least one special character.',
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMessage(
        response?.data?.message || 'Password changed successfully.',
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to change your password. Please try again.';

      setPasswordError(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      setIsChangingPassword(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Page header */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '28px 40px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          Settings
        </h1>

        <p
          style={{
            margin: '8px 0 0',
            fontSize: '15px',
            color: '#6B7280',
          }}
        >
          Manage your account, security and application preferences.
        </p>
      </header>

      {/* Settings content */}
      <main style={{ padding: '32px 40px', maxWidth: '1100px' }}>
        {/* Account Settings */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                Account Settings
              </h2>

              <p
                style={{
                  margin: '6px 0 20px',
                  fontSize: '14px',
                  color: '#6B7280',
                }}
              >
                View and manage your current account information.
              </p>
            </div>

            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => {
                  setSaveMessage('');
                  setSaveError('');
                  setIsEditingProfile(true);
                }}
                style={{
                  padding: '9px 16px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {saveMessage && (
            <div
              style={{
                marginBottom: '20px',
                padding: '11px 14px',
                borderRadius: '7px',
                background: '#DCFCE7',
                color: '#166534',
                fontSize: '14px',
              }}
            >
              {saveMessage}
            </div>
          )}

          {saveError && (
            <div
              style={{
                marginBottom: '20px',
                padding: '11px 14px',
                borderRadius: '7px',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: '14px',
              }}
            >
              {saveError}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '20px',
            }}
          >
            {/* Full Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Full Name
              </label>

              {isEditingProfile ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: '#FFFFFF',
                    color: '#111827',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: '11px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: '#F9FAFB',
                    color: '#111827',
                    fontSize: '14px',
                  }}
                >
                  {user?.fullName || 'Not available'}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>

              {isEditingProfile ? (
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: '#FFFFFF',
                    color: '#111827',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: '11px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: '#F9FAFB',
                    color: '#111827',
                    fontSize: '14px',
                  }}
                >
                  {user?.email || 'Not available'}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Phone Number
              </label>

              {isEditingProfile ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter phone number"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: '#FFFFFF',
                    color: '#111827',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: '11px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '7px',
                    background: '#F9FAFB',
                    color: '#111827',
                    fontSize: '14px',
                  }}
                >
                  {user?.phone || 'Not available'}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Role
              </label>

              <div
                style={{
                  padding: '11px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '7px',
                  background: '#F9FAFB',
                  color: '#111827',
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}
              >
                {formatRole()}
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Account Status
              </label>

              <div
                style={{
                  padding: '11px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '7px',
                  background: '#F9FAFB',
                  color: '#111827',
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}
              >
                {user?.status?.toLowerCase() || 'Not available'}
              </div>
            </div>
          </div>

          {/* Profile action buttons */}
          {isEditingProfile && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{
                  padding: '10px 18px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '7px',
                  background: '#FFFFFF',
                  color: '#374151',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '7px',
                  background: isSaving ? '#93C5FD' : '#2563EB',
                  color: '#FFFFFF',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </section>

        {/* Security Settings */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Security
          </h2>

          <p
            style={{
              margin: '6px 0 20px',
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            Manage account security and authentication options.
          </p>

          
          <div
            style={{
              padding: '16px 0',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            {/* Password heading and button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >

            {/* Change Password form */}
            {isPasswordFormOpen && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  background: '#F9FAFB',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 6px',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
                >
                  Change Password
                </h3>

                <p
                  style={{
                    margin: '0 0 18px',
                    fontSize: '13px',
                    color: '#6B7280',
                  }}
                >
                  Enter your current password and choose a new password.
                </p>

                {passwordMessage && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '11px 14px',
                      borderRadius: '7px',
                      background: '#DCFCE7',
                      color: '#166534',
                      fontSize: '14px',
                    }}
                  >
                    {passwordMessage}
                  </div>
                )}

                {passwordError && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '11px 14px',
                      borderRadius: '7px',
                      background: '#FEE2E2',
                      color: '#991B1B',
                      fontSize: '14px',
                    }}
                  >
                    {passwordError}
                  </div>
                )}

                {/* Current Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      color: '#111827',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* New Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      color: '#111827',
                      fontSize: '14px',
                    }}
                  />

                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      color: '#6B7280',
                    }}
                  >
                    Minimum 12 characters, including uppercase, lowercase,
                    number and special character.
                  </div>
                </div>

                {/* Confirm New Password */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      color: '#111827',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Form buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordMessage('');
                      setPasswordError('');
                      setIsPasswordFormOpen(false);
                    }}
                    disabled={isChangingPassword}
                    style={{
                      padding: '10px 18px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '7px',
                      background: '#FFFFFF',
                      color: '#374151',
                      cursor: isChangingPassword
                        ? 'not-allowed'
                        : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    style={{
                      padding: '10px 18px',
                      border: 'none',
                      borderRadius: '7px',
                      background: isChangingPassword
                        ? '#93C5FD'
                        : '#2563EB',
                      color: '#FFFFFF',
                      cursor: isChangingPassword
                        ? 'not-allowed'
                        : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {isChangingPassword
                      ? 'Changing Password...'
                      : 'Save New Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                Password
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '13px',
                  color: '#6B7280',
                }}
              >
                Change your account password.
              </div>
            </div>

            
            <button
              type="button"
              
              onClick={() => {
                setPasswordMessage('');
                setPasswordError('');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsPasswordFormOpen(true);
              }}
              style={{
                padding: '9px 16px',
                border: '1px solid #2563EB',
                borderRadius: '7px',
                background: '#FFFFFF',
                color: '#2563EB',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Change Password
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0 0',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                Authentication Session
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '13px',
                  color: '#6B7280',
                }}
              >
                Your current authenticated session is active.
              </div>
            </div>

            <span
              style={{
                padding: '5px 10px',
                borderRadius: '999px',
                background: '#DCFCE7',
                color: '#166534',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Active
            </span>
          </div>
        </section>

        {/* Application Settings */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Application Settings
          </h2>

          <p
            style={{
              margin: '6px 0 20px',
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            Configure platform preferences.
          </p>

          <div
            style={{
              padding: '16px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              background: '#F9FAFB',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Platform Preferences
            </div>

            <div
              style={{
                marginTop: '5px',
                fontSize: '13px',
                color: '#6B7280',
              }}
            >
              Additional application preferences will be available here as
              the platform modules are implemented.
            </div>
          </div>
        </section>

        {/* Session Information */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            padding: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Session Information
          </h2>

          <p
            style={{
              margin: '6px 0 20px',
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            Information about your current platform session.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '4px',
                }}
              >
                Authentication
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                JWT Authentication
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '4px',
                }}
              >
                Access Level
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                  textTransform: 'capitalize',
                }}
              >
                {formatRole()}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}