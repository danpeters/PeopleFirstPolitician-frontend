/**
 * ============================================================
 * People First Politician
 * Add Electoral Scope Page
 * ============================================================
 *
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\election-scopes\new\page.tsx
 *
 * Purpose:
 * - Provides the frontend form for creating an Electoral Scope.
 * - Supports the four scope types currently supported by the
 *   backend:
 *     1. National
 *     2. State
 *     3. Local Government
 *     4. Ward
 * - Loads Nigerian States from the Geography API.
 * - Loads LGAs after a State is selected.
 * - Loads Wards after an LGA is selected.
 * - Submits the validated scope to the Electoral Scope API.
 * - Redirects to the created Electoral Scope details page after
 *   successful creation.
 *
 * API:
 * - GET  /api/v1/geography/states
 * - GET  /api/v1/geography/states/:stateId/lgas
 * - GET  /api/v1/geography/lgas/:lgaId/wards
 * - POST /api/v1/organisations/:organisationId/electoral-scopes
 *
 * Security:
 * - Requests use the existing authenticated apiClient.
 * - The backend remains authoritative for authentication,
 *   organisation membership and permission checks.
 * - The frontend does not bypass backend validation.
 *
 * Organisation Context:
 * - The current implementation uses the development organisation
 *   configured in @/config/organisation.
 * - This is temporary development configuration.
 * - It should later be replaced with the authenticated user's
 *   active organisation context.
 *
 * Validation rules reflected from the backend:
 * - National: no State, LGA or Ward.
 * - State: State is required; LGA and Ward are not allowed.
 * - Local Government: State and LGA are required; Ward is not allowed.
 * - Ward: State, LGA and Ward are required.
 * - Scope name is required.
 * - Scope code is optional.
 *
 * Important:
 * - SENATORIAL_DISTRICT, FEDERAL_CONSTITUENCY,
 *   STATE_CONSTITUENCY and POLLING_UNIT are deliberately not
 *   presented because the current backend rejects those creation
 *   paths.
 * ============================================================
 */

'use client';

import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/api-client';

import {
  DEVELOPMENT_ORGANISATION_ID,
} from '@/config/organisation';

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

interface ScopeForm {
  scopeType: ScopeType;
  name: string;
  code: string;
  stateId: string;
  lgaId: string;
  wardId: string;
}

const scopeTypeOptions: Array<{
  value: ScopeType;
  label: string;
  description: string;
}> = [
  {
    value: 'national',
    label: 'National',
    description: 'Covers the entire country.',
  },
  {
    value: 'state',
    label: 'State',
    description: 'Covers one Nigerian State.',
  },
  {
    value: 'local_government',
    label: 'Local Government',
    description: 'Covers one Local Government Area.',
  },
  {
    value: 'ward',
    label: 'Ward',
    description: 'Covers one electoral Ward.',
  },
];

/**
 * Convert backend/API errors into a useful message for the user.
 */
function getApiErrorMessage(error: any): string {
  const responseMessage =
    error?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(', ');
  }

  if (
    typeof responseMessage === 'string' &&
    responseMessage.trim()
  ) {
    return responseMessage;
  }

  if (
    typeof error?.message === 'string' &&
    error.message.trim()
  ) {
    return error.message;
  }

  return 'The Electoral Scope could not be created. Please try again.';
}

/**
 * User-friendly labels for the selected geography.
 */
function formatGeographyName(
  name?: string | null,
): string {
  if (!name) {
    return '';
  }

  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ');
}

