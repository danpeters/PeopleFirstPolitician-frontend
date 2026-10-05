/**

 * ============================================================

 * People First Politician

 * Electoral Scope Details Page

 * ============================================================

 *

 * File:

 * C:\Projects\PeopleFirstPolitician\frontend\src\app\election-scopes\\[id]\page.tsx

 *

 * Purpose:

 * - Displays the details of a single Electoral Scope.

 * - Retrieves the Electoral Scope from the authenticated backend.

 * - Displays the scope's geographical relationships.

 * - Provides navigation back to the Electoral Scopes list.

 * - Provides an Edit action for the selected scope.

 *

 * API:

 * - GET

 *   /api/v1/organisations/:organisationId/electoral-scopes/:id

 *

 * Security:

 * - Requests are made through the existing apiClient.

 * - apiClient supplies the authenticated access token.

 * - Backend authentication and permission checks remain

 *   authoritative.

 *

 * Organisation Context:

 * - The current implementation uses the development organisation

 *   configured in @/config/organisation.

 * - This is temporary development configuration.

 * - It should later be replaced with the authenticated user's

 *   active organisation context.

 *

 * Supported Electoral Scope Types:

 * - National

 * - State

 * - Local Government

 * - Ward

 *

 * Important:

 * - Frontend display logic does not replace backend validation.

 * - The Electoral Scope ID comes from the dynamic route.

 * - The organisation ID is controlled by application configuration.

 * ============================================================

 */


'use client';


