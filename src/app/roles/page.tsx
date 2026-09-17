/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\roles\page.tsx
 *
 * Purpose:
 * - Display system roles retrieved from the backend.
 * - Provide role search, sorting and pagination.
 *
 * Security:
 * - The frontend route is protected by middleware.
 * - The backend endpoint requires JWT authentication.
 * - The backend endpoint is restricted to super_admin.
 *
 * Backend endpoint:
 * - GET /api/v1/roles
 *
 * Current backend capabilities:
 * - List roles
 * - Search by name or description
 * - Sort roles
 * - Paginate roles
 *
 * Note:
 * - Permission assignment is intentionally not implemented here.
 * - The current Role entity does not contain a role-permission
 *   relationship.
 *
 * ============================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import apiClient from '@/lib/api-client';

/**
 * Role record returned by the backend.
 */
interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination metadata returned by the backend.
 */
interface RoleMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function RolesPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);

  const [meta, setMeta] = useState<RoleMeta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Fetch roles from the backend.
   *
   * Endpoint:
   * GET /api/v1/roles
   */
  const fetchRoles = async (
    page = 1,
    currentSearch = search,
  ) => {
    try {
      setLoading(true);
      setError('');

      const params: Record<
        string,
        string | number
      > = {
        page,
        limit: meta.limit,
        sortBy,
        sortOrder,
      };

      if (currentSearch.trim()) {
        params.search =
          currentSearch.trim();
      }

      const response =
        await apiClient.get('/roles', {
          params,
        });

      /**
       * The standard API response wraps the
       * paginated result inside data.
       */
      const result =
        response.data?.data ??
        response.data;

      setRoles(result?.items ?? []);

      setMeta(
        result?.meta ?? {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      );
    } catch (err: any) {
      console.error(
        'Failed to load roles:',
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
            'Unable to load system roles.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load roles when the page opens.
   */
  useEffect(() => {
    fetchRoles(1, '');
  }, []);

  /**
   * Apply the current search.
   */
  const handleSearch = () => {
    fetchRoles(1, search);
  };

  /**
   * Clear search and reload all roles.
   */
  const handleClear = () => {
    setSearch('');
    fetchRoles(1, '');
  };

  /**
   * Reload the current page.
   */
  const handleRefresh = () => {
    fetchRoles(meta.page, search);
  };

  /**
   * Change sorting and reload the first page.
   */
  const handleSortChange = (
    value: string,
  ) => {
    if (value === 'name') {
      setSortBy('name');
    } else if (value === 'createdAt') {
      setSortBy('createdAt');
    } else if (value === 'updatedAt') {
      setSortBy('updatedAt');
    }
  };

  /**
   * Toggle ascending/descending sort order.
   */
  const handleSortOrderChange = (
    value: string,
  ) => {
    setSortOrder(
      value === 'DESC'
        ? 'DESC'
        : 'ASC',
    );
  };

  /**
   * Display a readable date.
   */
  const formatDate = (
    value: string,
  ) => {
    if (!value) {
      return '—';
    }

    return new Date(
      value,
    ).toLocaleDateString();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      {/* ======================================================
          Header
          ====================================================== */}
      <header
        style={{
          background: 'white',
          padding: '16px 32px',
          boxShadow:
            '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            marginRight: '16px',
            padding: '4px 12px',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a202c',
          }}
        >
          Role Management
        </h1>
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
        {/* ====================================================
            Search and Sorting
            ==================================================== */}
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '16px',
              fontSize: '18px',
              color: '#2d3748',
            }}
          >
            Search and Sort Roles
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  handleSearch();
                }
              }}
              placeholder="Search by name or description..."
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '10px 12px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '6px',
              }}
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '10px 18px',
                background: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                fontWeight: '600',
              }}
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              style={{
                padding: '10px 18px',
                background: '#edf2f7',
                color: '#2d3748',
                border: 'none',
                borderRadius: '6px',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Clear
            </button>

            <select
              value={sortBy}
              onChange={(event) => {
                handleSortChange(
                  event.target.value,
                );
                setTimeout(() => {
                  fetchRoles(
                    1,
                    search,
                  );
                }, 0);
              }}
              style={{
                padding: '10px 12px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '6px',
                background: 'white',
              }}
            >
              <option value="name">
                Sort by Name
              </option>
              <option value="createdAt">
                Sort by Created Date
              </option>
              <option value="updatedAt">
                Sort by Updated Date
              </option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) => {
                handleSortOrderChange(
                  event.target.value,
                );
                setTimeout(() => {
                  fetchRoles(
                    1,
                    search,
                  );
                }, 0);
              }}
              style={{
                padding: '10px 12px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '6px',
                background: 'white',
              }}
            >
              <option value="ASC">
                Ascending
              </option>
              <option value="DESC">
                Descending
              </option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              style={{
                padding: '10px 18px',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ====================================================
            Error
            ==================================================== */}
        {error && (
          <div
            style={{
              background: '#fff5f5',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              border:
                '1px solid #feb2b2',
            }}
          >
            {error}
          </div>
        )}

        {/* ====================================================
            Roles Table
            ==================================================== */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom:
                '1px solid #e2e8f0',
              display: 'flex',
              justifyContent:
                'space-between',
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
              System Roles
            </h2>

            <span
              style={{
                fontSize: '14px',
                color: '#718096',
              }}
            >
              Total: {meta.totalItems}
            </span>
          </div>

          {loading ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              Loading roles...
            </div>
          ) : roles.length === 0 ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              No roles found.
            </div>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f7fafc',
                    }}
                  >
                    <th
                      style={
                        headerStyle
                      }
                    >
                      Role Name
                    </th>

                    <th
                      style={
                        headerStyle
                      }
                    >
                      Description
                    </th>

                    <th
                      style={
                        headerStyle
                      }
                    >
                      Created
                    </th>

                    <th
                      style={
                        headerStyle
                      }
                    >
                      Updated
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td
                        style={
                          cellStyle
                        }
                      >
                        <strong>
                          {role.name}
                        </strong>
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {role.description ||
                          '—'}
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {formatDate(
                          role.createdAt,
                        )}
                      </td>

                      <td
                        style={
                          cellStyle
                        }
                      >
                        {formatDate(
                          role.updatedAt,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==================================================
              Pagination
              ================================================== */}
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
                fontSize: '14px',
                color: '#718096',
              }}
            >
              Page {meta.page} of{' '}
              {meta.totalPages || 1}
            </span>

            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                type="button"
                disabled={
                  loading ||
                  meta.page <= 1
                }
                onClick={() =>
                  fetchRoles(
                    meta.page - 1,
                    search,
                  )
                }
                style={{
                  padding: '8px 14px',
                  background:
                    meta.page <= 1
                      ? '#edf2f7'
                      : '#3182ce',
                  color:
                    meta.page <= 1
                      ? '#a0aec0'
                      : 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor:
                    meta.page <= 1 ||
                    loading
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  meta.page >=
                    meta.totalPages
                }
                onClick={() =>
                  fetchRoles(
                    meta.page + 1,
                    search,
                  )
                }
                style={{
                  padding: '8px 14px',
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
                  borderRadius: '5px',
                  cursor:
                    meta.page >=
                      meta.totalPages ||
                    loading
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
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
  borderBottom:
    '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
};

/**
 * Reusable table cell styling.
 */
const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '13px',
  color: '#2d3748',
  borderBottom:
    '1px solid #edf2f7',
  verticalAlign: 'top',
};