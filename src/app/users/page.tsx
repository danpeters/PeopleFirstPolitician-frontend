/**
 * ============================================================
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\users\page.tsx
 *
 * Purpose:
 * - Display system users retrieved from the backend
 * - Search and paginate users
 * - Create new internal users
 *
 * Backend API:
 * - GET  /api/v1/users
 * - POST /api/v1/users
 *
 * Security:
 * - Backend requires JWT authentication.
 * - Backend restricts user management to super_admin.
 * - Backend validates all submitted fields.
 * - Passwords are hashed by the backend before storage.
 *
 * Supported roles:
 * - super_admin
 * - campaign_manager
 * - analyst
 *
 * Important:
 * - The frontend does not store passwords.
 * - The backend is the final authority for validation
 *   and authorisation.
 * ============================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

/**
 * Role returned by the backend.
 */
interface UserRole {
  id: string;
  name: string;
  description?: string;
}

/**
 * User object returned by the backend.
 */
interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  role?: UserRole;
}

/**
 * Pagination metadata returned by the backend.
 */
interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Standard paginated users response.
 */
interface UsersResponse {
  items: User[];
  meta: PaginationMeta;
}

/**
 * Valid roles defined by the backend RoleEnum.
 */
const AVAILABLE_ROLES = [
  {
    value: 'super_admin',
    label: 'Super Administrator',
  },
  {
    value: 'campaign_manager',
    label: 'Campaign Manager',
  },
  {
    value: 'analyst',
    label: 'Analyst',
  },
];

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
 * Controls whether soft-deleted users are included
 * in the users table.
 *
 * false:
 * - Shows active users only.
 *
 * true:
 * - Requests active and soft-deleted users from
 *   the backend using includeDeleted=true.
 */
const [showDeleted, setShowDeleted] = useState(false);

  /**
   * Controls the Add User modal.
   */
  const [showAddUser, setShowAddUser] = useState(false);

  /**
   * Add User form state.
   */
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('analyst');

  /**
   * Controls form submission.
   */
  const [creatingUser, setCreatingUser] = useState(false);
  /**
 * Controls the Edit User modal.
 */
const [showEditUser, setShowEditUser] = useState(false);

/**
 * User currently being edited.
 */
const [editingUser, setEditingUser] = useState<User | null>(null);

/**
 * Edit User form state.
 */
const [editFullName, setEditFullName] = useState('');
const [editEmail, setEditEmail] = useState('');
const [editPhone, setEditPhone] = useState('');
/**
 * Edit User status.
 *
 * Must match the backend UserStatusEnum values.
 */
const [editStatus, setEditStatus] = useState('ACTIVE');

/**
 * Controls edit form submission.
 */
const [updatingUser, setUpdatingUser] = useState(false);
/**
 * Controls the Delete User confirmation dialog
 * and deletion process.
 */
const [deletingUser, setDeletingUser] =
  useState(false);

/**
 * Controls the custom confirmation dialog used before
 * deleting or restoring a user.
 *
 * A custom dialog is used instead of window.confirm() so
 * the confirmation experience matches the application's
 * visual design and remains accessible and predictable.
 */
const [confirmationUser, setConfirmationUser] =
  useState<User | null>(null);

const [confirmationAction, setConfirmationAction] =
  useState<'delete' | 'restore' | null>(null);

/**
 * Displays edit-form errors.
 */
