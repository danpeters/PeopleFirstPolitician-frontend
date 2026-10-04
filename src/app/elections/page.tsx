/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\elections\page.tsx
 *
 * Purpose:
 * - Provides the Elections Management interface.
 * - Displays elections belonging to the current development organisation.
 * - Retrieves election data from the authenticated backend API.
 * - Supports election search, status selection, refresh and pagination.
 * - Presents loading, empty and error states.
 * - Provides the initial foundation for full Election CRUD operations.
 *
 * API:
 * - GET
 *   /api/v1/organisations/:organisationId/elections
 *
 * Current functionality:
 * - List elections.
 * - Search elections using the backend search parameter.
 * - Display election name, type, date and status.
 * - Paginate election results.
 * - Refresh election data.
 *
 * Planned functionality:
 * - Create Election.
 * - View Election details.
 * - Edit Election.
 * - Connect the status selector to backend status filtering.
 * - Full organisation-context selection.
 *
 * Security:
 * - Requests use the existing apiClient.
 * - apiClient supplies the authenticated access token.
 * - The backend remains responsible for JWT authentication,
 *   permission enforcement and organisation membership validation.
 *
 * Organisation context:
 * - The current frontend uses the development organisation ID from:
 *   @/config/organisation
 * - This is temporary development configuration.
 * - It should later be replaced with the authenticated user's
 *   active organisation context.
 *
 * Important:
 * - Do not accept organisationId from user-entered form data.
 * - Organisation context must remain controlled by the application.
 */

'use client';

'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';

import {
  DEVELOPMENT_ORGANISATION_ID,
} from '@/config/organisation';

type ElectionStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled';

interface Election {
  id: string;
  name: string;
  electionType: string;
  electionDate: string;
  status: ElectionStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ElectionsResponse {
  items: Election[];
  meta: PaginationMeta;
}

const STATUS_OPTIONS: Array<{
  value: '' | ElectionStatus;
  label: string;
}> = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const formatElectionDate = (
  value: string,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatStatus = (
  status: ElectionStatus,
): string => {
  return status.charAt(0).toUpperCase() +
    status.slice(1);
};

export default function ElectionsPage() {
  const router = useRouter();
  
  const [
    elections,
    setElections,
  ] = useState<Election[]>([]);

  const [
    meta,
    setMeta,
  ] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [
    search,
    setSearch,
  ] = useState('');

  /**
 * Tracks the latest election-list request.
 *
 * If multiple requests are active at the same time,
 * only the response belonging to the latest request
 * is allowed to update the page state.
 */
const requestSequenceRef = useRef(0);

  const [
    status,
    setStatus,
  ] = useState<
    '' | ElectionStatus
  >('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
  createForm,
  setCreateForm,
] = useState({
  name: '',
  electionType: '',
  electionDate: '',
  status: 'draft' as ElectionStatus,
  description: '',
});

const [
  isCreating,
  setIsCreating,
] = useState(false);

const [
  createError,
  setCreateError,
] = useState('');

  const fetchElections = useCallback(
  async (page: number) => {
    const requestId =
      ++requestSequenceRef.current;

    try {
      setIsLoading(true);
      setError('');

      const response =
        await apiClient.get<ElectionsResponse>(
          `/organisations/${DEVELOPMENT_ORGANISATION_ID}/elections`,
          {
            params: {
              page,
              limit: meta.limit,
              search:
                search.trim() || undefined,
              status: status || undefined,
              sortBy: 'electionDate',
              sortOrder: 'DESC',
            },
          },
        );

      /**
       * Ignore responses from older requests.
       *
       * This prevents a slower previous request,
       * such as page 3, from overwriting a newer
       * request for page 1 after a filter change.
       */
      if (
        requestId !==
        requestSequenceRef.current
      ) {
        return;
      }

      const responseData =
        response.data;

      setElections(
        responseData?.items ?? [],
      );

      setMeta(
        responseData?.meta ?? {
          page,
          limit: meta.limit,
          totalItems:
            responseData?.items?.length ?? 0,
          totalPages: 1,
        },
      );
    } catch (requestError: any) {
      /**
       * Ignore errors belonging to older requests.
       */
      if (
        requestId !==
        requestSequenceRef.current
      ) {
        return;
      }

      console.error(
        'Failed to load elections:',
        requestError,
      );

      const message =
        requestError?.response?.data
          ?.message ??
        'Failed to load elections. Please try again.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );

      setElections([]);
    } finally {
      /**
       * Only the latest request controls
       * the loading indicator.
       */
      if (
        requestId ===
        requestSequenceRef.current
      ) {
        setIsLoading(false);
      }
    }
  },
  [
    meta.limit,
    search,
    status,
  ],
);

  useEffect(() => {
    setMeta((currentMeta) => ({
      ...currentMeta,
      page: 1,
    }));

    void fetchElections(1);
  }, [
    search,
    status,
    fetchElections,
  ]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value);
  };

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatus(
      event.target.value as
        | ''
        | ElectionStatus,
    );
  };

