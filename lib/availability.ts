export type AvailabilitySlot = {
  id: string;
  tutorId: string;
  start: string; // ISO string
  end: string; // ISO string
  mode: 'online' | 'in-person';
  isEmergency?: boolean | null;
};

function coerceDate(candidate: unknown): Date | null {
  if (candidate instanceof Date) return new Date(candidate.getTime());
  if (typeof candidate === 'string' || typeof candidate === 'number') {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function normalizeAvailabilitySlot(raw: unknown): AvailabilitySlot | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const tutorCandidate = (data['tutor_id'] ?? data['tutorId'] ?? data['profile_id'] ?? data['helper_id'] ?? data['user_id']) as
    | string
    | number
    | null
    | undefined;
  const startCandidate = (data['start_time'] ?? data['startTime'] ?? data['start'] ?? data['from'] ?? data['start_utc']) as
    | string
    | number
    | Date
    | null
    | undefined;
  const endCandidate = (data['end_time'] ?? data['endTime'] ?? data['end'] ?? data['to'] ?? data['end_utc']) as
    | string
    | number
    | Date
    | null
    | undefined;

  if (tutorCandidate == null || startCandidate == null || endCandidate == null) return null;

  const startDate = coerceDate(startCandidate);
  const endDate = coerceDate(endCandidate);
  if (!startDate || !endDate) return null;

  const modeValue = typeof data['mode'] === 'string' ? data['mode'].toLowerCase() : '';
  const mode: AvailabilitySlot['mode'] = modeValue === 'in-person' || modeValue === 'in_person' ? 'in-person' : 'online';

  const idCandidate = data['id'];
  const isEmergency = data['is_emergency'] ?? data['priority'];

  return {
    id: String(idCandidate ?? `${tutorCandidate}-${startDate.toISOString()}`),
    tutorId: String(tutorCandidate),
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    mode,
    isEmergency: Boolean(isEmergency),
  };
}

export function generateFallbackSlots(tutorIds: string[], days: number = 10): AvailabilitySlot[] {
  const ids = tutorIds.length ? tutorIds : ['demo-1', 'demo-2'];
  const base = new Date();
  base.setMinutes(0, 0, 0);

  const slots: AvailabilitySlot[] = [];
  ids.slice(0, 6).forEach((id, index) => {
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const start = new Date(base);
      start.setDate(start.getDate() + dayOffset);
      start.setHours(10 + (index % 4) * 2, 0, 0, 0);

      const end = new Date(start);
      end.setHours(start.getHours() + 1, 0, 0, 0);

      slots.push({
        id: `${id}-${dayOffset}-${index}`,
        tutorId: String(id),
        start: start.toISOString(),
        end: end.toISOString(),
        mode: index % 2 === 0 ? 'online' : 'in-person',
        isEmergency: dayOffset === 0 && index === 0,
      });
    }
  });

  return slots;
}
