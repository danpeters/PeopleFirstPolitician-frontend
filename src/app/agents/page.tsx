'use client';

/**
 * ============================================================
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\agents\page.tsx
 *
 * Purpose:
 * - Lists Polling Unit Agents belonging to the active organisation.
 * - Supports server-side search and pagination.
 * - Provides navigation to Agent details.
 * - Provides navigation to register a new Agent.
 *
 * Security:
 * - The organisation ID comes from the development organisation
 *   configuration.
 * - The API client supplies the authenticated Bearer token.
 * - Backend RBAC remains the authoritative security layer.
 * - This page does not grant permissions by itself.
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import apiClient from '@/lib/api-client';
import { DEVELOPMENT_ORGANISATION_ID } from '@/config/organisation';

interface Agent {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  displayName: string;
  phone: string;
  email?: string | null;
  photoUrl?: string | null;
  photoVersion?: number | null;
  agentReference?: string | null;
  identificationType?: string | null;
  identificationReference?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface AgentsResponse {
  items: Agent[];
  meta: PaginationMeta;
}

export default function AgentsPage() {
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAgents = useCallback(
    async (page = 1, searchTerm = search) => {
      try {
        setError('');

        if (page === 1 && agents.length === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await apiClient.get<AgentsResponse>(
          `/agents/organisations/${DEVELOPMENT_ORGANISATION_ID}`,
          {
            params: {
              page,
              limit: meta.limit,
              ...(searchTerm.trim()
                ? { search: searchTerm.trim() }
                : {}),
            },
          },
        );

                const data = response.data;

        if (!data || !Array.isArray(data.items) || !data.meta) {
          throw new Error('Invalid Agent response received.');
        }

        setAgents(data.items);
        setMeta(data.meta);
      } catch (err: any) {
        console.error('Failed to retrieve Agents:', err);

        setAgents([]);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to retrieve Agents.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [agents.length, meta.limit, search],
  );

  useEffect(() => {
    fetchAgents(1, '');
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const value = searchInput.trim();

    setSearch(value);

    fetchAgents(1, value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');

    fetchAgents(1, '');
  };

  const handleRefresh = () => {
    fetchAgents(meta.page, search);
  };

  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      page > meta.totalPages ||
      page === meta.page
    ) {
      return;
    }

    fetchAgents(page, search);
  };

  const formatStatus = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return {
          background: '#c6f6d5',
          color: '#22543d',
        };

      case 'inactive':
        return {
          background: '#edf2f7',
          color: '#4a5568',
        };

      case 'suspended':
        return {
          background: '#fed7d7',
          color: '#822727',
        };

      default:
        return {
          background: '#edf2f7',
          color: '#4a5568',
        };
    }
  };

  const formatDate = (value: string) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
          Page Header
          ====================================================== */}
      <header
        style={{
          background: 'white',
          padding: '16px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a202c',
              margin: 0,
            }}
          >
            Polling Unit Agents
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#718096',
              fontSize: '14px',
            }}
          >
            Manage agents assigned to polling units.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/agents/new')}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Register Agent
        </button>
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
            Search and Actions
            ==================================================== */}
        <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Search name, email, phone or agent reference..."
              style={{
                flex: '1 1 320px',
                minWidth: '250px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            <button
              type="button"
              onClick={handleSearch}
              style={{
                background: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Search
            </button>

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  background: '#edf2f7',
                  color: '#2d3748',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: 'white',
                color: '#2d3748',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                cursor: refreshing
                  ? 'not-allowed'
                  : 'pointer',
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
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
              border: '1px solid #fc8181',
              color: '#c53030',
              padding: '14px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* ====================================================
            Summary
            ==================================================== */}
        {!loading && !error && (
          <div
            style={{
              marginBottom: '12px',
              color: '#4a5568',
              fontSize: '14px',
            }}
          >
            {meta.totalItems === 0
              ? 'No Agents found.'
              : `${meta.totalItems} Agent${
                  meta.totalItems === 1 ? '' : 's'
                } found.`}
          </div>
        )}

        {/* ====================================================
            Table
            ==================================================== */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflowX: 'auto',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              Loading Agents...
            </div>
          ) : agents.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  marginBottom: '12px',
                }}
              >
                👤
              </div>

              <div
                style={{
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '6px',
                }}
              >
                No Polling Unit Agents
              </div>

              <div style={{ fontSize: '14px' }}>
                {search
                  ? 'No Agents matched your search.'
                  : 'No Agents have been registered yet.'}
              </div>
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                minWidth: '900px',
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
                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Agent
                  </th>

                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Agent Reference
                  </th>

                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Phone
                  </th>

                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Email
                  </th>

                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Status
                  </th>

                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Registered
                  </th>

                  <th
                    style={{
                      padding: '14px 16px',
                      textAlign: 'right',
                      fontSize: '13px',
                      color: '#4a5568',
                      fontWeight: '600',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {agents.map((agent) => {
                  const statusStyle =
                    getStatusStyle(agent.status);

                  return (
                    <tr
                      key={agent.id}
                      style={{
                        borderBottom:
                          '1px solid #edf2f7',
                      }}
                    >
                      <td
                        style={{
                          padding: '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          {agent.photoUrl ? (
                            <img
                              src={agent.photoUrl}
                              alt={agent.displayName}
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border:
                                  '1px solid #e2e8f0',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: '#edf2f7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                  'center',
                                color: '#718096',
                                fontSize: '18px',
                                fontWeight: '600',
                              }}
                            >
                              {agent.firstName
                                ?.charAt(0)
                                .toUpperCase() || 'A'}
                            </div>
                          )}

                          <div>
                            <div
                              style={{
                                fontWeight: '600',
                                color: '#2d3748',
                              }}
                            >
                              {agent.displayName}
                            </div>

                            {agent.identificationType && (
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: '#718096',
                                  marginTop: '3px',
                                }}
                              >
                                {agent.identificationType}
                                {agent.identificationReference
                                  ? `: ${agent.identificationReference}`
                                  : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          padding: '14px 16px',
                          color: '#4a5568',
                          fontSize: '14px',
                        }}
                      >
                        {agent.agentReference || '—'}
                      </td>

                      <td
                        style={{
                          padding: '14px 16px',
                          color: '#4a5568',
                          fontSize: '14px',
                        }}
                      >
                        {agent.phone || '—'}
                      </td>

                      <td
                        style={{
                          padding: '14px 16px',
                          color: '#4a5568',
                          fontSize: '14px',
                        }}
                      >
                        {agent.email || '—'}
                      </td>

                      <td
                        style={{
                          padding: '14px 16px',
                        }}
                      >
                        <span
                          style={{
                            ...statusStyle,
                            display: 'inline-block',
                            padding:
                              '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {formatStatus(
                            agent.status,
                          )}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '14px 16px',
                          color: '#4a5568',
                          fontSize: '14px',
                        }}
                      >
                        {formatDate(
                          agent.createdAt,
                        )}
                      </td>

                      <td
                        style={{
                          padding: '14px 16px',
                          textAlign: 'right',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/agents/${agent.id}`,
                            )
                          }
                          style={{
                            background: 'white',
                            color: '#3182ce',
                            border:
                              '1px solid #bee3f8',
                            borderRadius: '6px',
                            padding:
                              '7px 12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ====================================================
            Pagination
            ==================================================== */}
        {!loading && meta.totalPages > 0 && (
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                color: '#718096',
                fontSize: '14px',
              }}
            >
              Showing page {meta.page} of{' '}
              {meta.totalPages}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  handlePageChange(
                    meta.page - 1,
                  )
                }
                disabled={meta.page <= 1}
                style={{
                  background: 'white',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding:
                    '8px 14px',
                  cursor:
                    meta.page <= 1
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    meta.page <= 1
                      ? 0.5
                      : 1,
                }}
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePageChange(
                    meta.page + 1,
                  )
                }
                disabled={
                  meta.page >=
                  meta.totalPages
                }
                style={{
                  background: 'white',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding:
                    '8px 14px',
                  cursor:
                    meta.page >=
                    meta.totalPages
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    meta.page >=
                    meta.totalPages
                      ? 0.5
                      : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}