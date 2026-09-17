/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\audit\page.tsx
 *
 * Purpose:
 * - Display system audit logs for authorised administrators.
 * - Retrieve audit records from the backend Audit API.
 * - Provide pagination and basic filtering.
 *
 * Security:
 * - The frontend route is protected by middleware.
 * - The backend endpoint requires JWT authentication.
 * - The backend endpoint is restricted to super_admin.
 *
 * Backend endpoint:
 * - GET /api/v1/audit
 *
 * Supported query parameters:
 * - page
 * - limit
 * - action
 * - module
 *
 * Response:
 * - Paginated audit log records.
 *
 * ============================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import apiClient from '@/lib/api-client';

/**
 * Audit log record returned by the backend.
 */
interface AuditLog {
  id: string;
  action: string;
  module: string;
  actorId?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Pagination metadata returned by the backend.
 */
interface AuditMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function AuditPage() {
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<AuditMeta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [action, setAction] = useState('');
  const [module, setModule] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Fetch audit logs from the backend.
   *
   * Endpoint:
   * GET /api/v1/audit
   */
  const fetchAuditLogs = async (
    page = 1,
  ) => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string | number> = {
        page,
        limit: meta.limit,
      };

      if (action.trim()) {
        params.action = action.trim();
      }

      if (module.trim()) {
        params.module = module.trim();
      }

      const response = await apiClient.get(
        '/audit',
        {
          params,
        },
      );

      /**
       * The standard API response wraps the
       * paginated result inside data.
       */
      const result =
        response.data?.data ?? response.data;

      setLogs(result?.items ?? []);

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
        'Failed to load audit logs:',
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
            'Unable to load audit logs.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load the first page when the component mounts.
   */
  useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  /**
   * Apply the selected filters.
   */
  const handleApplyFilters = () => {
    fetchAuditLogs(1);
  };

  /**
   * Clear all filters and reload the audit logs.
   */
  const handleClearFilters = () => {
    setAction('');
    setModule('');
    fetchAuditLogs(1);
  };

  /**
   * Display a readable date and time.
   */
  const formatDateTime = (
    value: string,
  ) => {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString();
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
          Audit Logs
        </h1>
      </header>

      {/* ======================================================
          Main Content
          ====================================================== */}
      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* ====================================================
            Filters
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
            Filter Audit Logs
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
              value={action}
              onChange={(event) =>
                setAction(event.target.value)
              }
              placeholder="Action e.g. USER_CREATED"
              style={{
                padding: '10px 12px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                minWidth: '240px',
              }}
            />

            <input
              type="text"
              value={module}
              onChange={(event) =>
                setModule(event.target.value)
              }
              placeholder="Module e.g. users"
              style={{
                padding: '10px 12px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                minWidth: '200px',
              }}
            />

            <button
              type="button"
              onClick={handleApplyFilters}
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
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
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

            <button
              type="button"
              onClick={() =>
                fetchAuditLogs(meta.page)
              }
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
            Audit Table
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
              System Activity
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
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              No audit logs found.
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
                    <th style={headerStyle}>
                      Date / Time
                    </th>

                    <th style={headerStyle}>
                      Action
                    </th>

                    <th style={headerStyle}>
                      Module
                    </th>

                    <th style={headerStyle}>
                      Actor ID
                    </th>

                    <th style={headerStyle}>
                      Target ID
                    </th>

                    <th style={headerStyle}>
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={cellStyle}>
                        {formatDateTime(
                          log.createdAt,
                        )}
                      </td>

                      <td style={cellStyle}>
                        <span
                          style={{
                            display:
                              'inline-block',
                            padding:
                              '4px 8px',
                            background:
                              '#ebf8ff',
                            color:
                              '#2b6cb0',
                            borderRadius:
                              '4px',
                            fontSize:
                              '12px',
                            fontWeight:
                              '600',
                          }}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td style={cellStyle}>
                        {log.module ||
                          '—'}
                      </td>

                      <td style={cellStyle}>
                        {log.actorId ||
                          '—'}
                      </td>

                      <td style={cellStyle}>
                        {log.targetId ||
                          '—'}
                      </td>

                      <td style={cellStyle}>
                        {log.details
                          ? JSON.stringify(
                              log.details,
                            )
                          : '—'}
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
                  fetchAuditLogs(
                    meta.page - 1,
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
                  fetchAuditLogs(
                    meta.page + 1,
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