import { useCallback, useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';


import apiClient from '@/lib/api-client';

import { DEVELOPMENT_ORGANISATION_ID } from '@/config/organisation';


/**

 * Represents the geographical reference returned by the API.

 *

 * The backend may return state, LGA or ward relationships

 * depending on the Electoral Scope type.

 */

interface GeographyReference {

  id: string;

  name: string;

  code?: string | null;

}


/**

 * Represents an Electoral Scope returned by the backend.

 */

interface ElectoralScope {

  id: string;

  scopeType:

    | 'national'

    | 'state'

    | 'local_government'

    | 'ward'

    | 'senatorial_district'

    | 'federal_constituency'

    | 'state_constituency'

    | 'polling_unit';


  name: string;

  code?: string | null;


  stateId?: string | null;

  lgaId?: string | null;

  wardId?: string | null;


  state?: GeographyReference | null;

  lga?: GeographyReference | null;

  ward?: GeographyReference | null;


  status: 'active' | 'inactive';


  createdAt: string;

  updatedAt: string;

}


/**

 * Formats the backend scope type into a user-friendly

 * presentation value.

 */

function formatScopeType(scopeType: ElectoralScope['scopeType']): string {

  const labels: Record<ElectoralScope['scopeType'], string> = {

    national: 'National',

    state: 'State',

    local_government: 'Local Government',

    ward: 'Ward',

    senatorial_district: 'Senatorial District',

    federal_constituency: 'Federal Constituency',

    state_constituency: 'State Constituency',

    polling_unit: 'Polling Unit',

  };


  return labels[scopeType] ?? scopeType;

}


/**

 * Formats the backend status into a user-friendly

 * presentation value.

 */

function formatStatus(status: ElectoralScope['status']): string {

  return status === 'active' ? 'Active' : 'Inactive';

}


/**

 * Formats geographical names for consistent presentation.

 *

 * The backend may contain geographical names using lowercase

 * text. The frontend presents these names in title case so

 * that values such as "abia" and "aba north" appear as

 * "Abia" and "Aba North".

 */

function formatGeographyName(

  value?: string | null,

): string {

  if (!value) {

    return '—';

  }


  return value

    .trim()

    .toLowerCase()

    .replace(/\b\w/g, (character) =>

      character.toUpperCase(),

    );

}


/**

 * Formats an ISO date returned by the backend.

 */

function formatDate(value?: string | null): string {

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

}


/**

 * Electoral Scope Details page.

 *

 * Responsibilities:

 * - Read the scope ID from the dynamic route.

 * - Retrieve the corresponding scope from the backend.

 * - Present the returned information.

 * - Handle loading, error and missing-record states.

 * - Provide navigation to edit and list views.

 */

export default function ElectoralScopeDetailsPage() {

  const router = useRouter();

  const params = useParams();


  /**

   * Dynamic route parameter.

   *

   * Next.js may return a string or an array for a dynamic

   * route parameter, so the value is normalised below.

   */

  const scopeId = Array.isArray(params?.id)

    ? params.id[0]

    : params?.id;


  const [scope, setScope] = useState<ElectoralScope | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  /**

   * Retrieves the selected Electoral Scope from the backend.

   */

  const fetchScope = useCallback(async () => {

    if (!scopeId) {

      setError('No Electoral Scope ID was provided.');

      setLoading(false);

      return;

    }


    try {

      setLoading(true);

      setError(null);


      const response = await apiClient.get(

        `/organisations/${DEVELOPMENT_ORGANISATION_ID}/electoral-scopes/${scopeId}`,

      );


      /**

       * The API client returns the application's standard

       * response wrapper.

       *

       * Support both the normal wrapped response and a

       * direct object response to make the page resilient

       * to backend response formatting.

       */

      const responseData = response.data?.data ?? response.data;


      setScope(responseData as ElectoralScope);

    } catch (err: any) {

      console.error('Failed to load Electoral Scope:', err);


      const message =

        err?.response?.data?.message ||

        err?.message ||

        'Unable to load the Electoral Scope.';


      setError(

        Array.isArray(message) ? message.join(', ') : String(message),

      );

    } finally {

      setLoading(false);

    }

  }, [scopeId]);


  /**

   * Load the Electoral Scope when the route ID becomes available.

   */

  useEffect(() => {

    void fetchScope();

  }, [fetchScope]);


  /**

   * Loading state.

   */

  if (loading) {

    return (

      <main

        style={{

          padding: '24px',

          maxWidth: '1100px',

          margin: '0 auto',

        }}

      >

        <div

          style={{

            padding: '32px',

            border: '1px solid #e5e7eb',

            borderRadius: '10px',

            background: '#ffffff',

            textAlign: 'center',

          }}

        >

          Loading Electoral Scope...

        </div>

      </main>

    );

  }


  /**

   * Error state.

   */

  if (error) {

    return (

      <main

        style={{

          padding: '24px',

          maxWidth: '1100px',

          margin: '0 auto',

        }}

      >

        <div

          style={{

            marginBottom: '20px',

          }}

        >

          <button

            type="button"

            onClick={() => router.push('/election-scopes')}

            style={{

              border: 'none',

              background: 'transparent',

              padding: 0,

              cursor: 'pointer',

              color: '#2563eb',

              fontSize: '14px',

            }}

          >

            ← Back to Electoral Scopes

          </button>

        </div>


        <div

          style={{

            padding: '24px',

            border: '1px solid #fecaca',

            borderRadius: '10px',

            background: '#fef2f2',

            color: '#991b1b',

          }}

        >

          <h1

            style={{

              marginTop: 0,

              marginBottom: '10px',

              fontSize: '20px',

            }}

          >

            Unable to Load Electoral Scope

          </h1>


          <p

            style={{

              margin: 0,

            }}

          >

            {error}

          </p>


          <button

            type="button"

            onClick={() => void fetchScope()}

            style={{

              marginTop: '18px',

              padding: '9px 14px',

              borderRadius: '6px',

              border: '1px solid #991b1b',

              background: '#ffffff',

              color: '#991b1b',

              cursor: 'pointer',

            }}

          >

            Try Again

          </button>

        </div>

      </main>

    );

  }


  /**

   * Missing-record state.

   *

   * This protects the UI in the unlikely event that the API

   * returns successfully without an Electoral Scope object.

   */

  if (!scope) {

    return (

      <main

        style={{

          padding: '24px',

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

          <h1

            style={{

              marginTop: 0,

              fontSize: '22px',

            }}

          >

            Electoral Scope Not Found

          </h1>


          <p>

            The requested Electoral Scope could not be found.

          </p>


          <button

            type="button"

            onClick={() => router.push('/election-scopes')}

            style={{

              padding: '9px 14px',

              borderRadius: '6px',

              border: '1px solid #d1d5db',

              background: '#ffffff',

              cursor: 'pointer',

            }}

          >

            Back to Electoral Scopes

          </button>

        </div>

      </main>

    );

  }


  /**

   * Main Electoral Scope details interface.

   */

  return (

    <main

      style={{

        padding: '24px',

        maxWidth: '1100px',

        margin: '0 auto',

      }}

    >

      {/* Page navigation and primary actions */}

      <div

        style={{

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          gap: '16px',

          flexWrap: 'wrap',

          marginBottom: '24px',

        }}

      >

        <button

          type="button"

          onClick={() => router.push('/election-scopes')}

          style={{

            border: 'none',

            background: 'transparent',

            padding: 0,

            cursor: 'pointer',

            color: '#2563eb',

            fontSize: '14px',

          }}

        >

          ← Back to Electoral Scopes

        </button>


        <button

          type="button"

          onClick={() =>

            router.push(`/election-scopes/${scope.id}/edit`)

          }

          style={{

            padding: '9px 16px',

            borderRadius: '6px',

            border: '1px solid #2563eb',

            background: '#2563eb',

            color: '#ffffff',

            cursor: 'pointer',

            fontWeight: 600,

          }}

        >

          Edit Electoral Scope

        </button>

      </div>


      {/* Page heading */}

      <section

        style={{

          marginBottom: '24px',

        }}

      >

        <h1

          style={{

            margin: 0,

            fontSize: '28px',

            fontWeight: 700,

          }}

        >

          {scope.name}

        </h1>


        <p

          style={{

            marginTop: '8px',

            marginBottom: 0,

            color: '#6b7280',

          }}

        >

          Electoral Scope Details

        </p>

      </section>


      {/* Basic scope information */}

      <section

        style={{

          marginBottom: '20px',

          padding: '24px',

          border: '1px solid #e5e7eb',

          borderRadius: '10px',

          background: '#ffffff',

        }}

      >

        <h2

          style={{

            marginTop: 0,

            marginBottom: '20px',

            fontSize: '19px',

          }}

        >

          Scope Information

        </h2>


        <div

          style={{

            display: 'grid',

            gridTemplateColumns:

              'repeat(auto-fit, minmax(220px, 1fr))',

            gap: '20px',

          }}

        >

          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Scope Name

            </div>


            <div

              style={{

                fontWeight: 600,

              }}

            >

              {scope.name}

            </div>

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Scope Type

            </div>


            <div

              style={{

                fontWeight: 600,

              }}

            >

              {formatScopeType(scope.scopeType)}

            </div>

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Scope Code

            </div>


            <div

              style={{

                fontWeight: 600,

              }}

            >

              {scope.code || '—'}

            </div>

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Status

            </div>


            <span

              style={{

                display: 'inline-block',

                padding: '4px 9px',

                borderRadius: '999px',

                fontSize: '12px',

                fontWeight: 600,

                background:

                  scope.status === 'active'

                    ? '#dcfce7'

                    : '#f3f4f6',

                color:

                  scope.status === 'active'

                    ? '#166534'

                    : '#4b5563',

              }}

            >

              {formatStatus(scope.status)}

            </span>

          </div>

        </div>

      </section>


      {/* Geographical relationships */}

      <section

        style={{

          marginBottom: '20px',

          padding: '24px',

          border: '1px solid #e5e7eb',

          borderRadius: '10px',

          background: '#ffffff',

        }}

      >

        <h2

          style={{

            marginTop: 0,

            marginBottom: '20px',

            fontSize: '19px',

          }}

        >

          Geographic Coverage

        </h2>


        <div

          style={{

            display: 'grid',

            gridTemplateColumns:

              'repeat(auto-fit, minmax(220px, 1fr))',

            gap: '20px',

          }}

        >

          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              State

            </div>


            <div

              style={{

                fontWeight: 600,

              }}

            >

              {formatGeographyName(scope.state?.name)}

            </div>


            {scope.state?.code && (

              <div

                style={{

                  marginTop: '3px',

                  fontSize: '12px',

                  color: '#6b7280',

                }}

              >

                Code: {scope.state.code}

              </div>

            )}

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Local Government Area

            </div>


            <div

              style={{

                fontWeight: 600,

              }}

            >

              {formatGeographyName(scope.lga?.name)}

            </div>


            {scope.lga?.code && (

              <div

                style={{

                  marginTop: '3px',

                  fontSize: '12px',

                  color: '#6b7280',

                }}

              >

                Code: {scope.lga.code}

              </div>

            )}

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Ward

            </div>


            <div

              style={{

                fontWeight: 600,

              }}

            >

              {formatGeographyName(scope.ward?.name)}

            </div>


            {scope.ward?.code && (

              <div

                style={{

                  marginTop: '3px',

                  fontSize: '12px',

                  color: '#6b7280',

                }}

              >

                Code: {scope.ward.code}

              </div>

            )}

          </div>

        </div>

      </section>


      {/* Record metadata */}

      <section

        style={{

          padding: '24px',

          border: '1px solid #e5e7eb',

          borderRadius: '10px',

          background: '#ffffff',

        }}

      >

        <h2

          style={{

            marginTop: 0,

            marginBottom: '20px',

            fontSize: '19px',

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

          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Scope ID

            </div>


            <div

              style={{

                fontSize: '13px',

                wordBreak: 'break-all',

              }}

            >

              {scope.id}

            </div>

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Created

            </div>


            <div>{formatDate(scope.createdAt)}</div>

          </div>


          <div>

            <div

              style={{

                fontSize: '12px',

                color: '#6b7280',

                marginBottom: '5px',

              }}

            >

              Last Updated

            </div>


            <div>{formatDate(scope.updatedAt)}</div>

          </div>

        </div>

      </section>

    </main>

  );

}
