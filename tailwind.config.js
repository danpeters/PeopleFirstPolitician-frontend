/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\tailwind.config.js
 * 
 * Purpose:
 * - Configures Tailwind CSS for the frontend application
 * - Defines custom colors, themes, and design tokens
 * 
 * Security Notes:
 * - Content paths restrict Tailwind to only used files
 * - Prevents unused CSS from being bundled (reduces attack surface)
 * - Custom colors follow accessibility guidelines
 * 
 * Best Practices:
 * - Uses dark mode support (optional)
 * - Extends default theme rather than overriding
 * - Maintains consistent design system
 * 
 * @type {import('tailwindcss').Config}
 * ============================================================
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content paths - only scan these directories for Tailwind classes
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Theme configuration
  theme: {
    extend: {
      // Custom color palette
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Danger/error colors
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Success colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Warning colors
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom font sizes
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  
  // Plugins
  plugins: [],
};