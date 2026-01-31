"use client";

import { useState } from "react";
import { useRoleTheme } from "./RoleThemeProvider";

type Role = "learner" | "tutor";

export default function RoleModeSwitcher() {
  const { role, switchRole, switching, loading } = useRoleTheme();
  const [error, setError] = useState<string | null>(null);

  async function select(next: Role) {
    if (next === role || loading || switching) return;
    setError(null);
    try {
      await switchRole(next);
    } catch (err) {
      console.error("Failed to switch role", err);
      setError(err instanceof Error ? err.message : "Please try again");
    }
  }

  return (
    <div
      className="role-mode-switch"
      role="radiogroup"
      aria-label="Switch between learner and tutor modes"
      title={error ?? undefined}
    >
      <button
        type="button"
        className="role-mode-switch__button"
        data-active={role === "learner"}
        onClick={() => select("learner")}
        disabled={loading || switching}
        aria-pressed={role === "learner"}
      >
        Learner
      </button>
      <button
        type="button"
        className="role-mode-switch__button"
        data-active={role === "tutor"}
        onClick={() => select("tutor")}
        disabled={loading || switching}
        aria-pressed={role === "tutor"}
      >
        Tutor
      </button>
    </div>
  );
}
