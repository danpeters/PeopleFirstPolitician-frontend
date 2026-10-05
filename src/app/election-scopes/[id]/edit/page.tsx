'use client';

/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\election-scopes\[id]\edit\page.tsx
 *
 * Purpose:
 * - Provides the frontend Edit Electoral Scope workflow.
 * - Loads an existing Electoral Scope.
 * - Loads dependent geography:
 *   State → LGA → Ward.
 * - Allows authorised users to update the scope.
 * - Uses the existing backend PATCH endpoint.
 *
 * API:
 * - GET  /organisations/:organisationId/electoral-scopes/:scopeId
 * - PATCH /organisations/:organisationId/electoral-scopes/:scopeId
 * - GET  /geography/states
 * - GET  /geography/states/:stateId/lgas
 * - GET  /geography/lgas/:lgaId/wards
 */

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import apiClient from '@/lib/api-client';
import { DEVELOPMENT_ORGANISATION_ID } from '@/config/organisation';

type ScopeType =
  | 'national'
  | 'state'
  | 'local_government'
  | 'ward';

interface GeographyItem {
  id: string;
  name: string;
  code?: string | null;
}

interface ElectoralScope {
  id: string;
  scopeType: ScopeType;
  name: string;
  code?: string | null;
  status?: string | null;
  stateId?: string | null;
  lgaId?: string | null;
  wardId?: string | null;
  state?: GeographyItem | null;
  lga?: GeographyItem | null;
  ward?: GeographyItem | null;
}

interface ScopeForm {
  scopeType: ScopeType;
  name: string;
  code: string;
  stateId: string;
  lgaId: string;
  wardId: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

const scopeTypeOptions: Array<{
  value: ScopeType;
  label: string;
}> = [
  {
    value: 'national',
    label: 'National',
  },
  {
    value: 'state',
    label: 'State',
  },
  {
    value: 'local_government',
    label: 'Local Government',
  },
  {
    value: 'ward',
    label: 'Ward',
  },
];

function formatGeographyName(value?: string | null): string {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word
        .split('-')
        .map((part) =>
          part ? part.charAt(0).toUpperCase() + part.slice(1) : part,
        )
        .join('-'),
    )
    .join(' ');
}

function formatScopeType(value?: string | null): string {
  switch (value) {
    case 'national':
      return 'National';
    case 'state':
      return 'State';
    case 'local_government':
      return 'Local Government';
    case 'ward':
      return 'Ward';
    default:
      return value || '—';
  }
}

function unwrapResponse<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    response.data !== undefined
  ) {
    return response.data as T;
  }

  return response as T;
}

