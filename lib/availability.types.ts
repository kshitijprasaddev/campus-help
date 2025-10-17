export type AvailabilitySlot = {
  id: string;
  tutorId: string;
  start: string; // ISO string
  end: string; // ISO string
  mode: 'online' | 'in-person';
  isEmergency?: boolean | null;
};