const [editError, setEditError] = useState('');


  /**
   * Displays form-level creation errors.
   */
  const [formError, setFormError] = useState('');

  /**
   * Fetch users from the backend.
   *
   * Endpoint:
   * GET /api/v1/users
   */
  const fetchUsers = async (
    page = 1,
    searchValue = search,
  ) => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/users', {
        params: {
          page,
          limit: 10,
          search: searchValue.trim() || undefined,
          sortBy: 'createdAt',
          sortOrder: 'DESC',

          /**
           * Only explicitly request deleted users when
           * the administrator enables the option.
           */
          includeDeleted: showDeleted ? 'true' : undefined,
        },
      });

      const responseData =
        response.data?.data ?? response.data;

      const data: UsersResponse = responseData;

      setUsers(data.items ?? []);

      setMeta(
        data.meta ?? {
          page,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      );
    } catch (err: any) {
      console.error('Failed to load users:', err);

      if (err?.response?.status === 403) {
        setError(
          'Access denied. Only a super administrator can manage users.',
        );
      } else if (err?.response?.status === 401) {
        setError(
          'Your session has expired. Please log in again.',
        );
      } else {
        setError(
          err?.response?.data?.message ||
            'Unable to load users. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load the first page when the component is mounted.
   */
  useEffect(() => {
    fetchUsers(1, '');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted]);

  /**
   * Handle user search.
   */
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchUsers(1, search);
  };

  /**
   * Clear the search field.
   */
  const handleClearSearch = () => {
    setSearch('');
    fetchUsers(1, '');
  };

  /**
   * Open the Add User form.
   */
  const openAddUser = () => {
    setFormError('');
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRoleName('analyst');
    setShowAddUser(true);
  };

  /**
   * Close the Add User form.
   */
  const closeAddUser = () => {
    if (creatingUser) {
      return;
    }

    setShowAddUser(false);
    setFormError('');
    setPassword('');
  };

  /**
   * Create a new user through the backend.
   *
   * Endpoint:
   * POST /api/v1/users
   *
   * Security:
   * - Password is transmitted to the backend over the
   *   development connection.
   * - The backend hashes the password before database storage.
   */
  const handleCreateUser = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setFormError('');

    /**
     * Basic frontend validation.
     *
     * Backend validation remains authoritative.
     */
    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setFormError('Email address is required.');
      return;
    }

    if (password.length < 8) {
      setFormError(
        'Password must be at least 8 characters.',
      );
      return;
    }

    if (!roleName) {
      setFormError('Please select a role.');
      return;
    }

    try {
      setCreatingUser(true);

      await apiClient.post('/users', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        roleName,
      });

      /**
       * Clear the password immediately after successful
       * submission.
       */
      setPassword('');

      setShowAddUser(false);

      /**
       * Return to the first page so the newly created user
       * can be displayed immediately.
       */
      await fetchUsers(1, search);
    } catch (err: any) {
      console.error('Failed to create user:', err);

      const message =
        err?.response?.data?.message;

      if (Array.isArray(message)) {
        setFormError(message.join(' '));
      } else {
        setFormError(
          message ||
            'Unable to create the user. Please try again.',
        );
      }
    } finally {
      setCreatingUser(false);
    }
  };
  /**
 * Open the Edit User modal.
 */
/**
 * Open the Edit User modal.
 *
 * The current status is loaded from the selected user
 * and converted to the backend UserStatusEnum format.
 */
const openEditUser = (user: User) => {
  setEditingUser(user);
  setEditFullName(user.fullName || '');
  setEditEmail(user.email || '');
  setEditPhone(user.phone || '');
  setEditStatus(
    (user.status || 'ACTIVE').toUpperCase(),
  );
  setEditError('');
  setShowEditUser(true);
};

/**
 * Close the Edit User modal.
 */
const closeEditUser = () => {
  if (updatingUser) {
    return;
  }

  setShowEditUser(false);
  setEditingUser(null);
  setEditFullName('');
  setEditEmail('');
  setEditPhone('');
  setEditError('');
};

/**
 * Update an existing user.
 *
 * Endpoint:
 * PATCH /api/v1/users/:id
 *
 * Current editable fields:
 * - fullName
 * - email
 * - phone
 *
 * Password changes are intentionally excluded from this flow.
 */

const handleUpdateUser = async (
  event: React.FormEvent,
) => {
  event.preventDefault();

  if (!editingUser) {
    return;
  }

  setEditError('');

  if (!editFullName.trim()) {
    setEditError('Full name is required.');
    return;
  }

  if (!editEmail.trim()) {
    setEditError('Email address is required.');
    return;
  }

  try {
    setUpdatingUser(true);

    await apiClient.patch(
      `/users/${editingUser.id}`,
      {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
      },
    );

    /**
     * Close the modal after successful update.
     */
    closeEditUser();

    /**
     * Reload the current user list.
     */
    await fetchUsers(meta.page, search);
  } catch (err: any) {
    console.error('Failed to update user:', err);

    const message =
      err?.response?.data?.message;

    if (Array.isArray(message)) {
      setEditError(message.join(' '));
    } else {
      setEditError(
        message ||
          'Unable to update the user. Please try again.',
      );
    }
  } finally {
    setUpdatingUser(false);
  }
};

