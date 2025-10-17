'use client';

import { useEffect, useMemo, useState } from 'react';
import RoleToggle from '../../components/RoleToggle';
import Toast from '../../components/Toast';
import { AvailabilitySlot, normalizeAvailabilitySlot } from '../../lib/availability';
import { supabase } from '../../lib/supabaseClient';
import { useRoleTheme } from '../../components/RoleThemeProvider';

type Role = 'learner' | 'tutor';

type FormState = {
  full_name: string;
  program: string;
  year: string;
  courses: string;
  rate_cents: string;
  contact: string;
};

type SlotDraft = {
  date: string;
  start: string;
  end: string;
  mode: 'online' | 'in-person';
  isEmergency: boolean;
};

const EMPTY_FORM: FormState = {
  full_name: '',
  program: '',
  year: '',
  courses: '',
  rate_cents: '',
  contact: '',
};

const EMPTY_SLOT: SlotDraft = {
  date: '',
  start: '',
  end: '',
  mode: 'online',
  isEmergency: false,
};

export default function Profile() {
  const { role, profile: profileSummary, loading: profileLoading, switching, switchRole, refreshProfile } = useRoleTheme();
  const userId = profileSummary?.id ?? null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotDraft, setSlotDraft] = useState<SlotDraft>(EMPTY_SLOT);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!profileSummary) return;
    setForm(prev => {
      const next: FormState = {
        full_name: profileSummary.full_name ?? '',
        program: profileSummary.program ?? '',
        year: profileSummary.year ?? '',
        courses: Array.isArray(profileSummary.courses) ? profileSummary.courses.join(', ') : profileSummary.courses ?? '',
        rate_cents: profileSummary.rate_cents != null ? String(profileSummary.rate_cents) : '',
        contact: profileSummary.contact ?? '',
      };
      const unchanged =
        prev.full_name === next.full_name &&
        prev.program === next.program &&
        prev.year === next.year &&
        prev.courses === next.courses &&
        prev.rate_cents === next.rate_cents &&
        prev.contact === next.contact;
      return unchanged ? prev : next;
    });
  }, [profileSummary]);

  useEffect(() => {
    if (!userId || role !== 'tutor') {
      setSlots([]);
      return;
    }
    void refreshSlots();
  }, [role, userId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const completeness = useMemo(() => {
    const fields = role === 'tutor'
      ? [form.full_name, form.program, form.year, form.courses, form.rate_cents, form.contact]
      : [form.full_name, form.program, form.year, form.contact];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [form.full_name, form.program, form.year, form.contact, form.courses, form.rate_cents, role]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  async function refreshSlots() {
    if (!userId) return;
    setSlotsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', userId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      const normalised = (data ?? [])
        .map(normalizeAvailabilitySlot)
        .filter(Boolean) as AvailabilitySlot[];
      setSlots(normalised);
    } catch (err) {
      console.error('Failed to load availability', err);
      showToast('Unable to load your availability', 'error');
    } finally {
      setSlotsLoading(false);
    }
  }

  async function syncTutorDirectory(courseList: string[] | null, rateCents: number | null) {
    if (!userId) return;
    const isListable = Boolean(courseList?.length && form.contact);
    const payload = {
      id: userId,
      full_name: form.full_name || null,
      program: form.program || null,
      year: form.year || null,
      courses: courseList,
      rate_cents: rateCents,
      contact: form.contact || null,
      is_listed: isListable,
    };
    await supabase.from('public_profiles').upsert(payload, { onConflict: 'id' });
  }

  async function handleSaveProfile() {
    if (!userId) return;
    setSavingProfile(true);
    const courseList = form.courses
      ? form.courses.split(',').map(value => value.trim()).filter(Boolean)
      : null;
    const rateCents = form.rate_cents ? Number(form.rate_cents) : null;
    const payload = {
      full_name: form.full_name || null,
      program: form.program || null,
      year: form.year || null,
      courses: courseList,
      rate_cents: rateCents,
      contact: form.contact || null,
      preferred_role: role,
    };

    try {
      const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
      if (error) throw error;
      if (role === 'tutor') {
        await syncTutorDirectory(courseList, rateCents);
      }
      await refreshProfile();
      showToast('Profile saved');
    } catch (err) {
      console.error('Failed to save profile', err);
      showToast('Failed to save profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRoleChange(next: Role) {
    if (!userId || next === role) return;
    setSwitchingRole(true);
    try {
      await switchRole(next);

      if (next === 'tutor') {
        const courseList = form.courses
          ? form.courses.split(',').map(value => value.trim()).filter(Boolean)
          : null;
        const rateCents = form.rate_cents ? Number(form.rate_cents) : null;
        await syncTutorDirectory(courseList, rateCents);
        await refreshSlots();
        showToast('Tutor mode enabled');
      } else {
        await supabase
          .from('public_profiles')
          .update({ is_listed: false })
          .eq('id', userId);
        setSlots([]);
        showToast('Switched to learner');
      }
    } catch (err) {
      console.error('Failed to switch role', err);
      const message = err instanceof Error ? err.message : 'Could not update role';
      showToast(message, 'error');
    } finally {
      setSwitchingRole(false);
    }
  }

  async function addSlot() {
    if (!userId) return;
    const { date, start, end, mode, isEmergency } = slotDraft;
    if (!date || !start || !end) {
      showToast('Fill in date and times first', 'error');
      return;
    }
    const startISO = new Date(`${date}T${start}`);
    const endISO = new Date(`${date}T${end}`);
    if (Number.isNaN(startISO.getTime()) || Number.isNaN(endISO.getTime())) {
      showToast('Invalid date or time', 'error');
      return;
    }
    if (endISO <= startISO) {
      showToast('End time must be after start time', 'error');
      return;
    }
    try {
      const { error } = await supabase.from('tutor_availability').insert({
        tutor_id: userId,
        start_time: startISO.toISOString(),
        end_time: endISO.toISOString(),
        mode,
        is_emergency: isEmergency,
      });
      if (error) throw error;
      setSlotDraft(EMPTY_SLOT);
      await refreshSlots();
      showToast('Availability added');
    } catch (err) {
      console.error('Failed to add slot', err);
      showToast('Unable to add that slot', 'error');
    }
  }

  async function removeSlot(slotId: string) {
    try {
      const { error } = await supabase.from('tutor_availability').delete().eq('id', slotId);
      if (error) throw error;
      await refreshSlots();
      showToast('Slot removed');
    } catch (err) {
      console.error('Failed to remove slot', err);
      showToast('Could not remove slot', 'error');
    }
  }

  const slotFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    []
  );

  const heroCopy = role === 'tutor'
    ? {
        title: 'Stand out in the tutor directory.',
        description: 'List courses, pricing, and availability so students can book you instantly.',
      }
    : {
        title: 'Get ready to request help.',
        description: 'Save your study details and contact so tutors can respond fast when you post.',
      };

  return (
    <div className="container space-y-10">
      <div className="mx-auto max-w-3xl space-y-6 rounded-[32px] border border-[var(--border)]/60 bg-[rgba(12,19,38,0.85)] p-8 shadow-[0_35px_120px_-70px_rgba(80,105,255,0.6)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="tag">Your profile</div>
            <h1 className="text-3xl font-semibold text-white">{heroCopy.title}</h1>
            <p className="text-sm text-white/60">{heroCopy.description}</p>
          </div>
          <RoleToggle value={role} onChange={handleRoleChange} disabled={switchingRole || switching || profileLoading} />
        </div>

        <div className="rounded-full border border-[var(--border)]/60 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
          {completeness || 0}% complete
        </div>

        <div className="grid gap-4">
          <input className="input" placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Program" value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} />
            <input className="input" placeholder="Year (e.g., 2)" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
          </div>
          {role === 'tutor' && (
            <textarea
              className="input h-32"
              placeholder="Courses you can help with (comma-separated)"
              value={form.courses}
              onChange={e => setForm({ ...form, courses: e.target.value })}
            />
          )}
          {role === 'tutor' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="input"
                placeholder="Hourly rate in cents (optional)"
                value={form.rate_cents}
                onChange={e => setForm({ ...form, rate_cents: e.target.value })}
              />
              <input
                className="input"
                placeholder="Contact (email, Telegram, etc.)"
                value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })}
              />
            </div>
          ) : (
            <input
              className="input"
              placeholder="Preferred contact (email, Telegram, etc.)"
              value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/40">
            {role === 'tutor'
              ? 'Keep your contact and course list up to date - when tutor mode is on we publish this to the directory.'
              : 'Learner mode keeps your details private - we only share them with tutors you book.'}
          </p>
          <button className="btn" onClick={handleSaveProfile} disabled={savingProfile || profileLoading}>
            {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </div>

      {role === 'tutor' && (
        <div className="mx-auto max-w-3xl space-y-6 rounded-[32px] border border-[var(--border)]/60 bg-[rgba(8,12,24,0.9)] p-8 shadow-[0_35px_120px_-80px_rgba(40,120,255,0.4)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="tag">Availability</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Publish the windows you can teach.</h2>
              <p className="text-sm text-white/60">Slots appear instantly on the home calendar and your tutor card.</p>
            </div>
            <button className="btn-ghost" onClick={refreshSlots} disabled={slotsLoading}>
              {slotsLoading ? 'Refreshing...' : 'Refresh slots'}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
            <div className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.05] p-5 space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/35">Add slot</div>
              <div className="grid gap-3">
                <input
                  type="date"
                  className="input"
                  value={slotDraft.date}
                  onChange={event => setSlotDraft({ ...slotDraft, date: event.target.value })}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="time"
                    className="input"
                    value={slotDraft.start}
                    onChange={event => setSlotDraft({ ...slotDraft, start: event.target.value })}
                  />
                  <input
                    type="time"
                    className="input"
                    value={slotDraft.end}
                    onChange={event => setSlotDraft({ ...slotDraft, end: event.target.value })}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    className="input"
                    value={slotDraft.mode}
                    onChange={event => setSlotDraft({ ...slotDraft, mode: event.target.value as SlotDraft['mode'] })}
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In person</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={slotDraft.isEmergency}
                      onChange={event => setSlotDraft({ ...slotDraft, isEmergency: event.target.checked })}
                    />
                    Priority slot (emergency)
                  </label>
                </div>
              </div>
              <button className="btn w-full" onClick={addSlot} disabled={slotsLoading}>
                Publish slot
              </button>
            </div>

            <div className="space-y-3">
              {slotsLoading && <div className="card skeleton h-32" />}
              {!slotsLoading && slots.length === 0 && (
                <div className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.04] p-6 text-sm text-white/60">
                  No availability published yet. Add your first slot so students can book you instantly.
                </div>
              )}
              {!slotsLoading &&
                slots.map(slot => (
                  <div
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--border)]/60 bg-white/[0.05] px-4 py-3 text-sm text-white/75"
                  >
                    <div>
                      <div className="text-white">{slotFormatter.format(new Date(slot.start))}</div>
                      <div className="text-xs text-white/45">
                        {slotFormatter.format(new Date(slot.end))} · {slot.mode === 'in-person' ? 'In person' : 'Online'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {slot.isEmergency && (
                        <span className="rounded-full border border-[#f87171]/40 bg-[#f87171]/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#fda4a4]">
                          Priority
                        </span>
                      )}
                      <button className="btn-ghost" onClick={() => removeSlot(slot.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}