// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\geography\page.tsx

/**
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\geography\page.tsx
 *
 * Purpose:
 * - Geography management and viewing page.
 * - Provides a compact cascading geographical selection interface.
 *
 * Current responsibilities:
 * - Retrieve Nigerian States.
 * - Retrieve LGAs when a State is selected.
 * - Retrieve Wards when an LGA is selected.
 * - Retrieve Polling Units when a Ward is selected.
 *
 * Geography hierarchy:
 * - State
 * - LGA
 * - Ward
 * - Polling Unit
 */

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface State {
  id: string;
  name: string;
  code: string | null;
}

interface Lga {
  id: string;
  name: string;
  code: string | null;
  stateId: string;
}

interface Ward {
  id: string;
  name: string;
  code: string | null;
  lgaId: string;
}

interface PollingUnit {
  id: string;
  name: string;
  code: string | null;
  wardId: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Format geographical names for display.
 *
 * Examples:
 * - "adamawa" -> "Adamawa"
 * - "cross river" -> "Cross River"
 * - "fct" -> "FCT"
 */
// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\geography\page.tsx

// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\geography\page.tsx

// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\geography\page.tsx

// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\geography\page.tsx

const formatGeographyName = (name: string) => {
  if (!name) {
    return '';
  }

  /**
   * Convert common source-data Roman numeral variations
   * to the correct Roman numerals.
   *
   * Examples:
   * - li   -> II
   * - lii  -> III
   * - liii -> IV
   * - liv  -> V
   */
  const romanNumeralCorrections: Record<string, string> = {
    liii: 'IV',
    lii: 'III',
    liv: 'V',
    li: 'II',
    l: 'I',
  };

  let formattedName = name.toLowerCase();

  /**
   * Correct Roman numerals even when they are immediately
   * followed by punctuation such as "/" or ".".
   */
  formattedName = formattedName.replace(
    /\b(liii|lii|liv|li|l)(?=\b|[\/.,])/g,
    (match) => romanNumeralCorrections[match],
  );

  /**
   * FCT should always appear in uppercase.
   */
  if (formattedName.trim() === 'fct') {
    return 'FCT';
  }

  /**
   * Capitalise geographical names while preserving
   * Roman numerals and punctuation.
   */
  return formattedName
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      /**
       * Handle Roman numerals when punctuation follows them.
       *
       * Examples:
       * - ii/   -> II/
       * - iii/  -> III/
       * - iv/   -> IV/
       */
      const romanMatch = word.match(
        /^(i|ii|iii|iv|v)([\/.,].*)?$/i,
      );

      if (romanMatch) {
        return (
          romanMatch[1].toUpperCase() +
          (romanMatch[2] ?? '')
        );
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(' ');
};

export default function GeographyPage() {
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [pollingUnits, setPollingUnits] =
    useState<PollingUnit[]>([]);

  const [selectedState, setSelectedState] =
    useState<State | null>(null);

  const [selectedLga, setSelectedLga] =
    useState<Lga | null>(null);

  const [selectedWard, setSelectedWard] =
    useState<Ward | null>(null);

  const [loadingStates, setLoadingStates] =
    useState(true);

  const [loadingLgas, setLoadingLgas] =
    useState(false);

  const [loadingWards, setLoadingWards] =
    useState(false);

  const [loadingPollingUnits, setLoadingPollingUnits] =
    useState(false);

  const [error, setError] = useState('');
  const [lgaError, setLgaError] = useState('');
  const [wardError, setWardError] = useState('');
  const [pollingUnitError, setPollingUnitError] =
    useState('');

  /**
   * Load all States from the backend.
   */
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoadingStates(true);
        setError('');

        const response =
          await apiClient.get('/geography/states');

        setStates(response.data.data);
      } catch (err) {
        console.error('Failed to load states:', err);
        setError('Failed to load States.');
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  /**
   * Handle State selection.
   *
   * Selecting a State:
   * - Loads its LGAs.
   * - Clears the previous LGA, Ward and Polling Unit selections.
   */
  const handleStateSelect = async (
    stateId: string,
  ) => {
    const state =
      states.find((item) => item.id === stateId) ??
      null;

    setSelectedState(state);
    setSelectedLga(null);
    setSelectedWard(null);

    setLgas([]);
    setWards([]);
    setPollingUnits([]);

    setLgaError('');
    setWardError('');
    setPollingUnitError('');

    if (!state) {
      return;
    }

    try {
      setLoadingLgas(true);

      const response = await apiClient.get(
        `/geography/states/${state.id}/lgas`,
      );

      setLgas(response.data.data);
    } catch (err) {
      console.error('Failed to load LGAs:', err);
      setLgaError('Failed to load LGAs.');
    } finally {
      setLoadingLgas(false);
    }
  };

  /**
   * Handle LGA selection.
   *
   * Selecting an LGA:
   * - Loads its Wards.
   * - Clears the previous Ward and Polling Unit selections.
   */
  const handleLgaSelect = async (
    lgaId: string,
  ) => {
    const lga =
      lgas.find((item) => item.id === lgaId) ??
      null;

    setSelectedLga(lga);
    setSelectedWard(null);

    setWards([]);
    setPollingUnits([]);

    setWardError('');
    setPollingUnitError('');

    if (!lga) {
      return;
    }

    try {
      setLoadingWards(true);

      const response = await apiClient.get(
        `/geography/lgas/${lga.id}/wards`,
      );

      setWards(response.data.data);
    } catch (err) {
      console.error('Failed to load Wards:', err);
      setWardError('Failed to load Wards.');
    } finally {
      setLoadingWards(false);
    }
  };

  /**
   * Handle Ward selection.
   *
   * Selecting a Ward:
   * - Loads only the Polling Units belonging to that Ward.
   */
  const handleWardSelect = async (
    wardId: string,
  ) => {
    const ward =
      wards.find((item) => item.id === wardId) ??
      null;

    setSelectedWard(ward);
    setPollingUnits([]);
    setPollingUnitError('');

    if (!ward) {
      return;
    }

    try {
      setLoadingPollingUnits(true);

      const response = await apiClient.get(
        `/geography/wards/${ward.id}/polling-units`,
      );

      setPollingUnits(response.data.data);
    } catch (err) {
      console.error(
        'Failed to load Polling Units:',
        err,
      );

      setPollingUnitError(
        'Failed to load Polling Units.',
      );
    } finally {
      setLoadingPollingUnits(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'white',
          padding: '16px 32px',
          boxShadow:
            '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a202c',
            margin: 0,
          }}
        >
          Electoral Geography
        </h1>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* Introduction */}
        <section
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a202c',
              marginBottom: '8px',
            }}
          >
            Nigerian Electoral Geography
          </h2>