export default function AddElectoralScopePage() {
  const router = useRouter();

  const [form, setForm] = useState<ScopeForm>({
    scopeType: 'national',
    name: '',
    code: '',
    stateId: '',
    lgaId: '',
    wardId: '',
  });

  const [states, setStates] = useState<GeographyItem[]>([]);
  const [lgas, setLgas] = useState<GeographyItem[]>([]);
  const [wards, setWards] = useState<GeographyItem[]>([]);

  const [loadingStates, setLoadingStates] =
    useState(true);
  const [loadingLgas, setLoadingLgas] =
    useState(false);
  const [loadingWards, setLoadingWards] =
    useState(false);

  const [statesError, setStatesError] =
    useState('');
  const [lgasError, setLgasError] =
    useState('');
  const [wardsError, setWardsError] =
    useState('');

  const [submitError, setSubmitError] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /**
   * Determine which geography controls are required
   * for the selected scope type.
   */
  const geographyRequirements = useMemo(() => {
    switch (form.scopeType) {
      case 'national':
        return {
          state: false,
          lga: false,
          ward: false,
        };

      case 'state':
        return {
          state: true,
          lga: false,
          ward: false,
        };

      case 'local_government':
        return {
          state: true,
          lga: true,
          ward: false,
        };

      case 'ward':
        return {
          state: true,
          lga: true,
          ward: true,
        };

      default:
        return {
          state: false,
          lga: false,
          ward: false,
        };
    }
  }, [form.scopeType]);

  /**
   * Load all Nigerian States when the page opens.
   */
  useEffect(() => {
    let cancelled = false;

    const loadStates = async () => {
      try {
        setLoadingStates(true);
        setStatesError('');

        const response =
          await apiClient.get(
            '/geography/states',
          );

        if (!cancelled) {
          setStates(
            response.data?.data ?? [],
          );
        }
      } catch (error) {
        console.error(
          'Failed to load States:',
          error,
        );

        if (!cancelled) {
          setStatesError(
            getApiErrorMessage(error),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingStates(false);
        }
      }
    };

    loadStates();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Update a text/select field in the form.
   */
  const handleFieldChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitError('');
  };

  /**
   * Change the scope type.
   *
   * Changing scope type resets geography that may no
   * longer apply.
   */
  const handleScopeTypeChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const scopeType =
      event.target.value as ScopeType;

    setForm((current) => ({
      ...current,
      scopeType,
      stateId:
        scopeType === 'national'
          ? ''
          : current.stateId,
      lgaId:
        scopeType === 'national' ||
        scopeType === 'state'
          ? ''
          : current.lgaId,
      wardId:
        scopeType === 'ward'
          ? current.wardId
          : '',
    }));

    if (scopeType === 'national') {
      setLgas([]);
      setWards([]);
    }

    if (
      scopeType === 'state' ||
      scopeType === 'national'
    ) {
      setWards([]);
    }

    setLgasError('');
    setWardsError('');
    setSubmitError('');
  };

  /**
   * Handle State selection.
   *
   * Selecting a State:
   * - stores the selected State;
   * - clears the previous LGA and Ward;
   * - loads LGAs belonging to that State.
   */
  const handleStateChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const stateId = event.target.value;

    setForm((current) => ({
      ...current,
      stateId,
      lgaId: '',
      wardId: '',
    }));

    setLgas([]);
    setWards([]);
    setLgasError('');
    setWardsError('');
    setSubmitError('');

    if (!stateId) {
      return;
    }

    try {
      setLoadingLgas(true);

      const response =
        await apiClient.get(
          `/geography/states/${stateId}/lgas`,
        );

      setLgas(
        response.data?.data ?? [],
      );
    } catch (error) {
      console.error(
        'Failed to load LGAs:',
        error,
      );

      setLgasError(
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingLgas(false);
    }
  };

  /**
   * Handle LGA selection.
   *
   * Selecting an LGA:
   * - stores the selected LGA;
   * - clears the previous Ward;
   * - loads Wards belonging to that LGA.
   */
  const handleLgaChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const lgaId = event.target.value;

    setForm((current) => ({
      ...current,
      lgaId,
      wardId: '',
    }));

    setWards([]);
    setWardsError('');
    setSubmitError('');

    if (!lgaId) {
      return;
    }

    try {
      setLoadingWards(true);

      const response =
        await apiClient.get(
          `/geography/lgas/${lgaId}/wards`,
        );

      setWards(
        response.data?.data ?? [],
      );
    } catch (error) {
      console.error(
        'Failed to load Wards:',
        error,
      );

      setWardsError(
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingWards(false);
    }
  };

  /**
   * Client-side validation before sending the request.
   *
   * Backend validation remains authoritative.
   */
  const validateForm = (): string => {
    if (!form.name.trim()) {
      return 'Scope Name is required.';
    }

    if (
      geographyRequirements.state &&
      !form.stateId
    ) {
      return 'Please select a State.';
    }

    if (
      geographyRequirements.lga &&
      !form.lgaId
    ) {
      return 'Please select a Local Government Area.';
    }

    if (
      geographyRequirements.ward &&
      !form.wardId
    ) {
      return 'Please select a Ward.';
    }

    return '';
  };

  /**
   * Create the Electoral Scope.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSubmitError('');

    const validationError =
      validateForm();

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: {
        scopeType: ScopeType;
        name: string;
        code?: string;
        stateId?: string;
        lgaId?: string;
        wardId?: string;
      } = {
        scopeType: form.scopeType,
        name: form.name.trim(),
      };

      if (form.code.trim()) {
        payload.code =
          form.code.trim();
      }

      if (
        geographyRequirements.state &&
        form.stateId
      ) {
        payload.stateId =
          form.stateId;
      }

      if (
        geographyRequirements.lga &&
        form.lgaId
      ) {
        payload.lgaId =
          form.lgaId;
      }

      if (
        geographyRequirements.ward &&
        form.wardId
      ) {
        payload.wardId =
          form.wardId;
      }

      const response =
  await apiClient.post(
    `/organisations/${DEVELOPMENT_ORGANISATION_ID}/electoral-scopes`,
    payload,
  );

/**
 * The Electoral Scope create endpoint returns the
 * created scope directly rather than wrapping it in
 * a `data` property.
 *
 * The fallback to response.data?.data keeps the
 * frontend tolerant of a standard API wrapper should
 * the backend response format change later.
 */
const createdScope =
  response.data?.data ??
  response.data;

const createdScopeId =
  createdScope?.id ??
  createdScope?.data?.id;

if (!createdScopeId) {
  throw new Error(
    'The scope was created, but the API did not return its ID.',
  );
}

router.push(
  `/election-scopes/${createdScopeId}`,
);
    } catch (error) {
      console.error(
        'Failed to create Electoral Scope:',
        error,
      );

      setSubmitError(
        getApiErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel creation and return to the list.
   */
  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }

    router.push(
      '/election-scopes',
    );
  };

  const selectedState =
    states.find(
      (item) =>
        item.id === form.stateId,
    );

  const selectedLga =
    lgas.find(
      (item) =>
        item.id === form.lgaId,
    );

  const selectedWard =
    wards.find(
      (item) =>
        item.id === form.wardId,
    );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        padding: '32px 24px 48px',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {/* Page Header */}
        <div
          style={{
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#4a5568',
              padding: 0,
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '14px',
            }}
          >
            ← Back to Electoral Scopes
          </button>

          <h1
            style={{
              margin: 0,
              fontSize: '30px',
              lineHeight: 1.2,
              color: '#1a202c',
            }}
          >
            Add Electoral Scope
          </h1>

          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              color: '#718096',
              fontSize: '15px',
              lineHeight: 1.6,
            }}
          >
            Define the geographical scope used by
            the election management system.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow:
              '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Basic Information */}
          <section>
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                color: '#1a202c',
              }}
            >
              Scope Information
            </h2>

            <p
              style={{
                marginTop: '6px',
                color: '#718096',
                fontSize: '14px',
              }}
            >
              Enter the basic identification
              information for this Electoral Scope.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginTop: '22px',
              }}
            >
              <div>
                <label
                  htmlFor="scopeType"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#2d3748',
                    marginBottom: '7px',
                  }}
                >
                  Scope Type
                  <span
                    style={{
                      color: '#c53030',
                      marginLeft: '3px',
                    }}
                  >
                    *
                  </span>
                </label>

                <select
                  id="scopeType"
                  name="scopeType"
                  value={form.scopeType}
                  onChange={
                    handleScopeTypeChange
                  }
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '9px 12px',
                    border:
                      '1px solid #cbd5e0',
                    borderRadius: '7px',
                    background: '#ffffff',
                    color: '#1a202c',
                    fontSize: '14px',
                  }}
                >
                  {scopeTypeOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <p
                  style={{
                    marginTop: '6px',
                    marginBottom: 0,
                    color: '#718096',
                    fontSize: '12px',
                  }}
                >
                  {
                    scopeTypeOptions.find(
                      (option) =>
                        option.value ===
                        form.scopeType,
                    )?.description
                  }
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#2d3748',
                    marginBottom: '7px',
                  }}
                >
                  Scope Name
                  <span
                    style={{
                      color: '#c53030',
                      marginLeft: '3px',
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={
                    handleFieldChange
                  }
                  maxLength={180}
                  disabled={isSubmitting}
                  placeholder="e.g. Abia State"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '9px 12px',
                    border:
                      '1px solid #cbd5e0',
                    borderRadius: '7px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#2d3748',
                    marginBottom: '7px',
                  }}
                >
                  Scope Code
                  <span
                    style={{
                      color: '#718096',
                      fontWeight: 400,
                      marginLeft: '6px',
                    }}
                  >
                    Optional
                  </span>
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={form.code}
                  onChange={
                    handleFieldChange
                  }
                  maxLength={100}
                  disabled={isSubmitting}
                  placeholder="e.g. ABIA"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '9px 12px',
                    border:
                      '1px solid #cbd5e0',
                    borderRadius: '7px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Geography */}
          <section
            style={{
              marginTop: '34px',
              paddingTop: '28px',
              borderTop:
                '1px solid #edf2f7',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                color: '#1a202c',
              }}
            >
              Geographic Coverage
            </h2>

            <p
              style={{
                marginTop: '6px',
                color: '#718096',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              Select the geographical level required
              for the selected scope type. The available
              LGAs and Wards depend on the preceding
              selection.
            </p>

            {form.scopeType === 'national' ? (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#f7fafc',
                  border:
                    '1px solid #e2e8f0',
                  color: '#4a5568',
                  fontSize: '14px',
                }}
              >
                National scope does not require a
                State, LGA or Ward selection.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginTop: '22px',
                }}
              >
                {/* State */}
                {geographyRequirements.state && (
                  <div>
                    <label
                      htmlFor="stateId"
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#2d3748',
                        marginBottom: '7px',
                      }}
                    >
                      State
                      <span
                        style={{
                          color: '#c53030',
                          marginLeft: '3px',
                        }}
                      >
                        *
                      </span>
                    </label>

                    <select
                      id="stateId"
                      name="stateId"
                      value={form.stateId}
                      onChange={
                        handleStateChange
                      }
                      disabled={
                        isSubmitting ||
                        loadingStates
                      }
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding:
                          '9px 12px',
                        border:
                          '1px solid #cbd5e0',
                        borderRadius: '7px',
                        background:
                          '#ffffff',
                        color:
                          '#1a202c',
                        fontSize:
                          '14px',
                      }}
                    >
                      <option value="">
                        {loadingStates
                          ? 'Loading States...'
                          : 'Select State'}
                      </option>

                      {states.map(
                        (state) => (
                          <option
                            key={state.id}
                            value={state.id}
                          >
                            {
                              formatGeographyName(
                                state.name,
                              )
                            }
                          </option>
                        ),
                      )}
                    </select>

                    {statesError && (
                      <p
                        style={{
                          marginTop:
                            '7px',
                          marginBottom:
                            0,
                          color:
                            '#c53030',
                          fontSize:
                            '12px',
                        }}
                      >
                        {statesError}
                      </p>
                    )}

                    {selectedState && (
                      <p
                        style={{
                          marginTop:
                            '6px',
                          marginBottom:
                            0,
                          color:
                            '#718096',
                          fontSize:
                            '12px',
                        }}
                      >
                        Code:{' '}
                        {selectedState.code ??
                          '—'}
                      </p>
                    )}
                  </div>
                )}

                {/* LGA */}
                {geographyRequirements.lga && (
                  <div>
                    <label
                      htmlFor="lgaId"
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#2d3748',
                        marginBottom: '7px',
                      }}
                    >
                      Local Government Area
                      <span
                        style={{
                          color: '#c53030',
                          marginLeft: '3px',
                        }}
                      >
                        *
                      </span>
                    </label>

                    <select
                      id="lgaId"
                      name="lgaId"
                      value={form.lgaId}
                      onChange={
                        handleLgaChange
                      }
                      disabled={
                        isSubmitting ||
                        !form.stateId ||
                        loadingLgas
                      }
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding:
                          '9px 12px',
                        border:
                          '1px solid #cbd5e0',
                        borderRadius: '7px',
                        background:
                          '#ffffff',
                        color:
                          '#1a202c',
                        fontSize:
                          '14px',
                      }}
                    >
                      <option value="">
                        {!form.stateId
                          ? 'Select State first'
                          : loadingLgas
                            ? 'Loading LGAs...'
                            : 'Select Local Government Area'}
                      </option>

                      {lgas.map(
                        (lga) => (
                          <option
                            key={lga.id}
                            value={lga.id}
                          >
                            {
                              formatGeographyName(
                                lga.name,
                              )
                            }
                          </option>
                        ),
                      )}
                    </select>

                    {lgasError && (
                      <p
                        style={{
                          marginTop:
                            '7px',
                          marginBottom:
                            0,
                          color:
                            '#c53030',
                          fontSize:
                            '12px',
                        }}
                      >
                        {lgasError}
                      </p>
                    )}

                    {selectedLga && (
                      <p
                        style={{
                          marginTop:
                            '6px',
                          marginBottom:
                            0,
                          color:
                            '#718096',
                          fontSize:
                            '12px',
                        }}
                      >
                        Code:{' '}
                        {selectedLga.code ??
                          '—'}
                      </p>
                    )}
                  </div>
                )}

                {/* Ward */}
                {geographyRequirements.ward && (
                  <div>
                    <label
                      htmlFor="wardId"
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#2d3748',
                        marginBottom: '7px',
                      }}
                    >
                      Ward
                      <span
                        style={{
                          color: '#c53030',
                          marginLeft: '3px',
                        }}
                      >
                        *
                      </span>
                    </label>

                    <select
                      id="wardId"
                      name="wardId"
                      value={form.wardId}
                      onChange={
                        handleFieldChange
                      }
                      disabled={
                        isSubmitting ||
                        !form.lgaId ||
                        loadingWards
                      }
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding:
                          '9px 12px',
                        border:
                          '1px solid #cbd5e0',
                        borderRadius: '7px',
                        background:
                          '#ffffff',
                        color:
                          '#1a202c',
                        fontSize:
                          '14px',
                      }}
                    >
                      <option value="">
                        {!form.lgaId
                          ? 'Select LGA first'
                          : loadingWards
                            ? 'Loading Wards...'
                            : 'Select Ward'}
                      </option>

                      {wards.map(
                        (ward) => (
                          <option
                            key={ward.id}
                            value={ward.id}
                          >
                            {
                              formatGeographyName(
                                ward.name,
                              )
                            }
                          </option>
                        ),
                      )}
                    </select>

                    {wardsError && (
                      <p
                        style={{
                          marginTop:
                            '7px',
                          marginBottom:
                            0,
                          color:
                            '#c53030',
                          fontSize:
                            '12px',
                        }}
                      >
                        {wardsError}
                      </p>
                    )}

                    {selectedWard && (
                      <p
                        style={{
                          marginTop:
                            '6px',
                          marginBottom:
                            0,
                          color:
                            '#718096',
                          fontSize:
                            '12px',
                        }}
                      >
                        Code:{' '}
                        {selectedWard.code ??
                          '—'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Submit Error */}
          {submitError && (
            <div
              role="alert"
              style={{
                marginTop: '28px',
                padding: '13px 15px',
                borderRadius: '7px',
                background: '#fff5f5',
                border:
                  '1px solid #feb2b2',
                color: '#c53030',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '22px',
              borderTop:
                '1px solid #edf2f7',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                minHeight: '44px',
                padding:
                  '9px 18px',
                border:
                  '1px solid #cbd5e0',
                borderRadius: '7px',
                background: '#ffffff',
                color: '#2d3748',
                cursor:
                  isSubmitting
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                minHeight: '44px',
                padding:
                  '9px 20px',
                border:
                  '1px solid #2b6cb0',
                borderRadius: '7px',
                background: isSubmitting
                  ? '#90cdf4'
                  : '#2b6cb0',
                color: '#ffffff',
                cursor:
                  isSubmitting
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {isSubmitting
                ? 'Creating...'
                : 'Create Electoral Scope'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
