'use client';

import React, { useState } from 'react';
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
}

interface ElectionPositionResponse {
  item?: ElectionPosition;
}

export default function NewElectionPositionPage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] =
    useState('');

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    const trimmedDescription =
      description.trim();

    setError('');

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

      const response =
        await apiClient.post<
          ElectionPositionResponse | ElectionPosition
        >(
          `/organisations/${DEVELOPMENT_ORGANISATION_ID}/election-positions`,
          {
            code: trimmedCode,
            name: trimmedName,
            description:
              trimmedDescription || undefined,
          },
        );

      const responseData =
        response.data;

      const createdPosition =
        'item' in responseData &&
        responseData.item
          ? responseData.item
          : responseData as ElectionPosition;

      if (!createdPosition?.id) {
        throw new Error(
            'The election position was created, but its ID was not returned by the server.',
        );
        }

        sessionStorage.setItem(
        'electionPositionCreated',
        '1',
        );

        router.push(
        `/election-positions/${createdPosition.id}`,
        );
    } catch (requestError: any) {
      console.error(
        'Failed to create election position:',
        requestError,
      );

      const responseMessage =
        requestError?.response?.data
          ?.message;

      const message =
        responseMessage ??
        requestError?.message ??
        'Failed to create election position. Please try again.';

      setError(
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
        padding: '32px',
        background: '#f7fafc',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
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
              Add Election Position
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#718096',
              }}
            >
              Create a new electoral position
              within the current organisation.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/election-positions',
              )
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
            ← Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#ffffff',
            border:
              '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '28px',
            boxShadow:
              '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
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
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginBottom: '22px',
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
              placeholder="e.g. GOV"
              autoComplete="off"
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
              Position codes must be unique.
            </div>
          </div>

          <div
            style={{
              marginBottom: '22px',
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
              placeholder="e.g. Governor"
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
              marginBottom: '28px',
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
              rows={6}
              placeholder="Enter a description of this electoral position..."
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
              onClick={() =>
                router.push(
                  '/election-positions',
                )
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
                ? 'Creating...'
                : 'Create Election Position'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}