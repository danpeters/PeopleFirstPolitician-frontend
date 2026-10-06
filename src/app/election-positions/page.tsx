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

interface ElectionPosition {
  id: string;
  code: string;
  name: string;
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

interface ElectionPositionsResponse {
  items: ElectionPosition[];
  meta: PaginationMeta;
}

export default function ElectionPositionsPage() {
  const router = useRouter();

  const [
    positions,
    setPositions,
  ] = useState<ElectionPosition[]>([]);

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

  const requestSequenceRef = useRef(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const fetchPositions = useCallback(
    async (page: number) => {
      const requestId =
        ++requestSequenceRef.current;

      try {
        setIsLoading(true);
        setError('');

        const response =
          await apiClient.get<ElectionPositionsResponse>(
            `/organisations/${DEVELOPMENT_ORGANISATION_ID}/election-positions`,
            {
              params: {
                page,
                limit: meta.limit,
                search:
                  search.trim() || undefined,
                sortBy: 'name',
                sortOrder: 'ASC',
              },
            },
          );

        if (
          requestId !==
          requestSequenceRef.current
        ) {
          return;
        }

        const responseData =
          response.data;

        setPositions(
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
        if (
          requestId !==
          requestSequenceRef.current
        ) {
          return;
        }

        console.error(
          'Failed to load election positions:',
          requestError,
        );

        const message =
          requestError?.response?.data
            ?.message ??
          'Failed to load election positions. Please try again.';

        setError(
          Array.isArray(message)
            ? message.join(', ')
            : message,
        );

        setPositions([]);
      } finally {
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

    void fetchPositions(1);
  }, [
    search,
    fetchPositions,
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

    void fetchPositions(
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

    void fetchPositions(
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
              Election Positions
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#718096',
              }}
            >
              Manage electoral positions within
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
              onClick={() =>
                router.push(
                  '/election-positions/new',
                )
              }
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border: '1px solid #2b6cb0',
                background: '#2b6cb0',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Add Election Position
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
              placeholder="Search election positions..."
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
                void fetchPositions(meta.page)
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
              Loading election positions...
            </div>
          ) : positions.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: '#718096',
              }}
            >
              No election positions found.
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
                        borderBottom:
                          '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '13px',
                      }}
                    >
                      Position Code
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '13px',
                      }}
                    >
                      Position Name
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '13px',
                      }}
                    >
                      Description
                    </th>

                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        borderBottom:
                          '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '13px',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {positions.map(
                    (position) => (
                      <tr
                        key={position.id}
                      >
                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color: '#2d3748',
                            fontWeight: 600,
                          }}
                        >
                          {position.code}
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color: '#2d3748',
                            fontWeight: 600,
                          }}
                        >
                          {position.name}
                        </td>

                        <td
                          style={{
                            padding:
                              '14px 12px',
                            borderBottom:
                              '1px solid #edf2f7',
                            color: '#4a5568',
                          }}
                        >
                          {position.description ||
                            '—'}
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
                                `/election-positions/${position.id}`,
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
                              fontWeight: 600,
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
                    ? 'position'
                    : 'positions'})
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
                      padding:
                        '8px 14px',
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
                      padding:
                        '8px 14px',
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