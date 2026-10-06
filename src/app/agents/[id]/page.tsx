'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api-client';

import {
  DEVELOPMENT_ORGANISATION_ID,
} from '@/config/organisation';

interface Agent {
  id: string;
  organisationId: string;
  userId?: string | null;

  firstName: string;
  middleName?: string | null;
  lastName: string;
  displayName: string;

  phone?: string | null;
  email?: string | null;

  photoUrl?: string | null;
  photoCapturedAt?: string | null;
  photoVersion?: number | null;

  agentReference?: string | null;

  identificationType?: string | null;
  identificationReference?: string | null;

  status: string;

  notes?: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const formatDate = (value?: string | null) => {
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

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatus = (status?: string | null) => {
  if (!status) {
    return '—';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
};

const formatLabel = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
};

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const agentId =
    typeof params?.id === 'string'
      ? params.id
      : '';

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAgent = useCallback(async () => {
    if (!agentId) {
      setError('Agent ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(
        `/agents/organisations/${DEVELOPMENT_ORGANISATION_ID}/${agentId}`,
      );

      const data = response.data;

      if (!data || !data.id) {
        throw new Error(
          'Invalid Agent response received.',
        );
      }

      setAgent(data);
    } catch (err: any) {
      console.error('Failed to retrieve Agent:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to retrieve Agent.',
      );
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

    const updateAgentStatus = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!agent) {
      return;
    }

    const statusLabels: Record<typeof newStatus, string> = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
    };

    const confirmed = window.confirm(
      `Are you sure you want to change this Agent's status to ${statusLabels[newStatus]}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await apiClient.patch(
        `/agents/organisations/${DEVELOPMENT_ORGANISATION_ID}/${agent.id}/status`,
        {
          status: newStatus,
        },
      );

      toast.success('Agent status updated successfully.', {
        description: `The Agent is now ${statusLabels[newStatus]}.`,
      });

      await fetchAgent();
    } catch (err: any) {
      console.error('Failed to update Agent status:', err);

      const responseData = err?.response?.data;

      let message =
        responseData?.message ||
        err?.message ||
        'Failed to update Agent status.';

      if (Array.isArray(message)) {
        message = message.join(' ');
      }

      setError(String(message));

      toast.error('Failed to update Agent status.', {
        description: String(message),
      });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '32px',
          color: '#526581',
        }}
      >
        Loading Agent...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            background: '#fff5f5',
            border: '1px solid #ffb3b3',
            borderRadius: '10px',
            padding: '16px',
            color: '#c62828',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => router.push('/agents')}
          style={{
            border: '1px solid #c8d5e6',
            background: '#ffffff',
            color: '#17365d',
            borderRadius: '8px',
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          ← Back to Agents
        </button>
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            background: '#fffaf0',
            border: '1px solid #f0d28a',
            borderRadius: '10px',
            padding: '16px',
            color: '#765800',
            marginBottom: '20px',
          }}
        >
          Agent not found.
        </div>

        <button
          type="button"
          onClick={() => router.push('/agents')}
          style={{
            border: '1px solid #c8d5e6',
            background: '#ffffff',
            color: '#17365d',
            borderRadius: '8px',
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          ← Back to Agents
        </button>
      </div>
    );
  }

  const initials =
    agent.displayName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'A';

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#f5f8fb',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #dbe3ec',
          padding: '24px 28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: '#60728a',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            >
              Home / Agents / {agent.displayName}
            </div>

            <h1
              style={{
                margin: 0,
                color: '#12233f',
                fontSize: '30px',
                fontWeight: 700,
              }}
            >
              Agent Details
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#60728a',
                fontSize: '16px',
              }}
            >
              View registered polling unit agent information.
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
              onClick={() => router.push('/agents')}
              style={{
                border: '1px solid #c8d5e6',
                background: '#ffffff',
                color: '#17365d',
                borderRadius: '8px',
                padding: '11px 18px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← Back
            </button>

                        {agent.status === 'active' && (
              <>
                <button
                  type="button"
                  onClick={() => updateAgentStatus('inactive')}
                  style={{
                    border: '1px solid #d97706',
                    background: '#ffffff',
                    color: '#b45309',
                    borderRadius: '8px',
                    padding: '11px 18px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Deactivate
                </button>

                <button
                  type="button"
                  onClick={() => updateAgentStatus('suspended')}
                  style={{
                    border: '1px solid #dc2626',
                    background: '#ffffff',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    padding: '11px 18px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Suspend
                </button>
              </>
            )}

            {agent.status === 'inactive' && (
              <>
                <button
                  type="button"
                  onClick={() => updateAgentStatus('active')}
                  style={{
                    border: '1px solid #16a34a',
                    background: '#ffffff',
                    color: '#15803d',
                    borderRadius: '8px',
                    padding: '11px 18px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Activate
                </button>

                <button
                  type="button"
                  onClick={() => updateAgentStatus('suspended')}
                  style={{
                    border: '1px solid #dc2626',
                    background: '#ffffff',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    padding: '11px 18px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Suspend
                </button>
              </>
            )}

            {agent.status === 'suspended' && (
              <button
                type="button"
                onClick={() => updateAgentStatus('active')}
                style={{
                  border: '1px solid #16a34a',
                  background: '#ffffff',
                  color: '#15803d',
                  borderRadius: '8px',
                  padding: '11px 18px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Activate
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                router.push(`/agents/${agent.id}/edit`)
              }
              style={{
                border: 'none',
                background: '#2864e8',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '11px 20px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Edit Agent
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '28px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Profile summary */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e1e8f0',
            padding: '24px',
            marginBottom: '22px',
            boxShadow: '0 2px 8px rgba(20, 45, 80, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {agent.photoUrl ? (
              <img
                src={agent.photoUrl}
                alt={agent.displayName}
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #e6edf5',
                }}
              />
            ) : (
              <div
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  background: '#edf2f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#48617f',
                  fontSize: '28px',
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  color: '#17365d',
                  fontSize: '25px',
                }}
              >
                {agent.displayName}
              </h2>

              <div
                style={{
                  marginTop: '7px',
                  color: '#60728a',
                  fontSize: '15px',
                }}
              >
                Agent Reference:{' '}
                <strong>
                  {agent.agentReference || '—'}
                </strong>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '999px',
                padding: '7px 14px',
                background:
                  agent.status === 'active'
                    ? '#c9f5d9'
                    : '#edf0f4',
                color:
                  agent.status === 'active'
                    ? '#14733c'
                    : '#526581',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {formatStatus(agent.status)}
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e1e8f0',
            padding: '24px',
            marginBottom: '22px',
            boxShadow: '0 2px 8px rgba(20, 45, 80, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              color: '#17365d',
              fontSize: '20px',
            }}
          >
            Personal Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <InfoItem
              label="First Name"
              value={agent.firstName}
            />

            <InfoItem
              label="Middle Name"
              value={agent.middleName}
            />

            <InfoItem
              label="Last Name"
              value={agent.lastName}
            />

            <InfoItem
              label="Display Name"
              value={agent.displayName}
            />

            <InfoItem
              label="Phone"
              value={agent.phone}
            />

            <InfoItem
              label="Email"
              value={agent.email}
            />
          </div>
        </section>

        {/* Identification */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e1e8f0',
            padding: '24px',
            marginBottom: '22px',
            boxShadow: '0 2px 8px rgba(20, 45, 80, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              color: '#17365d',
              fontSize: '20px',
            }}
          >
            Identification
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <InfoItem
              label="Identification Type"
              value={formatLabel(
                agent.identificationType,
              )}
            />

            <InfoItem
              label="Identification Reference"
              value={agent.identificationReference}
            />

            <InfoItem
              label="Agent Reference"
              value={agent.agentReference}
            />
          </div>
        </section>

        {/* Record Information */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e1e8f0',
            padding: '24px',
            marginBottom: '22px',
            boxShadow: '0 2px 8px rgba(20, 45, 80, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              color: '#17365d',
              fontSize: '20px',
            }}
          >
            Record Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <InfoItem
              label="Registered"
              value={formatDate(agent.createdAt)}
            />

            <InfoItem
              label="Last Updated"
              value={formatDateTime(agent.updatedAt)}
            />

            <InfoItem
              label="Photo Version"
              value={
                agent.photoVersion !== null &&
                agent.photoVersion !== undefined
                  ? String(agent.photoVersion)
                  : '—'
              }
            />

            <InfoItem
              label="Photo Captured"
              value={formatDateTime(
                agent.photoCapturedAt,
              )}
            />
          </div>
        </section>

        {/* Notes */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e1e8f0',
            padding: '24px',
            marginBottom: '22px',
            boxShadow: '0 2px 8px rgba(20, 45, 80, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 14px',
              color: '#17365d',
              fontSize: '20px',
            }}
          >
            Notes
          </h2>

          <p
            style={{
              margin: 0,
              color: '#526581',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {agent.notes || 'No notes recorded.'}
          </p>
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <div
        style={{
          color: '#718198',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '6px',
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#1d3557',
          fontSize: '15px',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}