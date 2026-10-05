/**
 * ============================================================
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\election-scopes\page.tsx
 *
 * Purpose:
 * - Provides the Electoral Scopes Management interface.
 * - Displays electoral scopes belonging to the current
 *   development organisation.
 * - Retrieves electoral scope data from the authenticated
 *   backend API.
 * - Supports electoral scope search, refresh and pagination.
 * - Presents loading, empty and error states.
 * - Provides the foundation for full Electoral Scope CRUD
 *   operations.
 *
 * API:
 * - GET
 *   /api/v1/organisations/:organisationId/electoral-scopes
 * - POST
 *   /api/v1/organisations/:organisationId/electoral-scopes
 * - GET
 *   /api/v1/organisations/:organisationId/electoral-scopes/:id
 * - PATCH
 *   /api/v1/organisations/:organisationId/electoral-scopes/:id
 *
 * Current functionality:
 * - List Electoral Scopes.
 * - Search Electoral Scopes.
 * - Display scope type and geographical relationships.
 * - Display scope status.
 * - Paginate Electoral Scope results.
 * - Refresh Electoral Scope data.
 *
 * Planned functionality:
 * - Create Electoral Scope.
 * - View Electoral Scope details.
 * - Edit Electoral Scope.
 * - Dynamic geographical selection based on scope type.
 * - Improved organisation-context selection.
 *
 * Supported scope types:
 * - National
 * - State
 * - Local Government
 * - Ward
 *
 * Current backend limitations:
 * - Polling Unit scopes require a separate mapping workflow.
 * - Senatorial District, Federal Constituency and State
 *   Constituency currently lack the required geography entities
 *   in the backend data model.
 *
 * Security:
 * - Requests use the existing apiClient.
 * - apiClient supplies the authenticated access token.
 * - The backend remains responsible for JWT authentication,
 *   permission enforcement and organisation membership validation.
 *
 * Organisation context:
 * - The current frontend uses the development organisation ID
 *   from @/config/organisation.
 * - This is temporary development configuration.
 * - It should later be replaced with the authenticated user's
 *   active organisation context.
 *
 * Important:
 * - organisationId must not be accepted from user-entered form data.
 * - Organisation context remains controlled by the application.
 * - Frontend validation does not replace backend validation.
 * ============================================================
 */

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

type ElectoralScopeType =
  | 'national'
  | 'state'
  | 'local_government'
  | 'ward'
  | 'polling_unit'
  | 'senatorial_district'
  | 'federal_constituency'
  | 'state_constituency';

type ElectoralScopeStatus =
  | 'active'
  | 'inactive';

interface GeographyReference {
  id: string;
  name: string;
  code?: string;
}

interface ElectoralScope {
  id: string;
  scopeType: ElectoralScopeType;
  name: string;
  code?: string | null;
  status: ElectoralScopeStatus;
  stateId?: string | null;
  state?: GeographyReference | null;
  lgaId?: string | null;
  lga?: GeographyReference | null;
  wardId?: string | null;
  ward?: GeographyReference | null;
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

interface ElectoralScopesResponse {
  items: ElectoralScope[];
  meta: PaginationMeta;
}

const formatScopeType = (
  scopeType: ElectoralScopeType,
): string => {
  switch (scopeType) {
    case 'national':
      return 'National';

    case 'state':
      return 'State';

    case 'local_government':
      return 'Local Government';

    case 'ward':
      return 'Ward';

    case 'polling_unit':
      return 'Polling Unit';

    case 'senatorial_district':
      return 'Senatorial District';

    case 'federal_constituency':
      return 'Federal Constituency';

    case 'state_constituency':
      return 'State Constituency';

    default:
      return scopeType;
  }
};

const formatStatus = (
  status: ElectoralScopeStatus,
): string => {
  return status.charAt(0).toUpperCase() +
    status.slice(1);
};

const formatGeographyName = (
  value?: string | null,
): string => {
  if (!value) {
    return '—';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    )
    .replace(
      /\b(I|Ii|Iii|Iv|V|Vi|Vii|Viii|Ix|X)\b/gi,
      (roman) => roman.toUpperCase(),
    );
};

export default function ElectoralScopesPage() {
  const router = useRouter();

  const [
    scopes,
    setScopes,
  ] = useState<ElectoralScope[]>([]);

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

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  /**
   * Tracks the latest scope-list request.
   *
   * If multiple requests are active at the same time,
   * only the latest response is allowed to update
   * the page state.
   */
  const requestSequenceRef = useRef(0);

  const fetchScopes = useCallback(
    async (page: number) => {
      const requestId =
        ++requestSequenceRef.current;

      try {
        setIsLoading(true);
        setError('');

        const response =
          await apiClient.get<ElectoralScopesResponse>(
            `/organisations/${DEVELOPMENT_ORGANISATION_ID}/electoral-scopes`,
            {
              params: {
                page,
                limit: meta.limit,
                search:
                  search.trim() || undefined,
              },
            },
          );

        /**
         * Ignore responses from older requests.
         */
        if (
          requestId !==
          requestSequenceRef.current
        ) {
          return;
        }

        const responseData =
          response.data;

        setScopes(
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
          'Failed to load electoral scopes:',
          requestError,
        );

        const message =
          requestError?.response?.data
            ?.message ??
          'Failed to load electoral scopes. Please try again.';

        setError(
          Array.isArray(message)
            ? message.join(', ')
            : message,
        );

        setScopes([]);
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
    ],
  );

  useEffect(() => {
    setMeta((currentMeta) => ({
      ...currentMeta,
      page: 1,
    }));

    void fetchScopes(1);
  }, [
    search,
    fetchScopes,
  ]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value);
  };

  const handlePreviousPage = () => {
    if (
      meta.page <= 1 ||
      isLoading
    ) {
      return;
    }

    void fetchScopes(
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

    void fetchScopes(
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
            justifyContent: 'space-between',
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
              Electoral Scopes
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#718096',
              }}
            >
              Manage electoral scopes within
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
                onClick={() => router.push('/election-scopes/new')}
                style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '1px solid #2563eb',
                    background: '#ffffff',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontWeight: 600,
                }}
                >
                Add Electoral Scope
            </button>
          </div>
        </div>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
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
              onChange={handleSearchChange}
              placeholder="Search electoral scopes..."
              style={{
                flex: '1 1 280px',
                minWidth: '220px',
                padding: '10px 12px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '14px',
              }}
            />