/**
 * Update the selected user's account status.
 *
 * Endpoint:
 * PATCH /api/v1/users/:id/status
 *
 * Security:
 * - The backend requires authentication.
 * - The backend restricts this action to super_admin.
 * - The backend validates the status using UserStatusEnum.
 */
const handleStatusChange = async (
  status: string,
) => {
  if (!editingUser) {
    return;
  }

  try {
    setUpdatingUser(true);
    setEditError('');

    await apiClient.patch(
      `/users/${editingUser.id}/status`,
      {
        status: status.toLowerCase(),
      },
    );

    /**
     * Update the selected user locally so the
     * dropdown immediately reflects the saved value.
     */
    setEditStatus(status);

    setEditingUser({
      ...editingUser,
      status,
    });

    /**
     * Refresh the users table from the backend.
     */
    await fetchUsers(meta.page, search);
  } catch (err: any) {
    console.error(
      'Failed to update user status:',
      err,
    );

    /**
     * The API client may return either:
     * 1. Axios error format: err.response.data.message
     * 2. Sanitised error format: err.message
     *
     * Support both formats so the actual backend
     * error can be displayed during development.
     */
    const message =
      err?.response?.data?.message ||
      err?.message;

    if (Array.isArray(message)) {
      setEditError(message.join(' '));
    } else {
      setEditError(
        message ||
          'Unable to update the user status. Please try again.',
      );
    }
  } finally {
    setUpdatingUser(false);
  }
};  
      

    /**
     * Open the custom delete confirmation dialog.
     *
     * The actual DELETE request is intentionally separated from
     * this function so opening the dialog never changes server data.
     */
    const handleDeleteUser = (user: User) => {
      if (deletingUser) {
        return;
      }

      setConfirmationUser(user);
      setConfirmationAction('delete');
    };

    /**
     * Open the custom restore confirmation dialog.
     *
     * The actual restore request is performed only after the
     * administrator explicitly confirms the action.
     */
    const handleRestoreUser = (user: User) => {
      if (deletingUser) {
        return;
      }

      setConfirmationUser(user);
      setConfirmationAction('restore');
    };

    /**
     * Close the custom confirmation dialog without changing data.
     */
    const closeConfirmationDialog = () => {
      if (deletingUser) {
        return;
      }

      setConfirmationUser(null);
      setConfirmationAction(null);
    };

    /**
     * Confirm and execute the pending delete or restore action.
     */
    const confirmUserAction = async () => {
      if (!confirmationUser || !confirmationAction || deletingUser) {
        return;
      }

      const targetUser = confirmationUser;
      const action = confirmationAction;

      try {
        setDeletingUser(true);
        setError('');

        if (action === 'delete') {
          await apiClient.delete(`/users/${targetUser.id}`);

          /**
           * Close the Edit User modal if the deleted user
           * was being edited.
           */
          if (editingUser?.id === targetUser.id) {
            closeEditUser();
          }
        } else {
          await apiClient.post(
            `/users/${targetUser.id}/restore`,
          );
        }

        /**
         * Refresh from the backend so pagination totals and
         * the current user list remain accurate.
         */
        await fetchUsers(meta.page, search);

        setConfirmationUser(null);
        setConfirmationAction(null);
      } catch (err: any) {
        console.error(
          `Failed to ${action} user:`,
          err,
        );

        const message =
          err?.response?.data?.message ||
          err?.message;

        if (Array.isArray(message)) {
          setError(message.join(' '));
        } else {
          setError(
            message ||
              `Unable to ${action} the user. Please try again.`,
          );
        }
      } finally {
        setDeletingUser(false);
      }
    };

  /**
   * Move to the previous page.
   */
  const handlePreviousPage = () => {
    if (meta.page > 1) {
      fetchUsers(meta.page - 1, search);
    }
  };

  /**
   * Move to the next page.
   */
  const handleNextPage = () => {
    if (meta.page < meta.totalPages) {
      fetchUsers(meta.page + 1, search);
    }
  };

  /**
   * Format a date for display.
   */
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '—';
    }

    return new Date(dateString).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  /**
   * Display a readable status label.
   */
  const getStatusLabel = (status: string) => {
    return status
      ? status.charAt(0).toUpperCase() +
          status.slice(1).toLowerCase()
      : 'Unknown';
  };

  return (
    <div
      className="users-page"
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* ======================================================
          Header
          ====================================================== */}
      <header
        className="users-page-header"
        style={{
          background: 'white',
          padding: '16px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          className="users-page-heading"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              marginRight: '16px',
              padding: '8px 14px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Back
          </button>

          <div className="users-page-title">
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: 0,
              }}
            >
              User Management
            </h1>

            <p
              style={{
                margin: '4px 0 0',
                color: '#718096',
                fontSize: '14px',
              }}
            >
              Manage system users and access.
            </p>
          </div>
        </div>

        <button
          className="users-add-button"
          onClick={openAddUser}
          style={{
            padding: '10px 16px',
            background: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          + Add User
        </button>
      </header>

      {/* ======================================================
          Main Content
          ====================================================== */}
      <main
        className="users-page-main"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* Search controls */}
        <section
          className="users-search-section"
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <form
            className="users-search-form"
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              className="users-search-input"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email or phone..."
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '10px 12px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />

            <button
              className="users-search-button"
              type="submit"
              style={{
                padding: '10px 18px',
                background: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Search
            </button>

            <button
              className="users-clear-button"
              type="button"
              onClick={handleClearSearch}
              style={{
                padding: '10px 18px',
                background: '#edf2f7',
                color: '#2d3748',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>

            <button
              className="users-refresh-button"
              type="button"
              onClick={() =>
                fetchUsers(meta.page, search)
              }
              style={{
                padding: '10px 18px',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>

            <button
              className="users-deleted-toggle"
              type="button"
              onClick={() =>
                setShowDeleted((current) => !current)
              }
              style={{
                padding: '10px 18px',
                background: showDeleted
                  ? '#805ad5'
                  : '#edf2f7',
                color: showDeleted
                  ? 'white'
                  : '#2d3748',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {showDeleted
                ? 'Hide Deleted Users'
                : 'Show Deleted Users'}
            </button>
          </form>
        </section>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #feb2b2',
              color: '#c53030',
              padding: '14px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* ====================================================
            Users Table
            ==================================================== */}
        <section
          className="users-table-section"
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            className="users-table-header"
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              className="users-table-title"
              style={{
                margin: 0,
                fontSize: '18px',
                color: '#2d3748',
              }}
            >
              System Users
            </h2>

            <span
              className="users-total"
              style={{
                color: '#718096',
                fontSize: '14px',
              }}
            >
              Total: {meta.totalItems}
            </span>
          </div>

          {loading ? (
            <div
              style={{
                padding: '50px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div
              style={{
                padding: '50px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              No users found.
            </div>
          ) : (
            <div className="users-table-wrapper" style={{ overflowX: 'auto' }}>
              <table
                className="users-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f7fafc',
                      borderBottom:
                        '1px solid #e2e8f0',
                    }}
                  >
                    <th style={headerStyle}>
                      Full Name
                    </th>
                    <th style={headerStyle}>
                      Email
                    </th>
                    <th style={headerStyle}>
                      Phone
                    </th>
                    <th style={headerStyle}>
                      Role
                    </th>
                    <th style={headerStyle}>
                      Status
                    </th>
                    <th style={headerStyle}>
                      Created
                    </th>
                    <th style={headerStyle}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          '1px solid #edf2f7',
                        background: user.deletedAt
                          ? '#fffaf0'
                          : 'white',
                        opacity: user.deletedAt
                          ? 0.82
                          : 1,
                      }}
                    >
                      <td style={cellStyle}>
                        {user.fullName}
                      </td>

                      <td className="users-email-cell" style={cellStyle}>
                        {user.email}
                      </td>

                      <td style={cellStyle}>
                        {user.phone || '—'}
                      </td>

                      <td style={cellStyle}>
                        {user.role?.name || '—'}
                      </td>

                      <td style={cellStyle}>
                        {user.deletedAt ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 9px',
                              background: '#fed7d7',
                              color: '#c53030',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Deleted
                          </span>
                        ) : (
                          getStatusLabel(user.status)
                        )}
                      </td>

                      <td style={cellStyle}>
                        {formatDate(user.createdAt)}
                      </td>

                      <td style={cellStyle}>
                        {user.deletedAt ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleRestoreUser(user)
                            }
                            disabled={deletingUser}
                            style={{
                              padding: '6px 10px',
                              background: deletingUser
                                ? '#9ae6b4'
                                : '#48bb78',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: deletingUser
                                ? 'not-allowed'
                                : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            {deletingUser
                              ? 'Restoring...'
                              : 'Restore'}
                          </button>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openEditUser(user)
                              }
                              style={{
                                padding: '6px 10px',
                                background: '#edf2f7',
                                color: '#3182ce',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              Manage
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteUser(user)
                              }
                              disabled={deletingUser}
                              style={{
                                padding: '6px 10px',
                                background: deletingUser
                                  ? '#feb2b2'
                                  : '#e53e3e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: deletingUser
                                  ? 'not-allowed'
                                  : 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              {deletingUser
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            meta.totalPages > 0 && (
              <div
                className="users-pagination"
                style={{
                  padding: '16px 20px',
                  borderTop:
                    '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className="users-page-indicator"
                  style={{
                    color: '#718096',
                    fontSize: '14px',
                  }}
                >
                  Page {meta.page} of{' '}
                  {meta.totalPages}
                </span>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={
                      handlePreviousPage
                    }
                    disabled={meta.page <= 1}
                    style={{
                      padding:
                        '8px 14px',
                      background:
                        meta.page <= 1
                          ? '#edf2f7'
                          : '#3182ce',
                      color:
                        meta.page <= 1
                          ? '#a0aec0'
                          : 'white',
                      border: 'none',
                      borderRadius:
                        '5px',
                      cursor:
                        meta.page <= 1
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Previous
                  </button>

                  <button
                    onClick={
                      handleNextPage
                    }
                    disabled={
                      meta.page >=
                      meta.totalPages
                    }
                    style={{
                      padding:
                        '8px 14px',
                      background:
                        meta.page >=
                        meta.totalPages
                          ? '#edf2f7'
                          : '#3182ce',
                      color:
                        meta.page >=
                        meta.totalPages
                          ? '#a0aec0'
                          : 'white',
                      border: 'none',
                      borderRadius:
                        '5px',
                      cursor:
                        meta.page >=
                        meta.totalPages
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </section>
      </main>

      {/* ======================================================
          Add User Modal
          ====================================================== */}
      {showAddUser && (
        <div
          className="users-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div
            className="users-modal-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'white',
              borderRadius: '10px',
              boxShadow:
                '0 10px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div
              className="users-modal-header"
              style={{
                padding: '20px 24px',
                borderBottom:
                  '1px solid #e2e8f0',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    color: '#1a202c',
                  }}
                >
                  Add New User
                </h2>

                <p
                  style={{
                    margin:
                      '4px 0 0',
                    color: '#718096',
                    fontSize: '13px',
                  }}
                >
                  Create an internal system account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddUser}
                disabled={creatingUser}
                style={{
                  border: 'none',
                  background:
                    'transparent',
                  fontSize: '24px',
                  color: '#718096',
                  cursor:
                    creatingUser
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleCreateUser}
              autoComplete="off"
              style={{
                padding: '24px',
              }}
            >
              {formError && (
                <div
                  style={{
                    background:
                      '#fff5f5',
                    border:
                      '1px solid #feb2b2',
                    color: '#c53030',
                    padding:
                      '12px 14px',
                    borderRadius:
                      '6px',
                    marginBottom:
                      '16px',
                    fontSize:
                      '14px',
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Full Name *
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value,
                    )
                  }
                  placeholder="Enter full name"
                  required
                  disabled={creatingUser}
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Email *
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="user@example.com"
                  required
                  disabled={creatingUser}
                  autoComplete="off"
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Phone
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  placeholder="08012345678"
                  disabled={creatingUser}
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Password *
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  disabled={creatingUser}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

              {/* Role */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Role *
                </label>

                <select
                  value={roleName}
                  onChange={(event) =>
                    setRoleName(
                      event.target.value,
                    )
                  }
                  required
                  disabled={creatingUser}
                  style={inputStyle}
                >
                  {AVAILABLE_ROLES.map(
                    (role) => (
                      <option
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Form actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  gap: '10px',
                  marginTop: '24px',
                }}
              >
                <button
                  type="button"
                  onClick={closeAddUser}
                  disabled={creatingUser}
                  style={{
                    padding:
                      '10px 18px',
                    background:
                      '#edf2f7',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius:
                      '6px',
                    cursor:
                      creatingUser
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingUser}
                  style={{
                    padding:
                      '10px 18px',
                    background:
                      creatingUser
                        ? '#90cdf4'
                        : '#3182ce',
                    color: 'white',
                    border: 'none',
                    borderRadius:
                      '6px',
                    cursor:
                      creatingUser
                        ? 'not-allowed'
                        : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {creatingUser
                    ? 'Creating...'
                    : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       {/* ======================================================
          Edit User Modal
          ====================================================== */}
      {showEditUser && editingUser && (
        <div
          className="users-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div
            className="users-modal-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'white',
              borderRadius: '10px',
              boxShadow:
                '0 10px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div
              className="users-modal-header"
              style={{
                padding: '20px 24px',
                borderBottom:
                  '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    color: '#1a202c',
                  }}
                >
                  Edit User
                </h2>

                <p
                  style={{
                    margin: '4px 0 0',
                    color: '#718096',
                    fontSize: '13px',
                  }}
                >
                  Update the user's profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditUser}
                disabled={updatingUser}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '24px',
                  color: '#718096',
                  cursor: updatingUser
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {/* Edit User form */}
            <form
              onSubmit={handleUpdateUser}
              autoComplete="off"
              style={{
                padding: '24px',
              }}
            >
              {editError && (
                <div
                  style={{
                    background: '#fff5f5',
                    border:
                      '1px solid #feb2b2',
                    color: '#c53030',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '14px',
                  }}
                >
                  {editError}
                </div>
              )}

              {/* Full Name */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Full Name *
                </label>

                <input
                  type="text"
                  value={editFullName}
                  onChange={(event) =>
                    setEditFullName(
                      event.target.value,
                    )
                  }
                  required
                  disabled={updatingUser}
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Email *
                </label>

                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(
                      event.target.value,
                    )
                  }
                  required
                  disabled={updatingUser}
                  autoComplete="off"
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div style={fieldContainer}>
                <label style={labelStyle}>
                  Phone
                </label>

                <input
                  type="text"
                  value={editPhone}
                  onChange={(event) =>
                    setEditPhone(
                      event.target.value,
                    )
                  }
                  disabled={updatingUser}
                  style={inputStyle}
                />
              </div>

              {/* Role and Status */}
              <div
                style={{
                  background: '#f7fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#718096',
                }}
              >
                {/* Role is currently read-only */}
                <div>
                  <strong>Role:</strong>{' '}
                  {editingUser.role?.name || '—'}
                </div>

                {/* Status can be changed by a super_admin */}
                <div style={{ marginTop: '12px' }}>
                  <label
                    htmlFor="edit-status"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#2d3748',
                    }}
                  >
                    Status
                  </label>

                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(event) =>
                      handleStatusChange(event.target.value)
                    }
                    disabled={updatingUser}
                    style={{
                      ...inputStyle,
                      background: 'white',
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Form actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={closeEditUser}
                  disabled={updatingUser}
                  style={{
                    padding: '10px 18px',
                    background: '#edf2f7',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: updatingUser
                      ? 'not-allowed'
                      : 'pointer',
                  }}
                >
                
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingUser}
                  style={{
                    padding: '10px 18px',
                    background: updatingUser
                      ? '#90cdf4'
                      : '#3182ce',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: updatingUser
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {updatingUser
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      <style jsx>{`
        .users-page {
          width: 100%;
          overflow-x: hidden;
        }

        .users-page-main {
          width: 100%;
        }

        .users-table-wrapper {
          width: 100%;
        }

        .users-table {
          min-width: 900px;
        }

        .users-email-cell {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .users-modal-overlay {
          overflow-y: auto;
        }

        .users-modal-card {
          max-height: calc(100vh - 40px);
          overflow-y: auto;
        }

        @media (max-width: 700px) {
          .users-page-header {
            padding: 16px 14px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }

          .users-page-heading {
            width: 100%;
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr);
            gap: 12px;
            align-items: start !important;
          }

          .users-page-heading > button {
            margin-right: 0 !important;
            flex-shrink: 0;
          }

          .users-page-title {
            min-width: 0;
          }

          .users-page-title h1 {
            font-size: 23px !important;
            line-height: 1.25 !important;
            overflow-wrap: anywhere;
          }

          .users-page-title p {
            line-height: 1.45 !important;
          }

          .users-add-button {
            width: 100%;
            min-height: 46px;
            font-size: 15px !important;
          }

          .users-page-main {
            padding: 16px 12px !important;
            max-width: 100% !important;
          }

          .users-search-section {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }

          .users-search-form {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 10px !important;
          }

          .users-search-input {
            grid-column: 1 / -1;
            min-width: 0 !important;
            width: 100%;
          }

          .users-search-button,
          .users-clear-button,
          .users-refresh-button {
            width: 100%;
            min-height: 44px;
          }

          .users-refresh-button,
          .users-deleted-toggle {
            grid-column: 1 / -1;
            width: 100%;
            min-height: 44px;
          }

          .users-table-section {
            border-radius: 8px !important;
          }

          .users-table-header {
            padding: 15px 16px !important;
          }

          .users-table-title {
            font-size: 17px !important;
          }

          .users-table-wrapper {
            overflow: visible !important;
          }

          .users-table {
            min-width: 0 !important;
            width: 100% !important;
            display: block;
          }

          .users-table thead {
            display: none;
          }

          .users-table tbody {
            display: block;
            width: 100%;
          }

          .users-table tbody tr {
            display: block;
            width: 100%;
            padding: 15px 16px;
            border-bottom: 1px solid #e2e8f0 !important;
          }

          .users-table tbody td {
            display: block;
            width: 100%;
            padding: 3px 0 !important;
            border: 0 !important;
            font-size: 14px !important;
            line-height: 1.45;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .users-table tbody td:nth-child(1)::before { content: 'Full Name'; }
          .users-table tbody td:nth-child(2)::before { content: 'Email'; }
          .users-table tbody td:nth-child(3)::before { content: 'Phone'; }
          .users-table tbody td:nth-child(4)::before { content: 'Role'; }
          .users-table tbody td:nth-child(5)::before { content: 'Status'; }
          .users-table tbody td:nth-child(6)::before { content: 'Created'; }
          .users-table tbody td:nth-child(7)::before { content: 'Actions'; }

          .users-table tbody td::before {
            display: block;
            margin-top: 5px;
            margin-bottom: 2px;
            color: #718096;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .users-table tbody td:first-child {
            padding-top: 0 !important;
            font-weight: 700;
            color: #1a202c !important;
          }

          .users-table tbody td:last-child {
            padding-top: 10px !important;
          }

          .users-table tbody td:last-child button {
            width: 100%;
            min-height: 42px;
            font-size: 13px !important;
          }

          .users-pagination {
            padding: 14px 16px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
          }

          .users-page-indicator {
            text-align: center;
          }

          .users-pagination > div {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px !important;
          }

          .users-pagination button {
            min-height: 42px;
            width: 100%;
          }

          .users-modal-overlay {
            align-items: flex-start !important;
            padding: 12px !important;
          }

          .users-modal-card {
            max-width: 100% !important;
            max-height: calc(100vh - 24px) !important;
            border-radius: 10px !important;
          }

          .users-modal-header {
            padding: 16px !important;
          }

          .users-modal-card form {
            padding: 16px !important;
          }

          .users-modal-card form > div:last-child {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
          }

          .users-modal-card form > div:last-child button {
            width: 100%;
            min-height: 44px;
          }
        }


        /* ========================================================
           DELETE / RESTORE CONFIRMATION DIALOG
           ======================================================== */
        .users-confirmation-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.62);
          backdrop-filter: blur(3px);
        }

        .users-confirmation-card {
          width: 100%;
          max-width: 460px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
          text-align: center;
          animation: usersConfirmationIn 0.18s ease-out;
        }

        .users-confirmation-icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #fed7d7;
          font-size: 25px;
          font-weight: 800;
        }

        .users-confirmation-card h2 {
          margin: 0 0 8px;
          color: #1a202c;
          font-size: 22px;
          font-weight: 700;
        }

        .users-confirmation-card > p {
          margin: 0 auto 18px;
          max-width: 390px;
          color: #4a5568;
          font-size: 14px;
          line-height: 1.6;
        }

        .users-confirmation-user {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin: 0 0 14px;
          padding: 13px 16px;
          background: #f7fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          text-align: left;
        }

        .users-confirmation-user strong {
          color: #2d3748;
          font-size: 14px;
        }

        .users-confirmation-user span {
          color: #718096;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .users-confirmation-note {
          margin-bottom: 24px;
          padding: 11px 13px;
          border-radius: 7px;
          background: #fffaf0;
          color: #744210;
          font-size: 12px;
          line-height: 1.55;
          text-align: left;
        }

        .users-confirmation-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .users-confirmation-actions button {
          min-height: 44px;
          border: none;
          border-radius: 7px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 700;
          transition: background 0.15s ease, transform 0.05s ease;
        }

        .users-confirmation-actions button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .users-confirmation-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .users-confirmation-cancel {
          background: #edf2f7;
          color: #2d3748;
        }

        .users-confirmation-cancel:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .users-confirmation-danger {
          background: #e53e3e;
          color: #ffffff;
        }

        .users-confirmation-danger:hover:not(:disabled) {
          background: #c53030;
        }

        .users-confirmation-success {
          background: #38a169;
          color: #ffffff;
        }

        .users-confirmation-success:hover:not(:disabled) {
          background: #2f855a;
        }

        @keyframes usersConfirmationIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 520px) {
          .users-confirmation-overlay {
            padding: 14px;
          }

          .users-confirmation-card {
            max-width: 100%;
            padding: 22px;
            border-radius: 12px;
          }

          .users-confirmation-actions {
            grid-template-columns: 1fr;
          }

          .users-confirmation-actions button {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .users-page-header {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .users-page-main {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .users-page-heading {
            gap: 9px;
          }

          .users-page-title h1 {
            font-size: 21px !important;
          }

          .users-page-title p {
            font-size: 13px !important;
          }

          .users-table-header {
            padding-left: 13px !important;
            padding-right: 13px !important;
          }

          .users-table tbody tr {
            padding-left: 13px;
            padding-right: 13px;
          }
        }
      `}</style>

      {/* ==========================================================
          DELETE / RESTORE CONFIRMATION DIALOG
          ========================================================== */}
      {confirmationUser && confirmationAction && (
        <div
          className="users-confirmation-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeConfirmationDialog();
            }
          }}
        >
          <div
            className="users-confirmation-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-confirmation-title"
            aria-describedby="users-confirmation-description"
          >
            <div className="users-confirmation-icon" aria-hidden="true">
              {confirmationAction === 'delete' ? '!' : '↻'}
            </div>

            <h2 id="users-confirmation-title">
              {confirmationAction === 'delete'
                ? 'Delete User'
                : 'Restore User'}
            </h2>

            <p id="users-confirmation-description">
              {confirmationAction === 'delete'
                ? `Are you sure you want to delete ${confirmationUser.fullName}?`
                : `Are you sure you want to restore ${confirmationUser.fullName}?`}
            </p>

            <div className="users-confirmation-user">
              <strong>{confirmationUser.fullName}</strong>
              <span>{confirmationUser.email}</span>
            </div>

            <div className="users-confirmation-note">
              {confirmationAction === 'delete'
                ? 'The account will be soft-deleted and can be restored later by an authorised administrator.'
                : 'The account will be restored and will appear again among active users.'}
            </div>

            <div className="users-confirmation-actions">
              <button
                type="button"
                onClick={closeConfirmationDialog}
                disabled={deletingUser}
                className="users-confirmation-cancel"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmUserAction}
                disabled={deletingUser}
                className={
                  confirmationAction === 'delete'
                    ? 'users-confirmation-danger'
                    : 'users-confirmation-success'
                }
              >
                {deletingUser
                  ? confirmationAction === 'delete'
                    ? 'Deleting...'
                    : 'Restoring...'
                  : confirmationAction === 'delete'
                    ? 'Delete User'
                    : 'Restore User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

     

/**
 * Reusable table header styling.
 */
const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '600',
  color: '#4a5568',
};

/**
 * Reusable table cell styling.
 */
const cellStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '14px',
  color: '#2d3748',
};

/**
 * Reusable Add User field container.
 */
const fieldContainer: React.CSSProperties = {
  marginBottom: '16px',
};

/**
 * Reusable form label styling.
 */
const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#2d3748',
};

/**
 * Reusable form input styling.
 */
const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid #cbd5e0',
  borderRadius: '6px',
  fontSize: '14px',
  background: 'white',
};
