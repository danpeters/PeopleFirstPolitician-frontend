/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\forgot-password\page.tsx
 *
 * Purpose:
 * Professional password-recovery page for the
 * People First Politician frontend application.
 *
 * Responsibilities:
 * - Collect the user's email address.
 * - Submit a password-reset request to the backend.
 * - Display a generic success message without revealing
 *   whether an email address exists.
 * - Display validation/API errors.
 * - Provide a working link back to the login page.
 * - Maintain visual consistency with the main login page.
 *
 * Security:
 * - The page does not reveal whether an email exists.
 * - The backend remains responsible for password-reset
 *   token generation and validation.
 */

'use client';

import {
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';

import { apiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * ============================================================
   * SUBMIT PASSWORD-RESET REQUEST
   * ============================================================
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage('');
    setErrorMessage('');

    const normalisedEmail =
      email.trim().toLowerCase();

    /**
     * Basic client-side validation.
     */
    if (!normalisedEmail) {
      setErrorMessage(
        'Please enter your email address.',
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await apiClient.post(
          '/auth/forgot-password',
          {
            email: normalisedEmail,
          },
        );

      /**
       * The backend deliberately returns a generic
       * response so that the existence of an account
       * cannot be discovered from this page.
       */
      setMessage(
        response.data?.message ||
          'If an account is associated with this email address, password-reset instructions have been sent.',
      );

      /**
       * Clear the email after a successful request.
       */
      setEmail('');
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message;

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage ||
              error?.message ||
              'Unable to process the password-reset request. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="forgot-page">

        {/* ======================================================
            LEFT BRANDING PANEL
            ====================================================== */}

        <section className="branding-panel">

          <div className="brand-content">

            {/* Brand icon */}
            <div className="brand-icon">
              PF
            </div>

            {/* Brand name */}
            <h1>
              People First
              <br />
              Politician
            </h1>

            <p className="brand-tagline">
              Putting citizens at the centre
              of democratic leadership.
            </p>

            <div className="brand-divider" />

            <p className="brand-description">
              A transparent platform for
              understanding political leadership,
              electoral geography and citizen
              engagement.
            </p>

            {/* Brand features */}
            <div className="brand-features">

              <div className="feature">
                <span className="feature-icon">
                  ✓
                </span>

                <span>
                  Transparent information
                </span>
              </div>

              <div className="feature">
                <span className="feature-icon">
                  ✓
                </span>

                <span>
                  Citizen-focused insights
                </span>
              </div>

              <div className="feature">
                <span className="feature-icon">
                  ✓
                </span>

                <span>
                  Secure platform access
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            PASSWORD-RECOVERY PANEL
            ====================================================== */}

        <section className="recovery-panel">

          <div className="recovery-card">

            {/* Mobile brand */}
            <div className="mobile-brand">

              <div className="mobile-brand-icon">
                PF
              </div>

              <span>
                People First Politician
              </span>

            </div>

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="recovery-header">

              <div className="recovery-badge">
                Password recovery
              </div>

              <h2>
                Forgot your password?
              </h2>

              <p>
                Enter the email address associated
                with your account and we will send
                you instructions to reset your
                password.
              </p>

            </div>

            {/* ==================================================
                SUCCESS MESSAGE
                ================================================== */}

            {message && (
              <div
                role="status"
                className="success-message"
              >
                <span className="message-icon">
                  ✓
                </span>

                <span>
                  {message}
                </span>
              </div>
            )}

            {/* ==================================================
                ERROR MESSAGE
                ================================================== */}

            {errorMessage && (
              <div
                role="alert"
                className="error-message"
              >
                <span className="error-icon">
                  !
                </span>

                <span>
                  {errorMessage}
                </span>
              </div>
            )}

            {/* ==================================================
                FORM
                ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="recovery-form"
            >

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <span
                    className="input-icon"
                    aria-hidden="true"
                  >
                    ✉
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                className="reset-button"
                disabled={isSubmitting}
              >

                {isSubmitting ? (
                  <>
                    <span className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset instructions
                    <span className="arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* ==================================================
                BACK TO LOGIN
                ================================================== */}

            <div className="back-section">

              <Link
                href="/login"
                className="back-link"
              >
                <span className="back-arrow">
                  ←
                </span>

                Back to sign in
              </Link>

            </div>

            {/* ==================================================
                FOOTER
                ================================================== */}

            <div className="recovery-footer">

              <span>
                © {new Date().getFullYear()}
                {' '}
                People First Politician
              </span>

              <span className="footer-dot">
                •
              </span>

              <span>
                Secure access
              </span>

            </div>

          </div>

        </section>

      </div>

      {/* ========================================================
          PAGE STYLES
          ======================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        /* ======================================================
           PAGE
           ====================================================== */

        .forgot-page {
          min-height: 100vh;

          display: flex;

          background: #f4f7fb;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Helvetica,
            Arial,
            sans-serif;
        }

        /* ======================================================
           LEFT BRANDING PANEL
           ====================================================== */

        .branding-panel {
          width: 48%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 60px;

          color: white;

          background:
            linear-gradient(
              145deg,
              #071a36 0%,
              #0b2d59 48%,
              #1261a0 100%
            );

          position: relative;
          overflow: hidden;
        }

        .branding-panel::before {
          content: "";

          position: absolute;

          width: 500px;
          height: 500px;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.04);

          top: -180px;
          right: -160px;
        }

        .branding-panel::after {
          content: "";

          position: absolute;

          width: 350px;
          height: 350px;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.035);

          bottom: -160px;
          left: -130px;
        }

        .brand-content {
          width: 100%;
          max-width: 520px;

          position: relative;
          z-index: 2;
        }

        .brand-icon {
          width: 68px;
          height: 68px;

          border-radius: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(255, 255, 255, 0.14);

          border:
            1px solid
            rgba(255, 255, 255, 0.22);

          font-size: 23px;
          font-weight: 800;

          letter-spacing: -1px;

          margin-bottom: 28px;

          box-shadow:
            0 12px 30px
            rgba(0, 0, 0, 0.15);
        }

        .brand-content h1 {
          font-size:
            clamp(42px, 4vw, 64px);

          line-height: 1.04;

          letter-spacing: -2px;

          margin: 0 0 24px;

          font-weight: 800;
        }

        .brand-tagline {
          max-width: 450px;

          margin: 0;

          color:
            rgba(255, 255, 255, 0.92);

          font-size: 22px;

          line-height: 1.5;
        }

        .brand-divider {
          width: 80px;
          height: 4px;

          border-radius: 10px;

          background: #5bb6ff;

          margin: 32px 0;
        }

        .brand-description {
          max-width: 450px;

          margin-bottom: 32px;

          color:
            rgba(255, 255, 255, 0.72);

          font-size: 16px;

          line-height: 1.75;
        }

        .brand-features {
          display: flex;

          flex-direction: column;

          gap: 14px;
        }

        .feature {
          display: flex;

          align-items: center;

          gap: 12px;

          color:
            rgba(255, 255, 255, 0.84);

          font-size: 14px;
        }

        .feature-icon {
          width: 23px;
          height: 23px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.12);

          color: #8bd2ff;

          font-size: 12px;

          font-weight: 800;
        }

        /* ======================================================
           RECOVERY PANEL
           ====================================================== */

        .recovery-panel {
          flex: 1;
          min-height: 100vh;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 50px;
        }

        .recovery-card {
          width: 100%;
          max-width: 500px;

          padding: 46px;

          background: white;

          border:
            1px solid #e7edf5;

          border-radius: 22px;

          box-shadow:
            0 25px 70px
            rgba(18, 40, 70, 0.10);
        }

        /* ======================================================
           MOBILE BRAND
           ====================================================== */

        .mobile-brand {
          display: none;
        }

        /* ======================================================
           HEADER
           ====================================================== */

        .recovery-badge {
          display: inline-flex;

          padding: 7px 12px;

          border-radius: 30px;

          background: #edf6ff;

          color: #1261a0;

          font-size: 12px;

          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: 0.8px;

          margin-bottom: 14px;
        }

        .recovery-header h2 {
          margin: 0;

          color: #10243e;

          font-size: 31px;

          line-height: 1.2;

          letter-spacing: -0.8px;
        }

        .recovery-header p {
          margin: 12px 0 30px;

          color: #718096;

          font-size: 15px;

          line-height: 1.65;
        }

        /* ======================================================
           SUCCESS MESSAGE
           ====================================================== */

        .success-message {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 13px 14px;

          margin-bottom: 22px;

          border:
            1px solid #b7ebc6;

          border-radius: 10px;

          background: #f0fff4;

          color: #237a3b;

          font-size: 13px;

          line-height: 1.5;
        }

        .message-icon {
          width: 21px;
          height: 21px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background: #2f9e44;

          color: white;

          font-size: 12px;

          font-weight: 800;
        }

        /* ======================================================
           ERROR MESSAGE
           ====================================================== */

        .error-message {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 13px 14px;

          margin-bottom: 22px;

          border:
            1px solid #ffd6d6;

          border-radius: 10px;

          background: #fff3f3;

          color: #b42318;

          font-size: 13px;

          line-height: 1.5;
        }

        .error-icon {
          width: 21px;
          height: 21px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background: #d92d20;

          color: white;

          font-size: 12px;

          font-weight: 800;
        }

        /* ======================================================
           FORM
           ====================================================== */

        .recovery-form {
          display: flex;

          flex-direction: column;

          gap: 22px;
        }

        .form-group {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .form-group label {
          color: #27364a;

          font-size: 13px;

          font-weight: 700;
        }

        /* ======================================================
           INPUT
           ====================================================== */

        .input-wrapper {
          position: relative;

          display: flex;

          align-items: center;
        }

        .input-icon {
          position: absolute;

          left: 15px;

          color: #8a99aa;

          font-size: 16px;

          pointer-events: none;

          z-index: 2;
        }

        .input-wrapper input {
          width: 100%;
          height: 52px;

          padding:
            0 15px 0 44px;

          border:
            1px solid #d6dee9;

          border-radius: 11px;

          outline: none;

          background: #fbfcfe;

          color: #172b4d;

          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #a1adbb;
        }

        .input-wrapper input:hover {
          border-color: #b8c5d5;

          background: white;
        }

        .input-wrapper input:focus {
          border-color: #2185d0;

          background: white;

          box-shadow:
            0 0 0 4px
            rgba(33, 133, 208, 0.11);
        }

        .input-wrapper input:disabled {
          cursor: not-allowed;

          opacity: 0.65;
        }

        /* ======================================================
           RESET BUTTON
           ====================================================== */

        .reset-button {
          height: 53px;

          margin-top: 2px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 12px;

          border: none;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #1261a0,
              #1684d8
            );

          color: white;

          font-size: 15px;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 9px 20px
            rgba(18, 97, 160, 0.22);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }

        .reset-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 13px 26px
            rgba(18, 97, 160, 0.28);
        }

        .reset-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .reset-button:disabled {
          cursor: not-allowed;

          opacity: 0.7;
        }

        .arrow {
          font-size: 20px;

          line-height: 1;
        }

        /* ======================================================
           LOADING SPINNER
           ====================================================== */

        .spinner {
          width: 17px;
          height: 17px;

          border:
            2px solid
            rgba(255, 255, 255, 0.4);

          border-top-color: white;

          border-radius: 50%;

          animation:
            spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ======================================================
           BACK TO LOGIN
           ====================================================== */

        .back-section {
          display: flex;

          justify-content: center;

          margin-top: 27px;
        }

        .back-link {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          color: #1261a0;

          font-size: 13px;

          font-weight: 700;

          text-decoration: none;

          cursor: pointer;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .back-link:hover {
          color: #0b4f87;

          text-decoration: underline;
        }

        .back-link:focus-visible {
          outline:
            3px solid
            rgba(18, 97, 160, 0.20);

          outline-offset: 3px;

          border-radius: 3px;
        }

        .back-arrow {
          font-size: 17px;

          line-height: 1;
        }

        /* ======================================================
           FOOTER
           ====================================================== */

        .recovery-footer {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          margin-top: 34px;

          padding-top: 22px;

          border-top:
            1px solid #edf1f5;

          color: #a0acba;

          font-size: 11px;
        }

        .footer-dot {
          color: #c7d0da;
        }

        /* ======================================================
           RESPONSIVE DESIGN
           ====================================================== */

        @media (max-width: 900px) {

          .branding-panel {
            width: 42%;

            padding: 35px;
          }

          .brand-content h1 {
            font-size: 42px;
          }

          .brand-tagline {
            font-size: 18px;
          }

          .recovery-panel {
            padding: 30px;
          }

          .recovery-card {
            padding: 36px;
          }

        }

        @media (max-width: 700px) {

          .forgot-page {
            display: block;
          }

          .branding-panel {
            width: 100%;

            min-height: auto;

            padding:
              35px 25px;
          }

          .brand-content {
            max-width: 600px;
          }

          .brand-content h1 {
            font-size: 38px;
          }

          .brand-tagline {
            font-size: 17px;
          }

          .brand-description,
          .brand-features {
            display: none;
          }

          .brand-divider {
            margin: 22px 0;
          }

          .recovery-panel {
            min-height: auto;

            padding:
              25px 18px 40px;

            background: #f4f7fb;
          }

          .recovery-card {
            max-width: 520px;

            padding:
              30px 24px;

            border-radius: 18px;
          }

          .mobile-brand {
            display: flex;

            align-items: center;

            gap: 10px;

            margin-bottom: 25px;

            color: #10243e;

            font-weight: 800;
          }

          .mobile-brand-icon {
            width: 38px;
            height: 38px;

            display: flex;

            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background: #1261a0;

            color: white;

            font-size: 13px;

            font-weight: 800;
          }

          .recovery-header h2 {
            font-size: 27px;
          }

        }

        @media (max-width: 420px) {

          .branding-panel {
            padding: 28px 20px;
          }

          .brand-icon {
            width: 56px;
            height: 56px;

            margin-bottom: 20px;
          }

          .brand-content h1 {
            font-size: 34px;
          }

          .recovery-card {
            padding: 26px 20px;
          }

          .recovery-footer {
            flex-direction: column;

            gap: 4px;
          }

          .footer-dot {
            display: none;
          }

        }

      `}</style>
    </>
  );
}