  const handleCreateElection = async (
  event: React.FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  setIsCreating(true);
  setCreateError('');

  try {
    await apiClient.post(
      `/organisations/${DEVELOPMENT_ORGANISATION_ID}/elections`,
      {
        name: createForm.name.trim(),
        electionType:
          createForm.electionType.trim(),
        electionDate:
          createForm.electionDate,
        status: createForm.status,
        description:
          createForm.description.trim() ||
          undefined,
      },
    );

    setIsCreateModalOpen(false);

    setCreateForm({
      name: '',
      electionType: '',
      electionDate: '',
      status: 'draft',
      description: '',
    });

    await fetchElections(1);
  } catch (requestError: any) {
    console.error(
      'Failed to create election:',
      requestError,
    );

    const message =
      requestError?.response?.data
        ?.message ??
      'Failed to create election. Please try again.';

    setCreateError(
      Array.isArray(message)
        ? message.join(', ')
        : message,
    );
  } finally {
    setIsCreating(false);
  }
};

  const handlePreviousPage = () => {
    if (
      meta.page <= 1 ||
      isLoading
    ) {
      return;
    }

    void fetchElections(
      meta.page - 1,
    );
  };

  const handleNextPage = () => {
    if (
      meta.page >= meta.totalPages ||
      isLoading
    ) {
      return;
    }

    void fetchElections(
      meta.page + 1,
    );
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px',
        background: '#f7fafc',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'flex-start',
            gap: '20px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 700,
                color: '#1a202c',
              }}
            >
              Elections
            </h1>

            <p
              style={{
                margin:
                  '8px 0 0',
                color: '#718096',
              }}
            >
              Manage elections within
              the current organisation.
            </p>
          </div>

                    <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                background: '#ffffff',
                color: '#2d3748',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => {
                setCreateError('');
                setIsCreateModalOpen(true);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                background: '#ffffff',
                color: '#2d3748',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Add Election
            </button>
          </div>
        </div>

                {isCreateModalOpen && (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow:
                '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1a202c',
                  }}
                >
                  Create Election
                </h2>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#718096',
                    fontSize: '14px',
                  }}
                >
                  Enter the details for the new election.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError('');
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  background: '#ffffff',
                  color: '#2d3748',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>

            {createError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  background: '#fff5f5',
                  border: '1px solid #feb2b2',
                  color: '#c53030',
                  fontSize: '14px',
                }}
              >
                {createError}
              </div>
            )}

            <form
              onSubmit={handleCreateElection}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <label
                    htmlFor="election-name"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    Election Name
                  </label>

                  <input
                    id="election-name"
                    type="text"
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    maxLength={180}
                    placeholder="e.g. 2027 General Election"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border:
                        '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="election-type"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    Election Type
                  </label>

                  <input
                    id="election-type"
                    type="text"
                    value={createForm.electionType}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        electionType:
                          event.target.value,
                      }))
                    }
                    required
                    maxLength={60}
                    placeholder="e.g. General, Primary"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border:
                        '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="election-date"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    Election Date
                  </label>

                  <input
                    id="election-date"
                    type="date"
                    value={createForm.electionDate}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        electionDate:
                          event.target.value,
                      }))
                    }
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border:
                        '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="election-status"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    Status
                  </label>

                  <select
                    id="election-status"
                    value={createForm.status}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        status:
                          event.target.value as ElectionStatus,
                      }))
                    }
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border:
                        '1px solid #cbd5e0',
                      borderRadius: '6px',
                      background: '#ffffff',
                      fontSize: '14px',
                    }}
                  >
                    {STATUS_OPTIONS
                      .filter(
                        (option) =>
                          option.value !== '',
                      )
                      .map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div
                  style={{
                    gridColumn:
                      '1 / -1',
                  }}
                >
                  <label
                    htmlFor="election-description"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    id="election-description"
                    value={createForm.description}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Optional description of the election"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border:
                        '1px solid #cbd5e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateError('');
                  }}
                  disabled={isCreating}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border:
                      '1px solid #cbd5e0',
                    background: '#ffffff',
                    color: '#2d3748',
                    cursor: isCreating
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border:
                      '1px solid #2b6cb0',
                    background: '#2b6cb0',
                    color: '#ffffff',
                    cursor: isCreating
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isCreating
                    ? 'Creating...'
                    : 'Create Election'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section
          style={{
            background: '#ffffff',
            border:
              '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow:
              '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="search"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search elections..."
              style={{
                flex: '1 1 280px',
                minWidth: '220px',
                padding:
                  '10px 12px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '14px',
              }}
            />

            <select
              value={status}
              onChange={
                handleStatusChange
              }
              style={{
                minWidth: '160px',
                padding:
                  '10px 12px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '6px',
                background:
                  '#ffffff',
                fontSize: '14px',
              }}
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                void fetchElections(
                  meta.page,
                )
              }
              disabled={isLoading}
              style={{
                padding:
                  '10px 16px',
                borderRadius:
                  '6px',
                border:
                  '1px solid #cbd5e0',
                background:
                  '#ffffff',
                color: '#2d3748',
                cursor: isLoading
                  ? 'not-allowed'
                  : 'pointer',
                fontWeight: 600,
              }}
            >
              {isLoading
                ? 'Loading...'
                : 'Refresh'}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding:
                  '12px 14px',
                borderRadius:
                  '6px',
                background:
                  '#fff5f5',
                border:
                  '1px solid #feb2b2',
                color: '#c53030',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <div
              style={{
                padding:
                  '48px 20px',
                textAlign:
                  'center',
                color: '#718096',
              }}
            >
              Loading elections...
            </div>
          ) : elections.length ===
            0 ? (
            <div
              style={{
                padding:
                  '48px 20px',
                textAlign:
                  'center',
                color: '#718096',
              }}
            >
              No elections found.
            </div>
          ) : (
            <div
              style={{
                overflowX:
                  'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '680px',
                  tableLayout: 'auto',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        borderBottom: '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '13px',
                      }}
                    >
                      Election Name
                    </th>

                    <th
                      style={{
                        textAlign:
                          'left',
                        padding:
                          '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color:
                          '#4a5568',
                        fontSize:
                          '13px',
                      }}
                    >
                      Type
                    </th>

                    <th
                      style={{
                        textAlign:
                          'left',
                        padding:
                          '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color:
                          '#4a5568',
                        fontSize:
                          '13px',
                      }}
                    >
                      Election date
                    </th>

                    <th
                      style={{
                        textAlign:
                          'left',
                        padding:
                          '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color:
                          '#4a5568',
                        fontSize:
                          '13px',
                      }}
                    >
                      Status
                    </th>

                    <th
                      style={{
                        textAlign:
                          'left',
                        padding:
                          '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color:
                          '#4a5568',
                        fontSize:
                          '13px',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {elections.map(
                    (election) => (
                      <tr
                        key={
                          election.id
                        }
                      >
                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color:
                              '#2d3748',
                            fontWeight:
                              600,
                          }}
                        >
                          {election.name}
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color:
                              '#4a5568',
                          }}
                        >
                          {
                            election.electionType
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color:
                              '#4a5568',
                          }}
                        >
                          {formatElectionDate(
                            election.electionDate,
                          )}
                        </td>

                                                <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color:
                              '#4a5568',
                          }}
                        >
                          {formatStatus(
                            election.status,
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/elections/${election.id}`,
                              )
                            }
                            style={{
                              padding:
                                '7px 12px',
                              borderRadius:
                                '5px',
                              border:
                                '1px solid #cbd5e0',
                              background:
                                '#ffffff',
                              color:
                                '#2b6cb0',
                              cursor:
                                'pointer',
                              fontWeight:
                                600,
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading &&
            meta.totalItems > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  gap: '16px',
                  marginTop:
                    '20px',
                  flexWrap:
                    'wrap',
                }}
              >
                <div
                  style={{
                    color:
                      '#718096',
                    fontSize:
                      '14px',
                  }}
                >
                  Showing page{' '}
                  {meta.page} of{' '}
                  {meta.totalPages}{' '}
                  ({meta.totalItems}{' '}
                  elections)
                </div>

                <div
                  style={{
                    display:
                      'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      handlePreviousPage
                    }
                    disabled={
                      meta.page <=
                        1 ||
                      isLoading
                    }
                    style={{
                      padding:
                        '8px 14px',
                      borderRadius:
                        '6px',
                      border:
                        '1px solid #cbd5e0',
                      background:
                        '#ffffff',
                      color:
                        '#2d3748',
                      cursor:
                        meta.page <=
                          1 ||
                        isLoading
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNextPage
                    }
                    disabled={
                      meta.page >=
                        meta.totalPages ||
                      isLoading
                    }
                    style={{
                      padding:
                        '8px 14px',
                      borderRadius:
                        '6px',
                      border:
                        '1px solid #cbd5e0',
                      background:
                        '#ffffff',
                      color:
                        '#2d3748',
                      cursor:
                        meta.page >=
                          meta.totalPages ||
                        isLoading
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
      </div>
    </main>
  );
}