            <button
              type="button"
              onClick={() =>
                void fetchScopes(meta.page)
              }
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border:
                  '1px solid #cbd5e0',
                background: '#ffffff',
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
                padding: '12px 14px',
                borderRadius: '6px',
                background: '#fff5f5',
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
                padding: '48px 20px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              Loading electoral scopes...
            </div>
          ) : scopes.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              No electoral scopes found.
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
                  borderCollapse: 'collapse',
                  minWidth: '760px',
                  tableLayout: 'auto',
                }}
              >
                <thead>
                  <tr>
                    {[
                      'Scope Name',
                      'Type',
                      'State',
                      'LGA',
                      'Ward',
                      'Status',
                      'Actions',
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: 'left',
                          padding: '12px',
                          borderBottom:
                            '1px solid #e2e8f0',
                          color: '#4a5568',
                          fontSize: '13px',
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {scopes.map((scope) => (
                    <tr key={scope.id}>
                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                          color: '#2d3748',
                          fontWeight: 600,
                        }}
                      >
                        {scope.name}
                      </td>

                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                          color: '#4a5568',
                        }}
                      >
                        {formatScopeType(
                          scope.scopeType,
                        )}
                      </td>

                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                          color: '#4a5568',
                        }}
                      >
                        {formatGeographyName(scope.state?.name)}
                      </td>

                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                          color: '#4a5568',
                        }}
                      >
                        {formatGeographyName(scope.lga?.name)}
                      </td>

                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                          color: '#4a5568',
                        }}
                      >
                        {formatGeographyName(scope.ward?.name)}
                      </td>

                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                          color: '#4a5568',
                        }}
                      >
                        {formatStatus(
                          scope.status,
                        )}
                      </td>

                      <td
                        style={{
                          padding: '14px 12px',
                          borderBottom:
                            '1px solid #edf2f7',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/election-scopes/${scope.id}`,
                            )
                          }
                          style={{
                            padding:
                              '7px 12px',
                            borderRadius: '5px',
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
                  ))}
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
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    color: '#718096',
                    fontSize: '14px',
                  }}
                >
                  Showing page{' '}
                  {meta.page} of{' '}
                  {meta.totalPages}{' '}
                  ({meta.totalItems}{' '}
                  {meta.totalItems === 1
                    ? 'scope'
                    : 'scopes'})
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      handlePreviousPage
                    }
                    disabled={
                      meta.page <= 1 ||
                      isLoading
                    }
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border:
                        '1px solid #cbd5e0',
                      background:
                        '#ffffff',
                      color: '#2d3748',
                      cursor:
                        meta.page <= 1 ||
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
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border:
                        '1px solid #cbd5e0',
                      background:
                        '#ffffff',
                      color: '#2d3748',
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