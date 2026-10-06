'use client';

/**
 * ============================================================
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\agents\[id]\edit\page.tsx
 *
 * Purpose:
 * - Provides the Edit Agent form.
 * - Loads the existing Agent record from the backend.
 * - Allows authorised users to update normal Agent information.
 * - Sends the changes through the authenticated API client.
 * - Displays a success notification after a successful update.
 * - Redirects back to the Agent Details page after the notification.
 *
 * Editable fields:
 * - First Name
 * - Middle Name
 * - Last Name
 * - Phone
 * - Email
 * - Identification Type
 * - Agent Reference
 * - Photo URL / Storage Reference
 * - Administrative Notes
 *
 * Deliberately excluded:
 * - Display Name
 * - Identification Reference
 * - Existing Platform User ID
 * - Status
 * - Organisation
 * - Deleted state
 *
 * Security:
 * - Organisation ID comes from the development organisation
 *   configuration.
 * - The authenticated API client supplies the Bearer token.
 * - Backend authentication, permissions, organisation access,
 *   validation and uniqueness remain authoritative.
 * - Status changes must use the dedicated status endpoint.
 *
 * ============================================================
 */

import React, { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { DEVELOPMENT_ORGANISATION_ID } from '@/config/organisation';

interface AgentForm {
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  email: string;
  photoUrl: string;
  identificationType: string;
  agentReference: string;
  notes: string;
}

const initialForm: AgentForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '',
  email: '',
  photoUrl: '',
  identificationType: '',
  agentReference: '',
  notes: '',
};

interface AgentResponse {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  identificationType?: string | null;
  agentReference?: string | null;
  notes?: string | null;
}

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();

  const agentId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  const [form, setForm] = useState<AgentForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!agentId) {
      setError('Agent ID is missing.');
      setLoading(false);
      return;
    }

    const loadAgent = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await apiClient.get(
          `/agents/organisations/${DEVELOPMENT_ORGANISATION_ID}/${agentId}`,
        );

        const data: AgentResponse = response.data;

        if (!data || !data.id) {
          throw new Error('Invalid Agent response received.');
        }

        setForm({
          firstName: data.firstName ?? '',
          middleName: data.middleName ?? '',
          lastName: data.lastName ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          photoUrl: data.photoUrl ?? '',
          identificationType: data.identificationType ?? '',
          agentReference: data.agentReference ?? '',
          notes: data.notes ?? '',
        });
      } catch (err: any) {
        const responseData = err?.response?.data;

        let message =
          responseData?.message ||
          err?.message ||
          'Failed to load Agent.';

        if (Array.isArray(message)) {
          message = message.join(' ');
        }

        setError(String(message));
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [agentId]);

  const updateField = (
    field: keyof AgentForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();

    if (!firstName) {
      setError('First Name is required.');
      return;
    }

    if (!lastName) {
      setError('Last Name is required.');
      return;
    }

    if (!phone) {
      setError('Phone is required.');
      return;
    }

    if (form.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(form.email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    setSaving(true);

    try {
      const payload: Record<string, string> = {
        firstName,
        lastName,
        phone,
      };

      const optionalFields: Array<keyof AgentForm> = [
        'middleName',
        'email',
        'photoUrl',
        'identificationType',
        'agentReference',
        'notes',
      ];

      optionalFields.forEach((field) => {
        const value = form[field].trim();

        if (value) {
          payload[field] = value;
        }
      });

      const response = await apiClient.patch(
        `/agents/organisations/${DEVELOPMENT_ORGANISATION_ID}/${agentId}`,
        payload,
      );

      const data = response.data;

      if (!data || !data.id) {
        throw new Error(
          'Agent was updated, but the server returned an invalid response.',
        );
      }

      toast.success('Agent updated successfully.', {
        description:
          'The Agent information has been updated.',
      });

      setTimeout(() => {
        router.push(`/agents/${data.id}`);
      }, 1500);
    } catch (err: any) {
      const responseData = err?.response?.data;

      let message =
        responseData?.message ||
        err?.message ||
        'Failed to update Agent.';

      if (Array.isArray(message)) {
        message = message.join(' ');
      }

      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          padding: '32px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#6b7280',
          }}
        >
          Loading Agent...
        </div>
      </main>
    );
  }

  if (error && !form.firstName) {
    return (
      <main
        style={{
          padding: '32px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          role="alert"
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderRadius: '6px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '14px',
          }}
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => router.push(`/agents/${agentId}`)}
          style={{
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#374151',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Back to Agent
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: '32px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Edit Agent
          </h1>

          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            Update the Agent information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/agents/${agentId}`)}
          style={{
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#374151',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Back to Agent
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderRadius: '6px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <section
          style={{
            marginBottom: '24px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#ffffff',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
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
            <Field
              label="First Name"
              value={form.firstName}
              onChange={(value) =>
                updateField('firstName', value)
              }
              required
              maxLength={100}
            />

            <Field
              label="Middle Name"
              value={form.middleName}
              onChange={(value) =>
                updateField('middleName', value)
              }
              maxLength={100}
            />

            <Field
              label="Last Name"
              value={form.lastName}
              onChange={(value) =>
                updateField('lastName', value)
              }
              required
              maxLength={100}
            />
          </div>
        </section>

        <section
          style={{
            marginBottom: '24px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#ffffff',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Contact Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <Field
              label="Phone"
              value={form.phone}
              onChange={(value) =>
                updateField('phone', value)
              }
              required
              maxLength={50}
            />

            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField('email', value)
              }
              maxLength={255}
            />
          </div>
        </section>

        <section
          style={{
            marginBottom: '24px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#ffffff',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
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
            <Field
              label="Identification Type"
              value={form.identificationType}
              onChange={(value) =>
                updateField(
                  'identificationType',
                  value,
                )
              }
              maxLength={100}
            />

            <Field
              label="Agent Reference"
              value={form.agentReference}
              onChange={(value) =>
                updateField('agentReference', value)
              }
              maxLength={100}
              autoComplete="off"
            />
          </div>
        </section>

        <section
          style={{
            marginBottom: '24px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#ffffff',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Additional Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <Field
              label="Photo URL / Storage Reference"
              value={form.photoUrl}
              onChange={(value) =>
                updateField('photoUrl', value)
              }
              maxLength={1000}
            />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
              }}
            >
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                Notes
              </label>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField('notes', event.target.value)
                }
                maxLength={5000}
                rows={5}
                autoComplete="off"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#111827',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => router.push(`/agents/${agentId}`)}
            disabled={saving}
            style={{
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#374151',
              borderRadius: '6px',
              padding: '10px 18px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              border: 'none',
              background: saving ? '#9ca3af' : '#111827',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '10px 18px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  maxLength,
  autoComplete,
}: FieldProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}
    >
      <label
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
        }}
      >
        {label}
        {required ? ' *' : ''}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '10px 12px',
          fontSize: '14px',
          color: '#111827',
          background: '#ffffff',
        }}
      />
    </div>
  );
}