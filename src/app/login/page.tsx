/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\login\page.tsx
 *
 * Purpose:
 * Professional login page for the People First Politician
 * frontend application.
 *
 * Features:
 * - Email and password authentication.
 * - Password visibility toggle.
 * - Optional Keep me logged in session persistence.
 * - Working Forgot Password link.
 * - Working Create Account link.
 * - Loading state during authentication.
 * - Authentication error display.
 * - Responsive desktop and mobile layout.
 *
 * Navigation:
 * - Forgot Password -> /forgot-password
 * - Create Account -> /register
 *
 * Security:
 * - Authentication is handled by AuthContext.
 * - No password is logged or persisted by this component.
 */

'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [rememberMe, setRememberMe] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  /**
   * Submit the login form.
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);

      router.push('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email address or password.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : String(message),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="login-page">

        {/* =====================================================
            LEFT BRANDING PANEL
        ====================================================== */}

        <section className="branding-panel">
          <div className="brand-content">

            <div className="brand-icon">
              PF
            </div>

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

        {/* =====================================================
            LOGIN PANEL
        ====================================================== */}

        <section className="login-panel">

          <div className="login-card">

            {/* Mobile branding */}
            <div className="mobile-brand">

              <div className="brand-icon small">
                PF
              </div>

              <span>
                People First Politician
              </span>

            </div>

            {/* Welcome heading */}
            <div className="welcome-section">

              <div className="welcome-badge">
                Welcome back
              </div>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Enter your credentials to
                continue to the platform.
              </p>

            </div>

            {/* =================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
              <div className="error-message">

                <span className="error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >

              {/* Email */}
              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* Password */}
              <div className="form-group">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  {/* =================================================
                      ACTUAL NEXT.JS LINK
                  ================================================== */}

                  <a
                    href="/forgot-password"
                    className="forgot-link"
                  >
                    Forgot password?
                  </a>

                </div>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.8 7.6 7.55 5 12 5s8.2 2.6 9.94 6.65a1 1 0 0 1 0 .7C20.2 16.4 16.45 19 12 19s-8.2-2.6-9.94-6.65Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c4.45 0 8.2 2.6 9.94 6.65a1 1 0 0 1 0 .7 10.96 10.96 0 0 1-4.05 4.7" />
                        <path d="M6.61 6.61A10.94 10.94 0 0 0 2.06 11.65a1 1 0 0 0 0 .7A10.96 10.96 0 0 0 12 19c1.36 0 2.66-.25 3.82-.7" />
                      </svg>
                    )}
                  </button>

                </div>

              </div>

              {/* Keep me logged in */}
              <div className="remember-me-row">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="remember-me-checkbox"
                  />

                  <span>
                    Keep me logged in
                  </span>
                </label>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >

                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                REGISTRATION LINK
            ================================================== */}

            <div className="register-section">

              <span>
                Don't have an account?
              </span>

              {/* =================================================
                  ACTUAL NEXT.JS LINK
              ================================================== */}

              <a
                href="/register"
                className="register-link"
              >
                Create an account
              </a>

            </div>

            {/* =================================================
                CANCEL / BACK TO HOME LINK
            ================================================== */}

            <div className="cancel-login">
              <a href="/">
                ← Back to Home
              </a>
            </div>

            {/* Footer */}
            <div className="login-footer">

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

      {/* =======================================================
          LOGIN PAGE STYLES
      ======================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #f4f7fb;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =====================================================
           BRANDING PANEL
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
            1px solid rgba(
              255,
              255,
              255,
              0.22
            );

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
          font-size: 22px;
          line-height: 1.5;
          margin: 0;

          color:
            rgba(255, 255, 255, 0.92);

          max-width: 450px;
        }

        .brand-divider {
          width: 80px;
          height: 4px;
          border-radius: 10px;

          background: #5bb6ff;

          margin: 32px 0;
        }

        .brand-description {
          font-size: 16px;
          line-height: 1.75;

          color:
            rgba(255, 255, 255, 0.72);

          max-width: 450px;
          margin-bottom: 32px;
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

          font-size: 14px;

          color:
            rgba(255, 255, 255, 0.84);
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

        /* =====================================================
           LOGIN PANEL
        ====================================================== */

        .login-panel {
          flex: 1;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 50px;
        }

        .login-card {
          width: 100%;
          max-width: 500px;

          background: white;

          border-radius: 22px;

          padding: 46px;

          box-shadow:
            0 25px 70px
            rgba(18, 40, 70, 0.10);

          border:
            1px solid #e7edf5;
        }

        .mobile-brand {
          display: none;
        }

        .welcome-badge {
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

        .welcome-section h2 {
          margin: 0;

          font-size: 31px;
          line-height: 1.2;

          letter-spacing: -0.8px;

          color: #10243e;
        }

        .welcome-section p {
          margin: 11px 0 30px;

          color: #718096;

          font-size: 15px;
          line-height: 1.6;
        }

        /* =====================================================
           ERROR
        ====================================================== */

        .error-message {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 12px 14px;

          margin-bottom: 22px;

          border-radius: 10px;

          background: #fff3f3;

          border:
            1px solid #ffd6d6;

          color: #b42318;

          font-size: 13px;
        }

        .error-icon {
          width: 20px;
          height: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #d92d20;
          color: white;

          font-size: 12px;
          font-weight: 800;

          flex-shrink: 0;
        }

        /* =====================================================
           FORM
        ====================================================== */

        .login-form {
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
          font-size: 13px;
          font-weight: 700;
          color: #27364a;
        }

        .password-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* =====================================================
           FORGOT PASSWORD
        ====================================================== */

        .forgot-link {
          display: inline-block;

          color: #1261a0 !important;

          font-size: 13px;
          font-weight: 700;

          text-decoration: none !important;

          cursor: pointer;

          transition:
            color 0.2s ease,
            text-decoration 0.2s ease;
        }

        .forgot-link:hover {
          color: #0b4f87 !important;

          text-decoration:
            underline !important;
        }

        .forgot-link:focus-visible {
          outline:
            3px solid
            rgba(18, 97, 160, 0.20);

          outline-offset: 3px;

          border-radius: 3px;
        }

        /* =====================================================
           INPUTS
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
            0 45px 0 44px;

          border:
            1px solid #d6dee9;

          border-radius: 11px;

          outline: none;

          font-size: 14px;

          color: #172b4d;

          background: #fbfcfe;

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

        /* =====================================================
           PASSWORD TOGGLE
        ====================================================== */

        .password-toggle {
          position: absolute;

          right: 12px;

          border: none;
          background: transparent;

          color: #7d8b9d;

          cursor: pointer;

          font-size: 17px;

          padding: 5px;

          z-index: 2;
        }

        .password-toggle:hover {
          color: #1261a0;
        }

        /* =====================================================
           LOGIN BUTTON
        ====================================================== */

        .remember-me-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin: 4px 0 20px;
        }

        .remember-me-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #52617a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
        }

        .remember-me-checkbox {
          width: 17px;
          height: 17px;
          margin: 0;
          accent-color: #1261a0;
          cursor: pointer;
        }

        .remember-me-label span {
          line-height: 1.3;
        }

        .login-button {
          height: 53px;

          margin-top: 4px;

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

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 12px;

          box-shadow:
            0 9px 20px
            rgba(18, 97, 160, 0.22);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 13px 26px
            rgba(18, 97, 160, 0.28);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .arrow {
          font-size: 20px;
          line-height: 1;
        }

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

        /* =====================================================
           REGISTER LINK
        ====================================================== */

        .register-section {
          display: flex;

          justify-content: center;
          align-items: center;

          gap: 6px;

          margin-top: 27px;

          font-size: 13px;

          color: #758397;
        }

        .register-link {
          display: inline-block;

          color: #1261a0 !important;

          font-size: 13px;
          font-weight: 700;

          text-decoration: none !important;

          cursor: pointer;

          transition:
            color 0.2s ease,
            text-decoration 0.2s ease;
        }

        .register-link:hover {
          color: #0b4f87 !important;

          text-decoration:
            underline !important;
        }

        .register-link:focus-visible {
          outline:
            3px solid
            rgba(18, 97, 160, 0.20);

          outline-offset: 3px;

          border-radius: 3px;
        }

        /* =====================================================
           CANCEL / BACK TO HOME
        ====================================================== */

        .cancel-login {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 22px;
        }

        .cancel-login a {
          color: #1261a0;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition:
            color 0.2s ease,
            text-decoration 0.2s ease;
        }

        .cancel-login a:hover {
          color: #0b4f87;
          text-decoration: underline;
        }

        .cancel-login a:focus-visible {
          outline:
            3px solid
            rgba(18, 97, 160, 0.20);
          outline-offset: 3px;
          border-radius: 3px;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .login-footer {
          display: flex;

          justify-content: center;
          align-items: center;

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

        /* =====================================================
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

          .login-panel {
            padding: 30px;
          }

          .login-card {
            padding: 36px;
          }

        }

        @media (max-width: 700px) {

          .login-page {
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

          .login-panel {
            min-height: auto;

            padding:
              25px 18px 40px;

            background: #f4f7fb;
          }

          .login-card {
            max-width: 520px;

            padding:
              30px 24px;

            border-radius: 18px;
          }

          .mobile-brand {
            display: flex;

            align-items: center;

            gap: 10px;

            color: #10243e;

            font-weight: 800;

            margin-bottom: 25px;
          }

          .brand-icon.small {
            width: 38px;
            height: 38px;

            margin: 0;

            border-radius: 10px;

            background: #1261a0;

            border: none;

            color: white;

            font-size: 13px;
          }

          .welcome-section h2 {
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

          .login-card {
            padding: 26px 20px;
          }

          .register-section {
            flex-direction: column;
            gap: 4px;
          }

          .login-footer {
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