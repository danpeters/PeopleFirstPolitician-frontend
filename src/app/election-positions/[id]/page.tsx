'use client';

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  deletedAt?: string | null;
}

interface ElectionPositionResponse {
  item?: ElectionPosition;
}

export default function ElectionPositionDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const positionId =
    typeof params?.id === 'string'
      ? params.id
      : '';

  const [position, setPosition] =
    useState<ElectionPosition | null>(
      null,
    );

  const [code, setCode] =
    useState('');

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

    

  const [isEditing, setIsEditing] =
    useState(false);

  const fetchPosition =
    useCallback(async () => {
      if (!positionId) {
        setError(
          'Election position ID is missing.',
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response =
          await apiClient.get<
            ElectionPositionResponse | ElectionPosition
          >(
            `/organisations/${DEVELOPMENT_ORGANISATION_ID}/election-positions/${positionId}`,
          );

        const responseData =
          response.data;

        const item =
          'item' in responseData &&
          responseData.item
            ? responseData.item
            : responseData as ElectionPosition;

        setPosition(item);
        setCode(item.code ?? '');
        setName(item.name ?? '');
        setDescription(
          item.description ?? '',
        );
      } catch (requestError: any) {
        console.error(
          'Failed to load election position:',
          requestError,
        );

        const message =
          requestError?.response?.data
            ?.message ??
          'Failed to load election position. Please try again.';

        setError(
          Array.isArray(message)
            ? message.join(', ')
            : message,
        );
      } finally {
        setIsLoading(false);
      }
    }, [positionId]);

  useEffect(() => {
    void fetchPosition();
  }, [fetchPosition]);

  useEffect(() => {
    const created =
        sessionStorage.getItem(
        'electionPositionCreated',
        );

    if (created === '1') {
        setSuccessMessage(
        'Election position created successfully.',
        );

        sessionStorage.removeItem(
        'electionPositionCreated',
        );
      }
    }, []);

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!positionId) {
      setError(
        'Election position ID is missing.',
      );
      return;
    }

    const trimmedCode =
      code.trim();

    const trimmedName =
      name.trim();

    const trimmedDescription =
      description.trim();

    if (!trimmedCode) {
      setError(
        'Position code is required.',
      );
      return;
    }

    if (!trimmedName) {
      setError(
        'Position name is required.',
      );
      return;
    }

    if (trimmedCode.length > 60) {
      setError(
        'Position code must not exceed 60 characters.',
      );
      return;
    }

    if (trimmedName.length > 120) {
      setError(
        'Position name must not exceed 120 characters.',
      );
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      const response =
        await apiClient.patch<
          ElectionPositionResponse | ElectionPosition
        >(
          `/organisations/${DEVELOPMENT_ORGANISATION_ID}/election-positions/${positionId}`,
          {
            code: trimmedCode,
            name: trimmedName,
            description:
              trimmedDescription || undefined,
          },
        );

      const responseData =
        response.data;

      const updatedPosition =
        'item' in responseData &&
        responseData.item
          ? responseData.item
          : responseData as ElectionPosition;

      setPosition(updatedPosition);
      setCode(
        updatedPosition.code ?? '',
      );
      setName(
        updatedPosition.name ?? '',
      );
      setDescription(
        updatedPosition.description ?? '',
      );

      setIsEditing(false);
      setSuccessMessage(
        'Election position updated successfully.',
      );
    } catch (requestError: any) {
      console.error(
        'Failed to update election position:',
        requestError,
      );

      const message =
        requestError?.response?.data
          ?.message ??
        'Failed to update election position. Please try again.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (position) {
      setCode(position.code ?? '');
      setName(position.name ?? '');
      setDescription(
        position.description ?? '',
      );
    }

    setError('');
    setSuccessMessage('');
    setIsEditing(false);
  };

  const formatDate = (
    value?: string | null,
  ) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  if (isLoading) {
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
            maxWidth: '1100px',
            margin: '0 auto',
            color: '#718096',
          }}
        >
          Loading election position...
        </div>
      </main>
    );
  }

  if (error && !position) {
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
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                '/election-positions',
              )
            }
            style={{
              padding: '10px 18px',
              borderRadius: '6px',
              border:
                '1px solid #cbd5e0',
              background: '#ffffff',
              color: '#2d3748',
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            ← Back to Election Positions
          </button>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: '6px',
              background: '#fff5f5',
              border:
                '1px solid #feb2b2',
              color: '#c53030',
            }}
          >
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!position) {
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
            maxWidth: '1100px',
            margin: '0 auto',
            color: '#718096',
          }}
        >
          Election position not found.
        </div>
      </main>
    );
  }

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
          maxWidth: '1100px',
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
              Election Position
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#718096',
              }}
            >
              View and manage election
              position details.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  '/election-positions',
                )
              }
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border:
                  '1px solid #cbd5e0',
                background: '#ffffff',
                color: '#2d3748',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← Back
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setIsEditing(true);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px',
                  border:
                    '1px solid #2b6cb0',
                  background: '#2b6cb0',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Edit Position
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '6px',
              background: '#fff5f5',
              border:
                '1px solid #feb2b2',
              color: '#c53030',
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '6px',
              background: '#f0fff4',
              border:
                '1px solid #9ae6b4',
              color: '#276749',
            }}
          >
            {successMessage}
          </div>
        )}

        {!isEditing ? (
          <section
            style={{
              background: '#ffffff',
              border:
                '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow:
                '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginBottom: '6px',
                  }}
                >
                  Position Code
                </div>

                <div
                  style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#2d3748',
                  }}
                >
                  {position.code}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginBottom: '6px',
                  }}
                >
                  Position Name
                </div>

                <div
                  style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#2d3748',
                  }}
                >
                  {position.name}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '28px',
                paddingTop: '24px',
                borderTop:
                  '1px solid #edf2f7',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: '#718096',
                  marginBottom: '6px',
                }}
              >
                Description
              </div>

              <div
                style={{
                  color: '#4a5568',
                  lineHeight: 1.6,
                }}
              >
                {position.description ||
                  'No description provided.'}
              </div>
            </div>

            <div
              style={{
                marginTop: '28px',
                paddingTop: '24px',
                borderTop:
                  '1px solid #edf2f7',
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginBottom: '6px',
                  }}
                >
                  Created
                </div>

                <div
                  style={{
                    color: '#4a5568',
                  }}
                >
                  {formatDate(
                    position.createdAt,
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginBottom: '6px',
                  }}
                >
                  Last Updated
                </div>

                <div
                  style={{
                    color: '#4a5568',
                  }}
                >
                  {formatDate(
                    position.updatedAt,
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <form
            onSubmit={handleSave}
            style={{
              background: '#ffffff',
              border:
                '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow:
                '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                htmlFor="position-code"
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 600,
                  color: '#2d3748',
                }}
              >
                Position Code
              </label>

              <input
                id="position-code"
                type="text"
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value,
                  )
                }
                maxLength={60}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 12px',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '15px',
                }}
              />

              <div
                style={{
                  marginTop: '5px',
                  color: '#718096',
                  fontSize: '12px',
                }}
              >
                Maximum 60 characters.
              </div>
            </div>

            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                htmlFor="position-name"
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 600,
                  color: '#2d3748',
                }}
              >
                Position Name
              </label>

              <input
                id="position-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                maxLength={120}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 12px',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '15px',
                }}
              />

              <div
                style={{
                  marginTop: '5px',
                  color: '#718096',
                  fontSize: '12px',
                }}
              >
                Maximum 120 characters.
              </div>
            </div>

            <div
              style={{
                marginBottom: '24px',
              }}
            >
              <label
                htmlFor="position-description"
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 600,
                  color: '#2d3748',
                }}
              >
                Description
              </label>

              <textarea
                id="position-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={5}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 12px',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '15px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={isSaving}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px',
                  border:
                    '1px solid #cbd5e0',
                  background: '#ffffff',
                  color: '#2d3748',
                  cursor: isSaving
                    ? 'not-allowed'
                    : 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px',
                  border:
                    '1px solid #2b6cb0',
                  background: '#2b6cb0',
                  color: '#ffffff',
                  cursor: isSaving
                    ? 'not-allowed'
                    : 'pointer',
                  fontWeight: 600,
                }}
              >
                {isSaving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}