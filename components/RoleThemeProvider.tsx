"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Role = "learner" | "tutor";

type ProfileSummary = {
  id: string;
  full_name: string | null;
  program: string | null;
  year: string | null;
  courses: string[] | null;
  rate_cents: number | null;
  contact: string | null;
  preferred_role: Role;
};

type RoleThemeContextValue = {
  role: Role;
  profile: ProfileSummary | null;
  loading: boolean;
  switching: boolean;
  setRoleLocal(next: Role): void;
  refreshProfile(): Promise<void>;
  switchRole(next: Role): Promise<void>;
};

const RoleThemeContext = createContext<RoleThemeContextValue | undefined>(undefined);

function applyRoleTheme(role: Role) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.roleTheme = role;
}

export function RoleThemeProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("learner");
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setProfile(null);
        setRole("learner");
        applyRoleTheme("learner");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, program, year, courses, rate_cents, contact, preferred_role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      let profileRow = data;

      if (!profileRow) {
        const seed = {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? null,
          program: null as string | null,
          year: null as string | null,
          courses: null as string[] | null,
          rate_cents: null as number | null,
          contact: user.email ?? null,
          preferred_role: "learner" as Role,
        };

        const { data: created, error: createError } = await supabase
          .from("profiles")
          .upsert(seed, { onConflict: "id" })
          .select("id, full_name, program, year, courses, rate_cents, contact, preferred_role")
          .single();

        if (createError) throw createError;
        profileRow = created ?? {
          id: seed.id,
          full_name: seed.full_name,
          program: seed.program,
          year: seed.year,
          courses: seed.courses,
          rate_cents: seed.rate_cents,
          contact: seed.contact,
          preferred_role: seed.preferred_role,
        };
      }

      const preferredRole = profileRow?.preferred_role === "tutor" ? "tutor" : "learner";
      setProfile({
        id: profileRow.id,
        full_name: profileRow.full_name ?? null,
        program: profileRow.program ?? null,
        year: profileRow.year ?? null,
        courses: Array.isArray(profileRow.courses) ? profileRow.courses : null,
        rate_cents: profileRow.rate_cents ?? null,
        contact: profileRow.contact ?? null,
        preferred_role: preferredRole,
      });
      setRole(preferredRole);
    } catch (err) {
      console.error("Failed to refresh profile", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchRole = useCallback(
    async (next: Role) => {
      if (switching || role === next) return;
      setSwitching(true);
      const previous = role;
      setRole(next);
      applyRoleTheme(next);

      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const user = auth.user;
        if (!user) {
          throw new Error("You need to be signed in to switch modes.");
        }

        const directorySnapshot = profile ?? null;

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, preferred_role: next }, { onConflict: "id" });
        if (profileError) throw profileError;

        if (next === "tutor") {
          const canList = Boolean(directorySnapshot?.courses?.length && directorySnapshot?.contact);
          const { error: directoryError } = await supabase
            .from("public_profiles")
            .upsert(
              {
                id: user.id,
                full_name: directorySnapshot?.full_name ?? null,
                program: directorySnapshot?.program ?? null,
                year: directorySnapshot?.year ?? null,
                courses: directorySnapshot?.courses ?? null,
                rate_cents: directorySnapshot?.rate_cents ?? null,
                contact: directorySnapshot?.contact ?? null,
                is_listed: canList,
              },
              { onConflict: "id" }
            );
          if (directoryError) throw directoryError;
        } else {
          const { error: hideError } = await supabase
            .from("public_profiles")
            .update({ is_listed: false })
            .eq("id", user.id);
          if (hideError) throw hideError;
        }

        setProfile(prev =>
          prev
            ? { ...prev, preferred_role: next }
            : {
                id: user.id,
                full_name: null,
                program: null,
                year: null,
                courses: null,
                rate_cents: null,
                contact: null,
                preferred_role: next,
              }
        );

        await refreshProfile();
      } catch (error) {
        console.error("Failed to switch role", error);
        setRole(previous);
        applyRoleTheme(previous);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Could not switch role");
      } finally {
        setSwitching(false);
      }
    },
    [profile, refreshProfile, role, switching]
  );

  useEffect(() => {
    applyRoleTheme(role);
  }, [role]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo<RoleThemeContextValue>(
    () => ({ role, profile, loading, switching, setRoleLocal: setRole, refreshProfile, switchRole }),
    [role, profile, loading, switching, refreshProfile, switchRole]
  );

  return <RoleThemeContext.Provider value={value}>{children}</RoleThemeContext.Provider>;
}

export function useRoleTheme() {
  const context = useContext(RoleThemeContext);
  if (!context) {
    throw new Error("useRoleTheme must be used within RoleThemeProvider");
  }
  return context;
}
