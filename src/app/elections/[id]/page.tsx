'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';
import { DEVELOPMENT_ORGANISATION_ID } from '@/config/organisation';

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

interface EditElectionForm {
  name: string;
  electionType: string;
  electionDate: string;
  status: ElectionStatus;
  description: string;
}

const formatElectionDate = (value: string): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value: string): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatStatus = (status: ElectionStatus): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const getStatusStyle = (status: ElectionStatus) => {
  switch (status) {
    case 'active':
      return {
        background: '#f0fff4',
        color: '#276749',
        border: '1px solid #9ae6b4',
      };

    case 'completed':
      return {
        background: '#ebf8ff',
        color: '#2b6cb0',
        border: '1px solid #90cdf4',
      };

    case 'cancelled':
      return {
        background: '#fff5f5',
        color: '#c53030',
        border: '1px solid #feb2b2',
      };

    case 'draft':
    default:
      return {
        background: '#fffaf0',
        color: '#975a16',
        border: '1px solid #fbd38d',
      };
  }
};

export default function ElectionDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const electionId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [election, setElection] = useState<Election | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditElectionForm>({
    name: '',
    electionType: '',
    electionDate: '',
    status: 'draft',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (!electionId) {
      setError('Election ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchElection = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.get<Election>(
          `/organisations/${DEVELOPMENT_ORGANISATION_ID}/elections/${electionId}`,
        );

        setElection(response.data ?? null);
      } catch (requestError: any) {
        console.error('Failed to load election:', requestError);

        const message =
          requestError?.response?.data?.message ??
          'Failed to load election details. Please try again.';

        setError(
          Array.isArray(message)
            ? message.join(', ')
            : message,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchElection();
  }, [electionId]);

  const openEditForm = () => {
    if (!election) {
      return;
    }

    setSaveError('');

    setEditForm({
      name: election.name,
      electionType: election.electionType,
      electionDate: election.electionDate.slice(0, 10),
      status: election.status,
      description: election.description || '',
    });

    setIsEditing(true);
  };

  const closeEditForm = () => {
    if (isSaving) {
      return;
    }

    setIsEditing(false);
    setSaveError('');
  };

  const handleCancelElection = async () => {
    if (!election || !electionId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel \"${election.name}\"? This will change the election status to Cancelled.`,
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    setCancelError('');

    try {
      const response = await apiClient.patch<Election>(
        `/organisations/${DEVELOPMENT_ORGANISATION_ID}/elections/${electionId}`,
        {
          status: 'cancelled',
        },
      );

      setElection(response.data ?? null);
    } catch (requestError: any) {
      console.error(
        'Failed to cancel election:',
        requestError,
      );

      const message =
        requestError?.response?.data?.message ??
        'Failed to cancel election. Please try again.';

      setCancelError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveElection = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!electionId) {
      setSaveError('Election ID is missing.');
      return;
    }

    if (!editForm.name.trim()) {
      setSaveError('Election name is required.');
      return;
    }

    if (!editForm.electionType.trim()) {
      setSaveError('Election type is required.');
      return;
    }

    if (!editForm.electionDate) {
      setSaveError('Election date is required.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const response = await apiClient.patch<Election>(
        `/organisations/${DEVELOPMENT_ORGANISATION_ID}/elections/${electionId}`,
        {
          name: editForm.name.trim(),
          electionType: editForm.electionType.trim(),
          electionDate: editForm.electionDate,
          status: editForm.status,
          description: editForm.description.trim() || undefined,
        },
      );

      setElection(response.data ?? null);
      setIsEditing(false);
    } catch (requestError: any) {
      console.error('Failed to update election:', requestError);

      const message =
        requestError?.response?.data?.message ??
        'Failed to update election. Please try again.';

      setSaveError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        padding: '28px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 700,
                color: '#1a202c',
              }}
            >
              Election Details
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#718096',
                fontSize: '16px',
              }}
            >
              View and manage the details of this election.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/elections')}
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
            ← Back to Elections
          </button>
        </div>

        {isLoading && (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#718096',
              }}
            >
              Loading election details...
            </p>
          </section>
        )}

        {!isLoading && error && (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #feb2b2',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '6px',
                background: '#fff5f5',
                color: '#c53030',
                fontSize: '14px',
              }}
            >
              {error}
            </div>

            <button
              type="button"
              onClick={() => router.push('/elections')}
              style={{
                marginTop: '16px',
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                background: '#ffffff',
                color: '#2d3748',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Return to Elections
            </button>
          </section>
        )}

        {!isLoading && !error && election && (
          <>
            <section
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#1a202c',
                    }}
                  >
                    {election.name}
                  </h2>

                  <p
                    style={{
                      margin: '8px 0 0',
                      color: '#718096',
                      fontSize: '15px',
                    }}
                  >
                    Election information
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
                    onClick={openEditForm}
                    disabled={isCancelling}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '6px',
                      border: '1px solid #3182ce',
                      background: '#3182ce',
                      color: '#ffffff',
                      cursor: isCancelling
                        ? 'not-allowed'
                        : 'pointer',
                      fontWeight: 600,
                      opacity: isCancelling ? 0.7 : 1,
                    }}
                  >
                    Edit Election
                  </button>

                  {election.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={handleCancelElection}
                      disabled={isCancelling}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '6px',
                        border: '1px solid #c53030',
                        background: '#ffffff',
                        color: '#c53030',
                        cursor: isCancelling
                          ? 'not-allowed'
                          : 'pointer',
                        fontWeight: 600,
                        opacity: isCancelling ? 0.7 : 1,
                      }}
                    >
                      {isCancelling
                        ? 'Cancelling...'
                        : 'Cancel Election'}
                    </button>
                  )}

                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 600,
                      ...getStatusStyle(election.status),
                    }}
                  >
                    {formatStatus(election.status)}
                  </span>
                </div>
              </div>

              {cancelError && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: '#fff5f5',
                    border: '1px solid #feb2b2',
                    color: '#c53030',
                    fontSize: '14px',
                  }}
                >
                  {cancelError}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
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
                    Election Name
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    {election.name}
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
                    Election Type
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    {election.electionType}
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
                    Election Date
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    {formatElectionDate(election.electionDate)}
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
                    Status
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#2d3748',
                    }}
                  >
                    {formatStatus(election.status)}
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
                    Created
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      color: '#4a5568',
                    }}
                  >
                    {formatDateTime(election.createdAt)}
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
                      fontSize: '15px',
                      color: '#4a5568',
                    }}
                  >
                    {formatDateTime(election.updatedAt)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #edf2f7',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginBottom: '8px',
                  }}
                >
                  Description
                </div>

                <div
                  style={{
                    color: '#4a5568',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {election.description ||
                    'No description provided.'}
                </div>
              </div>
            </section>

            <section
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1a202c',
                }}
              >
                Election Races
              </h2>

              <p
                style={{
                  margin: '8px 0 0',
                  color: '#718096',
                  fontSize: '14px',
                }}
              >
                Election races will be displayed here.
              </p>

              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: '6px',
                  background: '#f7fafc',
                  border: '1px solid #edf2f7',
                  color: '#718096',
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                No races are currently displayed.
                <br />
                Race management will be connected in the next stage.
              </div>
            </section>
          </>
        )}
      </div>

      {isEditing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-election-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div>
                <h2
                  id="edit-election-title"
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    color: '#1a202c',
                  }}
                >
                  Edit Election
                </h2>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#718096',
                    fontSize: '14px',
                  }}
                >
                  Update the election information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={isSaving}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#718096',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '24px',
                  lineHeight: 1,
                }}
                aria-label="Close edit form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveElection}>
              <div
                style={{
                  padding: '24px',
                  display: 'grid',
                  gap: '18px',
                }}
              >
                {saveError && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: '#fff5f5',
                      border: '1px solid #feb2b2',
                      color: '#c53030',
                      fontSize: '14px',
                    }}
                  >
                    {saveError}
                  </div>
                )}

                <label
                  style={{
                    display: 'grid',
                    gap: '6px',
                    color: '#2d3748',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Election Name
                  <input
                    type="text"
                    value={editForm.name}
                    maxLength={180}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    disabled={isSaving}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e0',
                      fontSize: '15px',
                      color: '#2d3748',
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: '6px',
                    color: '#2d3748',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Election Type
                  <input
                    type="text"
                    value={editForm.electionType}
                    maxLength={60}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        electionType: event.target.value,
                      }))
                    }
                    disabled={isSaving}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e0',
                      fontSize: '15px',
                      color: '#2d3748',
                    }}
                  />
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px',
                  }}
                >
                  <label
                    style={{
                      display: 'grid',
                      gap: '6px',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    Election Date
                    <input
                      type="date"
                      value={editForm.electionDate}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          electionDate: event.target.value,
                        }))
                      }
                      disabled={isSaving}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e0',
                        fontSize: '15px',
                        color: '#2d3748',
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: 'grid',
                      gap: '6px',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    Status
                    <select
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          status: event.target
                            .value as ElectionStatus,
                        }))
                      }
                      disabled={isSaving}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e0',
                        fontSize: '15px',
                        color: '#2d3748',
                        background: '#ffffff',
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                </div>

                <label
                  style={{
                    display: 'grid',
                    gap: '6px',
                    color: '#2d3748',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Description
                  <textarea
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    disabled={isSaving}
                    rows={5}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e0',
                      fontSize: '15px',
                      color: '#2d3748',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>

              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={isSaving}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e0',
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
                    border: '1px solid #3182ce',
                    background: isSaving
                      ? '#90cdf4'
                      : '#3182ce',
                    color: '#ffffff',
                    cursor: isSaving
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
