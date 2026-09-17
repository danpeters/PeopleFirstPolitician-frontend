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
  }, []);

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
  );setEditStatus(user.status || 'ACTIVE');
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
 * Soft-delete an existing user.
 *
 * Endpoint:
 * DELETE /api/v1/users/:id
 *
 * Security:
 * - The backend requires authentication.
 * - The backend restricts deletion to super_admin.
 *
 * The user is not permanently removed from the database.
 * The backend performs a soft delete and records an audit event.
 */
const handleDeleteUser = async (
  user: User,
) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${user.fullName}?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingUser(true);
    setEditError('');

    await apiClient.delete(
      `/users/${user.id}`,
    );

    /**
     * Remove the deleted user from the current
     * table immediately.
     */
    setUsers((currentUsers) =>
      currentUsers.filter(
        (currentUser) =>
          currentUser.id !== user.id,
      ),
    );

    /**
     * Close the Edit User modal if the deleted
     * user was being edited.
     */
    if (editingUser?.id === user.id) {
      closeEditUser();
    }
  } catch (err: any) {
    console.error(
      'Failed to delete user:',
      err,
    );

    const message =
      err?.response?.data?.message ||
      err?.message;

    if (Array.isArray(message)) {
      setEditError(message.join(' '));
    } else {
      setEditError(
        message ||
          'Unable to delete the user. Please try again.',
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

          <div>
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
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* Search controls */}
        <section
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
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
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                color: '#2d3748',
              }}
            >
              System Users
            </h2>

            <span
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
            <div style={{ overflowX: 'auto' }}>
              <table
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
                      }}
                    >
                      <td style={cellStyle}>
                        {user.fullName}
                      </td>

                      <td style={cellStyle}>
                        {user.email}
                      </td>

                      <td style={cellStyle}>
                        {user.phone || '—'}
                      </td>

                      <td style={cellStyle}>
                        {user.role?.name || '—'}
                      </td>

                      <td style={cellStyle}>
                        {getStatusLabel(user.status)}
                      </td>

                      <td style={cellStyle}>
                        {formatDate(user.createdAt)}
                      </td>

                      <td style={cellStyle}>
                        
                        <button
                        onClick={() => openEditUser(user)}
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