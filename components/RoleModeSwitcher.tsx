"use client";

import { useState, type CSSProperties } from "react";
import { useRoleTheme } from "./RoleThemeProvider";

type Role = "learner" | "tutor";

export default function RoleModeSwitcher() {
  const { role, switchRole, switching, loading } = useRoleTheme();
  const [error, setError] = useState<string | null>(null);
  const activeIndex = role === "learner" ? 0 : 1;
  const trackStyle = { "--active-index": String(activeIndex) } as CSSProperties;

  async function select(next: Role) {
    if (next === role) return;
    setError(null);
    try {
      await switchRole(next);
    } catch (err) {
      console.error("Failed to switch role globally", err);
      const message = err instanceof Error ? err.message : "Please try again";
      setError(message);
    }
  }

  return (
    <div
      className="role-mode-switch"
      role="radiogroup"
      aria-label="Switch between learner and tutor modes"
      aria-busy={switching}
      title={error ?? undefined}
    >
      <span className="role-mode-switch__label">Mode</span>
  <div className="role-mode-switch__track" style={trackStyle}>
        <span className="role-mode-switch__indicator" aria-hidden />
        <button
          type="button"
          className="role-mode-switch__button"
          data-active={role === "learner"}
          onClick={() => select("learner")}
          disabled={loading || switching || role === "learner"}
          aria-pressed={role === "learner"}
        >
          Learner
        </button>
        <button
          type="button"
          className="role-mode-switch__button"
          data-active={role === "tutor"}
          onClick={() => select("tutor")}
          disabled={loading || switching || role === "tutor"}
          aria-pressed={role === "tutor"}
        >
          Tutor
        </button>
      </div>
      {error && (
        <span className="sr-only" aria-live="assertive">
          {error}
        </span>
      )}
    </div>
  );
}
