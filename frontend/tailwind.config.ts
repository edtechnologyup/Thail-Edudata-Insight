import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-dark": "var(--color-primary-dark)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-light": "var(--color-primary-light)",
        "surface-page": "#f7f9fb",
        "surface-card": "#ffffff",
        "surface-container": "#eceef0",
        "surface-navy": "#1a237e",
        "text-primary": "#191c1e",
        "text-secondary": "#3c4946",
        "text-muted": "#6c7a76",
        "border-default": "#e2e8f0",
        "border-input": "#bbcac5",
        "border-focus": "#006b5f",
        "border-sidebar": "#e5e7eb",
        "status-published": "#0f6e56",
        "status-published-bg": "#e1f5ee",
        "status-draft": "#1d4c61",
        "status-draft-bg": "#dbeafe",
        "status-error": "#93000a",
        "status-error-bg": "#ffdad6",
        "status-warning": "#795900",
        "status-warning-bg": "#ffefc9",
        "status-suspended": "#444441",
        "status-suspended-bg": "#d3d1c7",
      },
      fontFamily: {
        kanit: ["Kanit", "sans-serif"],
        sarabun: ["Sarabun", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "60px", fontWeight: "700" }],
        "heading-1": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "heading-2": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "heading-3": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "heading-3-mobile": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "18px", fontWeight: "400" }],
        code: ["13px", { lineHeight: "18px", fontWeight: "400" }],
      },
      spacing: {
        "spacing-1": "4px",
        "spacing-2": "8px",
        "spacing-3": "12px",
        "spacing-4": "16px",
        "spacing-6": "24px",
        "spacing-8": "32px",
        "spacing-10": "40px",
        "spacing-12": "48px",
        "container-max": "1280px",
      },
      borderRadius: {
        "radius-xs": "2px",
        "radius-sm": "4px",
        "radius-md": "8px",
        "radius-lg": "12px",
        "radius-xl": "16px",
        "radius-full": "9999px",
      },
      boxShadow: {
        "level-0": "none",
        "level-1": "0px 4px 12px rgba(26, 35, 126, 0.05)",
        "level-2": "0px 8px 24px rgba(26, 35, 126, 0.10)",
        "level-3": "0px 16px 48px rgba(26, 35, 126, 0.15)",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      keyframes: {
        "new-blink": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.94)" },
        },
      },
      animation: {
        "new-blink": "new-blink 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
