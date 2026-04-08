import React from "react";

const spinnerKeyframes = `
@keyframes cv-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes cv-pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), 0 0 60px rgba(212, 175, 55, 0.1); }
  50%       { box-shadow: 0 0 40px rgba(212, 175, 55, 0.6), 0 0 80px rgba(212, 175, 55, 0.2); }
}
@keyframes cv-fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
`;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
    background: "var(--bg-page, #0f0a06)",
    flexDirection: "column",
    gap: "1.5rem",
    animation: "cv-fade-in 0.3s ease-out forwards",
  },
  spinnerWrapper: {
    position: "relative",
    width: "64px",
    height: "64px",
    animation: "cv-pulse-glow 2s ease-in-out infinite",
    borderRadius: "50%",
  },
  spinnerOuter: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "2px solid transparent",
    borderTopColor: "var(--accent-primary, #d4af37)",
    borderRightColor: "var(--accent-primary, #d4af37)",
    animation: "cv-spin 0.9s linear infinite",
  },
  spinnerInner: {
    position: "absolute",
    inset: "10px",
    borderRadius: "50%",
    border: "2px solid transparent",
    borderBottomColor: "rgba(212, 175, 55, 0.4)",
    borderLeftColor: "rgba(212, 175, 55, 0.4)",
    animation: "cv-spin 1.4s linear infinite reverse",
  },
  dot: {
    position: "absolute",
    inset: "50%",
    transform: "translate(-50%, -50%)",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--accent-primary, #d4af37)",
    boxShadow: "0 0 10px rgba(212, 175, 55, 0.8)",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "rgba(212, 175, 55, 0.5)",
    fontFamily: "var(--fm, 'DM Mono', monospace)",
  },
};

interface PageLoaderProps {
  /** Optional label below the spinner. Default: "Carregando" */
  label?: string;
  /** If true, shows inline (no full-screen overlay) */
  inline?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  label = "Carregando",
  inline = false,
}) => {
  return (
    <>
      <style>{spinnerKeyframes}</style>
      <div
        style={
          inline
            ? { ...styles.overlay, height: "200px", background: "transparent" }
            : styles.overlay
        }
        role="status"
        aria-label={label}
        aria-live="polite"
      >
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinnerOuter} />
          <div style={styles.spinnerInner} />
          <div style={styles.dot} />
        </div>
        <span style={styles.label} aria-hidden="true">
          {label}
        </span>
      </div>
    </>
  );
};

export default PageLoader;
