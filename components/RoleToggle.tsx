"use client";

type Role = "learner" | "tutor";

type RoleToggleProps = {
  value: Role;
  onChange(next: Role): void;
  disabled?: boolean;
};

const OPTIONS: Array<{ key: Role; title: string; hint: string }> = [
  { key: "learner", title: "Learner", hint: "Browse tutors & post requests" },
  { key: "tutor", title: "Tutor", hint: "Publish slots & get booked" },
];

export default function RoleToggle({ value, onChange, disabled }: RoleToggleProps) {
  return (
    <div className="role-toggle" role="radiogroup" aria-label="Select how you want to use Campus Help">
      {OPTIONS.map(option => {
        const isActive = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            className={`role-toggle__pill ${isActive ? "role-toggle__pill--active" : ""}`.trim()}
            onClick={() => onChange(option.key)}
            disabled={disabled || isActive}
            aria-pressed={isActive}
          >
            <span className="role-toggle__pill-title">{option.title}</span>
            <span className="role-toggle__pill-hint">{option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
