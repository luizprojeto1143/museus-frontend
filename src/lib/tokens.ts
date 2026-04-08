/**
 * Design System Tokens — Cultura Viva
 *
 * TypeScript mirror of the CSS custom properties defined in styles.css.
 * Use these constants anywhere you need programmatic access to design tokens:
 * - Inline styles
 * - Canvas/WebGL rendering
 * - Chart colors (Recharts, D3, etc.)
 * - Dynamic theming logic
 *
 * For Tailwind arbitrary values: bg-[var(--accent-primary)] is preferred.
 * For JS logic: use `tokens.color.gold[400]` etc.
 */

export const tokens = {
  color: {
    gold: {
      100: "#fefcf5",
      200: "#f9eac3",
      300: "#e6c86a",
      400: "#d4af37", // Base Gold — accent-primary
      500: "#b8941f",
      600: "#8a6d12",
      700: "#5c4808",
    },
    bronze: {
      300: "#e3bba3",
      400: "#cd7f32", // Base Bronze — accent-secondary
      500: "#a05a18",
    },
    neutral: {
      50:  "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0f0a06", // Deepest black/brown — bg-page
    },
    status: {
      success: "#22c55e",
      error:   "#ef4444",
      warning: "#f59e0b",
      info:    "#3b82f6",
    },
  },

  background: {
    page:          "#0f0a06",
    surface:       "#1a1108",
    surfaceHover:  "#2a1810",
    surfaceActive: "#3a2818",
    overlay:       "rgba(15, 10, 6, 0.85)",
    glass:         "rgba(26, 17, 8, 0.4)",
  },

  foreground: {
    main:      "#f5e6d3",
    secondary: "#d2c09a",
    tertiary:  "#a89070",
    inverse:   "#0f0a06",
  },

  border: {
    subtle:  "rgba(212, 175, 55, 0.15)",
    default: "rgba(212, 175, 55, 0.25)",
    strong:  "rgba(139, 115, 85, 0.5)",
    focus:   "#d4af37",
  },

  font: {
    heading: "Georgia, 'Times New Roman', serif",
    body:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono:    "'DM Mono', 'Courier New', monospace",
    display: "'Bodoni Moda', Georgia, serif",
    ui:      "'Syne', system-ui, sans-serif",
  },

  fontSize: {
    xs:   "0.75rem",  // 12px
    sm:   "0.875rem", // 14px
    base: "1rem",     // 16px
    lg:   "1.125rem", // 18px
    xl:   "1.25rem",  // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem",// 30px
    "4xl": "2.25rem", // 36px
  },

  space: {
    1:  "0.25rem",  // 4px
    2:  "0.5rem",   // 8px
    3:  "0.75rem",  // 12px
    4:  "1rem",     // 16px
    6:  "1.5rem",   // 24px
    8:  "2rem",     // 32px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
    24: "6rem",     // 96px
  },

  radius: {
    sm:   "12px",
    md:   "18px",
    lg:   "28px",
    xl:   "40px",
    "2xl": "56px",
    full: "9999px",
  },

  shadow: {
    sm:      "0 2px 4px rgba(0, 0, 0, 0.1)",
    md:      "0 12px 24px -10px rgba(0, 0, 0, 0.3)",
    lg:      "0 24px 48px -12px rgba(0, 0, 0, 0.5)",
    xl:      "0 40px 80px -20px rgba(0, 0, 0, 0.7)",
    glow:    "0 0 30px rgba(212, 175, 55, 0.2)",
    premium: "0 32px 64px -16px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
  },

  transition: {
    fast:    "all 0.15s ease",
    base:    "all 0.3s ease",
    smooth:  "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
    fluid:   "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
    spring:  "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /** Z-index scale */
  z: {
    base:    0,
    raised:  10,
    dropdown: 100,
    sticky:  200,
    overlay: 300,
    modal:   400,
    toast:   500,
    tooltip: 600,
  },
} as const;

/** Type helper — infer the value types from the tokens object */
export type Tokens = typeof tokens;
export type ColorToken = typeof tokens.color.gold[keyof typeof tokens.color.gold];

/** Pre-built gradient strings */
export const gradients = {
  goldHorizontal: `linear-gradient(90deg, ${tokens.color.gold[400]}, ${tokens.color.gold[300]})`,
  goldDiagonal:   `linear-gradient(135deg, ${tokens.color.gold[400]}, ${tokens.color.bronze[400]})`,
  darkSurface:    `linear-gradient(135deg, rgba(255,255,255,0.03), transparent)`,
  glassSurface:   `linear-gradient(135deg, rgba(255,255,255,0.05), transparent 60%)`,
  premiumDark:    `linear-gradient(180deg, ${tokens.background.surface}, ${tokens.background.page})`,
} as const;

/** Commonly used CSS variable references (for inline styles via var()) */
export const cssVar = {
  accentPrimary:    "var(--accent-primary)",
  accentSecondary:  "var(--accent-secondary)",
  bgPage:           "var(--bg-page)",
  bgSurface:        "var(--bg-surface)",
  fgMain:           "var(--fg-main)",
  fgSecondary:      "var(--fg-secondary)",
  borderSubtle:     "var(--border-subtle)",
  borderDefault:    "var(--border-default)",
  shadowGlow:       "var(--shadow-glow)",
  shadowPremium:    "var(--shadow-premium)",
  radiusMd:         "var(--radius-md)",
  radiusLg:         "var(--radius-lg)",
} as const;
