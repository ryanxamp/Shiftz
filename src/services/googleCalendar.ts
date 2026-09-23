import { getAccessToken } from '../lib/firebase';
import { ScheduledShift, ScheduledDonation, Role, Volunteer } from '../types';

export interface CalendarEventPayload {
  summary: string;
  description: string;
  start: {
    dateTime: string; // ISO string
    timeZone?: string;
  };
  end: {
    dateTime: string; // ISO string
    timeZone?: string;
  };
  location?: string;
}

const CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary';

export async function createGoogleCalendarEvent(payload: CalendarEventPayload): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('You must sign in with Google to sync to Google Calendar.');
  }

  const response = await fetch(`${CALENDAR_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to create calendar event (${response.status})`);
  }

  return await response.json();
}

export async function fetchUpcomingCalendarEvents(): Promise<any[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  const now = new Date().toISOString();
  const response = await fetch(
    `${CALENDAR_BASE_URL}/events?timeMin=${encodeURIComponent(now)}&maxResults=20&orderBy=startTime&singleEvents=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch calendar events:', response.statusText);
    return [];
  }

  const data = await response.json();
  return data.items || [];
}

export function buildShiftEventPayload(
  shift: ScheduledShift,
  role?: Role,
  volunteers: Volunteer[] = []
): CalendarEventPayload {
  const assignedNames = shift.assignedVolunteerIds
    .map((id) => volunteers.find((v) => v.id === id)?.name)
    .filter(Boolean)
    .join(', ') || 'Unassigned';

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Combine date and time
  const startDateTime = new Date(`${shift.date}T${shift.startTime}:00`).toISOString();
  const endDateTime = new Date(`${shift.date}T${shift.endTime}:00`).toISOString();

  const roleName = role ? role.name : 'Volunteer Shift';

  return {
    summary: `[Shiftz] ${shift.name} (${roleName}) - ${assignedNames}`,
    description: `Shift: ${shift.name}\nRole: ${roleName}\nAssigned Volunteer(s): ${assignedNames}\nTime: ${shift.startTime} - ${shift.endTime}\nNotes: ${shift.notes || 'None'}\n\nManaged via Shiftz Volunteer Scheduler.`,
    start: {
      dateTime: startDateTime,
      timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone,
    },
    location: 'Facility / Worksite',
  };
}

export function buildDonationEventPayload(
  donation: ScheduledDonation,
  role?: Role,
  volunteers: Volunteer[] = []
): CalendarEventPayload {
  const assignedNames = donation.assignedVolunteerIds
    .map((id) => volunteers.find((v) => v.id === id)?.name)
    .filter(Boolean)
    .join(', ') || 'Unassigned Volunteer';

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Calculate 1 hour slot starting at donation time
  const startDateTime = new Date(`${donation.date}T${donation.time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

  const actionType = donation.type === 'pickup' ? 'Donation Pick-Up' : 'Donation Delivery Intake';
  const roleName = role ? role.name : 'Volunteer';

  return {
    summary: `[Donation] ${donation.retailerName} ${actionType} - ${assignedNames}`,
    description: `Retail Partner: ${donation.retailerName}\nAction: ${actionType}\nDesignated Role: ${roleName}\nAssigned Volunteer: ${assignedNames}\nScheduled Time: ${donation.time}\nNotes: ${donation.notes || 'Check in with receiving manager'}\n\nManaged via Shiftz Volunteer Scheduler.`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone,
    },
    location: donation.type === 'pickup' ? `${donation.retailerName} Receiving Dock` : 'Facility Receiving Area',
  };
}