export default function EditElectoralScopePage() {
  const router = useRouter();
  const params = useParams();

  const scopeId = useMemo(() => {
    const value = params?.id;

    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return value ? String(value) : '';
  }, [params]);

  const [form, setForm] = useState<ScopeForm>({
    scopeType: 'national',
    name: '',
    code: '',
    stateId: '',
    lgaId: '',
    wardId: '',
  });

  const [scope, setScope] = useState<ElectoralScope | null>(null);

  const [states, setStates] = useState<GeographyItem[]>([]);
  const [lgas, setLgas] = useState<GeographyItem[]>([]);
  const [wards, setWards] = useState<GeographyItem[]>([]);

  const [loadingScope, setLoadingScope] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ScopeForm, string>>
  >({});

  const loadStates = async () => {
    setLoadingStates(true);

    try {
      const response = await apiClient.get('/geography/states');
      const payload = unwrapResponse<GeographyItem[]>(response.data);
      setStates(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load states. Please try again.',
      );
    } finally {
      setLoadingStates(false);
    }
  };

  const loadLgas = async (stateId: string) => {
    if (!stateId) {
      setLgas([]);
      return;
    }

    setLoadingLgas(true);

    try {
      const response = await apiClient.get(
        `/geography/states/${stateId}/lgas`,
      );

      const payload = unwrapResponse<GeographyItem[]>(response.data);

      setLgas(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load Local Governments. Please try again.',
      );
      setLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  const loadWards = async (lgaId: string) => {
    if (!lgaId) {
      setWards([]);
      return;
    }

    setLoadingWards(true);

    try {
      const response = await apiClient.get(
        `/geography/lgas/${lgaId}/wards`,
      );

      const payload = unwrapResponse<GeographyItem[]>(response.data);

      setWards(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load Wards. Please try again.',
      );
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  const loadScope = async () => {
    if (!scopeId) {
      setError('Electoral Scope ID is missing.');
      setLoadingScope(false);
      return;
    }

    setLoadingScope(true);
    setError('');

    try {
      const response = await apiClient.get(
        `/organisations/${DEVELOPMENT_ORGANISATION_ID}/electoral-scopes/${scopeId}`,
      );

      const payload = unwrapResponse<ElectoralScope>(response.data);

      setScope(payload);

      setForm({
        scopeType: payload.scopeType,
        name: payload.name || '',
        code: payload.code || '',
        stateId: payload.stateId || payload.state?.id || '',
        lgaId: payload.lgaId || payload.lga?.id || '',
        wardId: payload.wardId || payload.ward?.id || '',
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load the Electoral Scope.',
      );
    } finally {
      setLoadingScope(false);
    }
  };

  useEffect(() => {
    void loadScope();
    void loadStates();
  }, [scopeId]);

  useEffect(() => {
    if (form.stateId) {
      void loadLgas(form.stateId);
    } else {
      setLgas([]);
    }
  }, [form.stateId]);

  useEffect(() => {
    if (form.lgaId) {
      void loadWards(form.lgaId);
    } else {
      setWards([]);
    }
  }, [form.lgaId]);

  const updateField = <K extends keyof ScopeForm>(
    field: K,
    value: ScopeForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setError('');
    setSuccess('');
  };

  const handleScopeTypeChange = (value: ScopeType) => {
    setForm((current) => ({
      ...current,
      scopeType: value,
      stateId:
        value === 'state' ||
        value === 'local_government' ||
        value === 'ward'
          ? current.stateId
          : '',
      lgaId:
        value === 'local_government' || value === 'ward'
          ? current.lgaId
          : '',
      wardId: value === 'ward' ? current.wardId : '',
    }));

    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const handleStateChange = (stateId: string) => {
    setForm((current) => ({
      ...current,
      stateId,
      lgaId: '',
      wardId: '',
    }));

    setLgas([]);
    setWards([]);
    setFieldErrors((current) => ({
      ...current,
      stateId: undefined,
      lgaId: undefined,
      wardId: undefined,
    }));
    setError('');
    setSuccess('');

    if (stateId) {
      void loadLgas(stateId);
    }
  };

  const handleLgaChange = (lgaId: string) => {
    setForm((current) => ({
      ...current,
      lgaId,
      wardId: '',
    }));

    setWards([]);
    setFieldErrors((current) => ({
      ...current,
      lgaId: undefined,
      wardId: undefined,
    }));
    setError('');
    setSuccess('');

    if (lgaId) {
      void loadWards(lgaId);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ScopeForm, string>> = {};

    if (!form.name.trim()) {
      errors.name = 'Scope name is required.';
    }

    if (form.scopeType === 'state' && !form.stateId) {
      errors.stateId = 'State is required for a State scope.';
    }

    if (
      form.scopeType === 'local_government' &&
      !form.lgaId
    ) {
      errors.lgaId =
        'Local Government is required for a Local Government scope.';
    }

    if (form.scopeType === 'ward' && !form.wardId) {
      errors.wardId = 'Ward is required for a Ward scope.';
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: Record<string, string> = {
        scopeType: form.scopeType,
        name: form.name.trim(),
      };

      if (form.code.trim()) {
        payload.code = form.code.trim();
      }

      if (
        form.scopeType === 'state' ||
        form.scopeType === 'local_government' ||
        form.scopeType === 'ward'
      ) {
        payload.stateId = form.stateId;
      }

      if (
        form.scopeType === 'local_government' ||
        form.scopeType === 'ward'
      ) {
        payload.lgaId = form.lgaId;
      }

      if (form.scopeType === 'ward') {
        payload.wardId = form.wardId;
      }

      await apiClient.patch(
        `/organisations/${DEVELOPMENT_ORGANISATION_ID}/electoral-scopes/${scopeId}`,
        payload,
      );

      setSuccess('Electoral Scope updated successfully.');

      setTimeout(() => {
        router.push(`/election-scopes/${scopeId}`);
      }, 700);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update the Electoral Scope. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingScope) {
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
            borderRadius: '10px',
            background: '#ffffff',
          }}
        >
          Loading Electoral Scope...
        </div>
      </main>
    );
  }

  if (!scope) {
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
            border: '1px solid #fecaca',
            borderRadius: '10px',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          {error || 'Electoral Scope could not be loaded.'}
        </div>

        <button
          type="button"
          onClick={() => router.push('/election-scopes')}
          style={{
            marginTop: '16px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Back to Electoral Scopes
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
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '6px',
            }}
          >
            Election Management / Electoral Scopes / Edit
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Edit Electoral Scope
          </h1>

          <p
            style={{
              marginTop: '8px',
              color: '#6b7280',
            }}
          >
            Update the electoral scope details and geographical coverage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/election-scopes/${scopeId}`)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#166534',
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 650,
              color: '#111827',
            }}
          >
            Scope Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <label
                htmlFor="scopeType"
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Scope Type
              </label>

              <select
                id="scopeType"
                value={form.scopeType}
                onChange={(event) =>
                  handleScopeTypeChange(
                    event.target.value as ScopeType,
                  )
                }
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                }}
              >
                {scopeTypeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <div
                style={{
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Current type: {formatScopeType(scope.scopeType)}
              </div>
            </div>

            <div>
              <label
                htmlFor="scopeName"
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Scope Name
              </label>

              <input
                id="scopeName"
                type="text"
                value={form.name}
                maxLength={180}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                placeholder="Enter scope name"
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border: fieldErrors.name
                    ? '1px solid #dc2626'
                    : '1px solid #d1d5db',
                }}
              />

              {fieldErrors.name && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '13px',
                    color: '#dc2626',
                  }}
                >
                  {fieldErrors.name}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="scopeCode"
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Scope Code
              </label>

              <input
                id="scopeCode"
                type="text"
                value={form.code}
                maxLength={100}
                onChange={(event) =>
                  updateField('code', event.target.value)
                }
                placeholder="Optional scope code"
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                }}
              />
            </div>
          </div>

          {(form.scopeType === 'state' ||
            form.scopeType === 'local_government' ||
            form.scopeType === 'ward') && (
            <div
              style={{
                marginTop: '28px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: 650,
                  color: '#111827',
                }}
              >
                Geographic Coverage
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                }}
              >
                <div>
                  <label
                    htmlFor="state"
                    style={{
                      display: 'block',
                      marginBottom: '7px',
                      fontWeight: 600,
                    }}
                  >
                    State
                  </label>

                  <select
                    id="state"
                    value={form.stateId}
                    disabled={loadingStates}
                    onChange={(event) =>
                      handleStateChange(event.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: '8px',
                      border: fieldErrors.stateId
                        ? '1px solid #dc2626'
                        : '1px solid #d1d5db',
                      background: '#ffffff',
                    }}
                  >
                    <option value="">
                      {loadingStates
                        ? 'Loading states...'
                        : 'Select State'}
                    </option>

                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {formatGeographyName(state.name)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.stateId && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        color: '#dc2626',
                      }}
                    >
                      {fieldErrors.stateId}
                    </div>
                  )}
                </div>

                {(form.scopeType === 'local_government' ||
                  form.scopeType === 'ward') && (
                  <div>
                    <label
                      htmlFor="lga"
                      style={{
                        display: 'block',
                        marginBottom: '7px',
                        fontWeight: 600,
                      }}
                    >
                      Local Government
                    </label>

                    <select
                      id="lga"
                      value={form.lgaId}
                      disabled={!form.stateId || loadingLgas}
                      onChange={(event) =>
                        handleLgaChange(event.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: '8px',
                        border: fieldErrors.lgaId
                          ? '1px solid #dc2626'
                          : '1px solid #d1d5db',
                        background: '#ffffff',
                      }}
                    >
                      <option value="">
                        {loadingLgas
                          ? 'Loading Local Governments...'
                          : !form.stateId
                            ? 'Select State first'
                            : 'Select Local Government'}
                      </option>

                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.id}>
                          {formatGeographyName(lga.name)}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.lgaId && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '13px',
                          color: '#dc2626',
                        }}
                      >
                        {fieldErrors.lgaId}
                      </div>
                    )}
                  </div>
                )}

                {form.scopeType === 'ward' && (
                  <div>
                    <label
                      htmlFor="ward"
                      style={{
                        display: 'block',
                        marginBottom: '7px',
                        fontWeight: 600,
                      }}
                    >
                      Ward
                    </label>

                    <select
                      id="ward"
                      value={form.wardId}
                      disabled={!form.lgaId || loadingWards}
                      onChange={(event) =>
                        updateField('wardId', event.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: '8px',
                        border: fieldErrors.wardId
                          ? '1px solid #dc2626'
                          : '1px solid #d1d5db',
                        background: '#ffffff',
                      }}
                    >
                      <option value="">
                        {loadingWards
                          ? 'Loading Wards...'
                          : !form.lgaId
                            ? 'Select Local Government first'
                            : 'Select Ward'}
                      </option>

                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {formatGeographyName(ward.name)}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.wardId && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '13px',
                          color: '#dc2626',
                        }}
                      >
                        {fieldErrors.wardId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {form.scopeType === 'national' && (
            <div
              style={{
                marginTop: '24px',
                padding: '14px 16px',
                borderRadius: '8px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#4b5563',
                fontSize: '14px',
              }}
            >
              A National scope does not require State, Local Government,
              or Ward geographic selection.
            </div>
          )}

          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() =>
                router.push(`/election-scopes/${scopeId}`)
              }
              disabled={saving}
              style={{
                padding: '11px 18px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '11px 20px',
                borderRadius: '8px',
                border: '1px solid #111827',
                background: saving ? '#9ca3af' : '#111827',
                color: '#ffffff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}