          <p
            style={{
              color: '#4a5568',
              margin: 0,
            }}
          >
            Select a State, LGA and Ward to
            view the corresponding Polling Units.
          </p>
        </section>

        {/* Cascading Selectors */}
        <section
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a202c',
              marginBottom: '20px',
            }}
          >
            Select Location
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* State */}
            <div>
              <label
                htmlFor="state"
                style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '8px',
                }}
              >
                State
              </label>

              <select
                id="state"
                value={selectedState?.id ?? ''}
                onChange={(event) =>
                  handleStateSelect(
                    event.target.value,
                  )
                }
                disabled={loadingStates}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#2d3748',
                  fontSize: '15px',
                }}
              >
                <option value="">
                  {loadingStates
                    ? 'Loading States...'
                    : 'Select State'}
                </option>

                {states.map((state) => (
                  <option
                    key={state.id}
                    value={state.id}
                  >
                    {formatGeographyName(
                      state.name,
                    )}
                  </option>
                ))}
              </select>

              {error && (
                <p
                  style={{
                    color: '#e53e3e',
                    fontSize: '13px',
                    marginTop: '6px',
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* LGA */}
            <div>
              <label
                htmlFor="lga"
                style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '8px',
                }}
              >
                Local Government Area
              </label>

              <select
                id="lga"
                value={selectedLga?.id ?? ''}
                onChange={(event) =>
                  handleLgaSelect(
                    event.target.value,
                  )
                }
                disabled={
                  !selectedState ||
                  loadingLgas
                }
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  background:
                    !selectedState
                      ? '#edf2f7'
                      : 'white',
                  color: '#2d3748',
                  fontSize: '15px',
                }}
              >
                <option value="">
                  {!selectedState
                    ? 'Select State first'
                    : loadingLgas
                      ? 'Loading LGAs...'
                      : 'Select LGA'}
                </option>

                {lgas.map((lga) => (
                  <option
                    key={lga.id}
                    value={lga.id}
                  >
                    {formatGeographyName(
                      lga.name,
                    )}
                  </option>
                ))}
              </select>

              {lgaError && (
                <p
                  style={{
                    color: '#e53e3e',
                    fontSize: '13px',
                    marginTop: '6px',
                  }}
                >
                  {lgaError}
                </p>
              )}
            </div>

            {/* Ward */}
            <div>
              <label
                htmlFor="ward"
                style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '8px',
                }}
              >
                Ward
              </label>

              <select
                id="ward"
                value={selectedWard?.id ?? ''}
                onChange={(event) =>
                  handleWardSelect(
                    event.target.value,
                  )
                }
                disabled={
                  !selectedLga ||
                  loadingWards
                }
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border:
                    '1px solid #cbd5e0',
                  borderRadius: '6px',
                  background:
                    !selectedLga
                      ? '#edf2f7'
                      : 'white',
                  color: '#2d3748',
                  fontSize: '15px',
                }}
              >
                <option value="">
                  {!selectedLga
                    ? 'Select LGA first'
                    : loadingWards
                      ? 'Loading Wards...'
                      : 'Select Ward'}
                </option>

                {wards.map((ward) => (
                  <option
                    key={ward.id}
                    value={ward.id}
                  >
                    {formatGeographyName(
                      ward.name,
                    )}
                  </option>
                ))}
              </select>

              {wardError && (
                <p
                  style={{
                    color: '#e53e3e',
                    fontSize: '13px',
                    marginTop: '6px',
                  }}
                >
                  {wardError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Selected Location */}
        {(selectedState ||
          selectedLga ||
          selectedWard) && (
          <section
            style={{
              background: 'white',
              padding: '20px 24px',
              borderRadius: '8px',
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#718096',
                marginBottom: '8px',
              }}
            >
              SELECTED LOCATION
            </div>

            <div
              style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#2d3748',
              }}
            >
              {selectedState
                ? formatGeographyName(
                    selectedState.name,
                  )
                : 'State'}

              <span
                style={{
                  margin: '0 8px',
                  color: '#a0aec0',
                }}
              >
                →
              </span>

              {selectedLga
                ? formatGeographyName(
                    selectedLga.name,
                  )
                : 'LGA'}

              <span
                style={{
                  margin: '0 8px',
                  color: '#a0aec0',
                }}
              >
                →
              </span>

              {selectedWard
                ? formatGeographyName(
                    selectedWard.name,
                  )
                : 'Ward'}
            </div>
          </section>
        )}

        {/* Polling Units */}
        {selectedWard && (
          <section
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a202c',
                    margin: 0,
                  }}
                >
                  Polling Units
                </h2>

                <p
                  style={{
                    color: '#4a5568',
                    margin:
                      '6px 0 0 0',
                  }}
                >
                  {formatGeographyName(
                    selectedWard.name,
                  )}
                </p>
              </div>

              {!loadingPollingUnits &&
                !pollingUnitError && (
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#2d3748',
                    }}
                  >
                    Total: {pollingUnits.length}
                  </div>
                )}
            </div>

            {loadingPollingUnits && (
              <p
                style={{
                  color: '#4a5568',
                }}
              >
                Loading Polling Units...
              </p>
            )}

            {pollingUnitError && (
              <p
                style={{
                  color: '#e53e3e',
                }}
              >
                {pollingUnitError}
              </p>
            )}

            {!loadingPollingUnits &&
              !pollingUnitError &&
              pollingUnits.length === 0 && (
                <p
                  style={{
                    color: '#718096',
                  }}
                >
                  No Polling Units found for this
                  Ward.
                </p>
              )}

            {!loadingPollingUnits &&
              !pollingUnitError &&
              pollingUnits.length > 0 && (
                <div
                  style={{
                    overflowX: 'auto',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse:
                        'collapse',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background:
                            '#f7fafc',
                        }}
                      >
                        <th
                          style={{
                            textAlign:
                              'left',
                            padding:
                              '12px',
                            borderBottom:
                              '1px solid #e2e8f0',
                            color:
                              '#2d3748',
                          }}
                        >
                          #
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
                              '#2d3748',
                          }}
                        >
                          Polling Unit
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
                              '#2d3748',
                          }}
                        >
                          Code
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
                              '#2d3748',
                          }}
                        >
                          Latitude
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
                              '#2d3748',
                          }}
                        >
                          Longitude
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pollingUnits.map(
                        (
                          pollingUnit,
                          index,
                        ) => (
                          <tr
                            key={
                              pollingUnit.id
                            }
                          >
                            <td
                              style={{
                                padding:
                                  '12px',
                                borderBottom:
                                  '1px solid #edf2f7',
                                color:
                                  '#718096',
                              }}
                            >
                              {index + 1}
                            </td>

                            <td
                              style={{
                                padding:
                                  '12px',
                                borderBottom:
                                  '1px solid #edf2f7',
                                color:
                                  '#2d3748',
                                fontWeight:
                                  '600',
                              }}
                            >
                              {formatGeographyName(pollingUnit.name)}
                            </td>

                            <td
                              style={{
                                padding:
                                  '12px',
                                borderBottom:
                                  '1px solid #edf2f7',
                                color:
                                  '#4a5568',
                              }}
                            >
                              {pollingUnit.code ??
                                'N/A'}
                            </td>

                            <td
                              style={{
                                padding:
                                  '12px',
                                borderBottom:
                                  '1px solid #edf2f7',
                                color:
                                  '#4a5568',
                              }}
                            >
                              {pollingUnit.latitude ??
                                'N/A'}
                            </td>

                            <td
                              style={{
                                padding:
                                  '12px',
                                borderBottom:
                                  '1px solid #edf2f7',
                                color:
                                  '#4a5568',
                              }}
                            >
                              {pollingUnit.longitude ??
                                'N/A'}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
          </section>
        )}
      </main>
    </div>
  );
}