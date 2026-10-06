'use client';

/**
 * ============================================================
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\agents\new\page.tsx
 *
 * Purpose:
 * - Provides the Agent Registration form.
 * - Registers an Agent within the active development organisation.
 * - Collects only information appropriate for normal Agent
 *   registration.
 * - Provides client-side validation for required fields and email.
 * - Sends the registration request to the authenticated backend API.
 * - Displays a success notification after successful registration.
 * - Redirects the user to the newly created Agent's details page.
 *
 * Registration fields:
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
 * Fields deliberately excluded from the normal registration form:
 * - Display Name
 * - Identification Reference
 * - Existing Platform User ID
 *
 * Design rationale:
 * - Display Name can be derived from the person's names.
 * - Identification Reference is not required for basic registration.
 * - Existing Platform User ID is an internal system identifier and
 *   should not normally be entered manually by an administrator.
 *
 * Security:
 * - The organisation ID is taken from the development organisation
 *   configuration.
 * - The API client supplies the authenticated Bearer token.
 * - Backend authentication, organisation membership and permissions
 *   remain authoritative.
 * - Agent-reference uniqueness is enforced by the backend.
 *
 * User feedback:
 * - Validation errors are displayed on the registration page.
 * - Successful registration displays a success toast notification.
 * - The user is then redirected to the Agent details page.
 * ============================================================
 */


import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { DEVELOPMENT_ORGANISATION_ID } from '@/config/organisation';
import { toast } from 'sonner';

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

export default function RegisterAgentPage() {
  const router = useRouter();

  const [form, setForm] = useState<AgentForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (
    field: keyof AgentForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

      const response = await apiClient.post(
        `/agents/organisations/${DEVELOPMENT_ORGANISATION_ID}`,
        payload,
      );

      const data = response.data;

      if (!data || !data.id) {
        throw new Error(
          'Agent was created, but the server returned an invalid response.',
        );
      }

      toast.success('Agent registered successfully.', {
        description: 'The Agent has been added to the organisation.',
      });

      setTimeout(() => {
        router.push(`/agents/${data.id}`);
      }, 1500);
    } catch (err: any) {
      const responseData = err?.response?.data;

      let message =
        responseData?.message ||
        err?.message ||
        'Failed to register Agent.';

      if (Array.isArray(message)) {
        message = message.join(' ');
      }

      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

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
            Register Agent
          </h1>

          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            Register an Agent within the organisation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/agents')}
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
          Back to Agents
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

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Personal Information */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px',
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
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
            }}
          >
            <Field
              label="First Name"
              required
              value={form.firstName}
              onChange={(value) =>
                updateField('firstName', value)
              }
              placeholder="Enter first name"
            />

            <Field
              label="Middle Name"
              value={form.middleName}
              onChange={(value) =>
                updateField('middleName', value)
              }
              placeholder="Enter middle name"
            />

            <Field
              label="Last Name"
              required
              value={form.lastName}
              onChange={(value) =>
                updateField('lastName', value)
              }
              placeholder="Enter last name"
            />

          </div>
        </section>

        {/* Contact Information */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px',
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
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
            }}
          >
            <Field
              label="Phone"
              required
              value={form.phone}
              onChange={(value) =>
                updateField('phone', value)
              }
              placeholder="Enter telephone number"
              type="tel"
            />

            <Field
              label="Email"
              value={form.email}
              onChange={(value) =>
                updateField('email', value)
              }
              placeholder="Enter email address"
              type="email"
            />
          </div>
        </section>

        {/* Identification */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px',
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
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
            }}
          >
            <Field
              label="Identification Type"
              value={form.identificationType}
              onChange={(value) =>
                updateField('identificationType', value)
              }
              placeholder="e.g. National ID, Voter Card"
            />

            <Field
              label="Agent Reference"
              value={form.agentReference}
              onChange={(value) =>
                updateField('agentReference', value)
              }
              placeholder="e.g. MSF-AGT-0001"
              autoComplete="off"
              helperText="Must be unique within the organisation."
            />
          </div>
        </section>

        {/* Account and Additional Information */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px',
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
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
            }}
          >
            <Field
              label="Photo URL / Storage Reference"
              value={form.photoUrl}
              onChange={(value) =>
                updateField('photoUrl', value)
              }
              placeholder="Optional photo storage reference"
            />
          </div>

          <div style={{ marginTop: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
              }}
            >
              Administrative Notes
            </label>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateField('notes', event.target.value)
              }
              placeholder="Enter any relevant administrative notes"
              rows={5}
              maxLength={5000}
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

            <div
              style={{
                marginTop: '5px',
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'right',
              }}
            >
              {form.notes.length}/5000
            </div>
          </div>
        </section>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingBottom: '30px',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/agents')}
            disabled={saving}
            style={{
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#374151',
              borderRadius: '6px',
              padding: '11px 20px',
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
              background: saving ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '11px 20px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {saving ? 'Registering...' : 'Register Agent'}
          </button>
        </div>
      </form>
    </main>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  helperText?: string;
  autoComplete?: string;
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = 'text',
  helperText,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '7px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151',
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#dc2626' }}> *</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={
        label === 'First Name' ||
        label === 'Middle Name' ||
        label === 'Last Name'
            ? 100
            : label === 'Email'
            ? 255
            : label === 'Agent Reference'
                ? 100
                : label === 'Identification Type'
                ? 100
                : label === 'Phone'
                    ? 50
                    : label === 'Photo URL / Storage Reference'
                    ? 1000
                    : undefined
        }
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

      {helperText && (
        <p
          style={{
            margin: '5px 0 0',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}