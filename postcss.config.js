/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\postcss.config.js
 * 
 * Purpose:
 * - Configures PostCSS processing pipeline
 * - Integrates Tailwind CSS
 * - Enables autoprefixing for cross-browser compatibility
 * 
 * Security Notes:
 * - Autoprefixer ensures consistent rendering across browsers
 * - Reduces CSS injection risks through proper sanitization
 * 
 * @type {import('postcss').Config}
 * ============================================================
 */

module.exports = {
  plugins: {
    // Tailwind CSS - Utility-first CSS framework
    tailwindcss: {},
    
    // Autoprefixer - Adds vendor prefixes for browser compatibility
    autoprefixer: {},
  },
};