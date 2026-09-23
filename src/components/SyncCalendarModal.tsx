import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDays, formatTimeRange, formatTime12h } from '../utils/dateUtils';
import {
  createGoogleCalendarEvent,
  buildShiftEventPayload,
  buildDonationEventPayload,
} from '../services/googleCalendar';
import {
  CalendarCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  UtensilsCrossed,
  Truck,
  Loader2,
} from 'lucide-react';

interface SyncCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncCalendarModal: React.FC<SyncCalendarModalProps> = ({ isOpen, onClose }) => {
  const {
    currentWeekMonday,
    scheduledShifts,
    scheduledDonations,
    roles,
    volunteers,
    user,
    loginWithGoogle,
    updateScheduledShift,
    updateScheduledDonation,
  } = useSchedule();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  const weekDays = getWeekDays(currentWeekMonday);
  const weekDates = new Set(weekDays.map((w) => w.dateStr));

  // Current week items
  const weekShifts = scheduledShifts.filter((s) => weekDates.has(s.date));
  const weekDonations = scheduledDonations.filter((d) => weekDates.has(d.date));
  const totalItems = weekShifts.length + weekDonations.length;

  const handleConfirmAndSync = async () => {
    if (!user) {
      setSyncError('Please connect your Google account first.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(null);
    setSyncProgress(0);

    let completed = 0;
    let shiftSuccessCount = 0;
    let donationSuccessCount = 0;
    const errors: string[] = [];

    // 1. Sync Shifts
    for (const shift of weekShifts) {
      try {
        const role = roles.find((r) => r.id === shift.roleId);
        const payload = buildShiftEventPayload(shift, role, volunteers);
        const createdEvent = await createGoogleCalendarEvent(payload);
        if (createdEvent?.id) {
          updateScheduledShift(shift.id, { googleCalendarEventId: createdEvent.id });
          shiftSuccessCount++;
        }
      } catch (err: any) {
        console.error('Error syncing shift:', err);
        errors.push(`Shift "${shift.name}" (${shift.date}): ${err.message}`);
      }
      completed++;
      setSyncProgress(Math.round((completed / totalItems) * 100));
    }

    // 2. Sync Donations
    for (const donation of weekDonations) {
      try {
        const role = roles.find((r) => r.id === donation.roleId);
        const payload = buildDonationEventPayload(donation, role, volunteers);
        const createdEvent = await createGoogleCalendarEvent(payload);
        if (createdEvent?.id) {
          updateScheduledDonation(donation.id, { googleCalendarEventId: createdEvent.id });
          donationSuccessCount++;
        }
      } catch (err: any) {
        console.error('Error syncing donation:', err);
        errors.push(`Donation "${donation.retailerName}" (${donation.date}): ${err.message}`);
      }
      completed++;
      setSyncProgress(Math.round((completed / totalItems) * 100));
    }

    setIsSyncing(false);

    if (errors.length === 0) {
      setSyncSuccess(
        `Successfully added ${shiftSuccessCount} shifts and ${donationSuccessCount} retail donations to your Google Calendar!`
      );
    } else {
      setSyncSuccess(
        `Synced ${shiftSuccessCount} shifts and ${donationSuccessCount} donations. ${errors.length} items failed.`
      );
      setSyncError(errors.join('\n'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-indigo-50/50">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900">Sync Week to Google Calendar</h3>
              <p className="text-xs text-slate-500">
                Week of {weekDays[0].displayDate} – {weekDays[6].displayDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {!user ? (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col items-center text-center space-y-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Google Account Connection Required</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Sign in with Google to grant permission to add volunteer shifts and retail donation drop-offs directly to your calendar.
                </p>
              </div>
              <button
                onClick={() => loginWithGoogle()}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <>
              {/* Mandatory User Confirmation Notice */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Confirmation Required Before Modifying Google Calendar</span>
                </div>
                <p>
                  You are about to export <strong>{totalItems} items</strong> ({weekShifts.length} duty shifts and {weekDonations.length} retail donation pickups) into your primary Google Calendar (<strong>{user.email}</strong>).
                </p>
                <p className="text-[11px] text-amber-800">
                  Each event will include scheduled times, location, assigned volunteer names, and contact notes.
                </p>
              </div>

              {/* Items List Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Events to be Added ({totalItems}):
                </h4>
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs bg-slate-50/50">
                  {weekShifts.map((s) => {
                    const assignedNames = s.assignedVolunteerIds
                      .map((id) => volunteers.find((v) => v.id === id)?.name)
                      .filter(Boolean)
                      .join(', ') || 'Unassigned';

                    return (
                      <div key={s.id} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900">{s.name}</span>
                            <span className="text-slate-400 ml-1.5">({s.dayOfWeek}, {s.date})</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-medium text-slate-600 block">
                            {formatTimeRange(s.startTime, s.endTime)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            {assignedNames}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {weekDonations.map((d) => {
                    const assignedNames = d.assignedVolunteerIds
                      .map((id) => volunteers.find((v) => v.id === id)?.name)
                      .filter(Boolean)
                      .join(', ') || 'Unassigned';

                    return (
                      <div key={d.id} className="p-2.5 flex items-center justify-between gap-2 bg-indigo-50/30">
                        <div className="flex items-center gap-2 min-w-0">
                          <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900">{d.retailerName}</span>
                            <span className="text-slate-400 ml-1.5">({d.dayOfWeek}, {d.date})</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-medium text-slate-600 block">
                            {formatTime12h(d.time)}
                          </span>
                          <span className="text-[10px] text-indigo-700 font-semibold block">
                            {assignedNames}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar */}
              {isSyncing && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Syncing events with Google Calendar...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Result */}
              {syncSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{syncSuccess}</span>
                  </div>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                  >
                    <span>Open Google Calendar to view events</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {syncError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <p className="font-bold">Some items could not be synced:</p>
                  <pre className="mt-1 text-[11px] whitespace-pre-wrap font-mono">{syncError}</pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Confirm and Cancel */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {user && (
            <button
              type="button"
              disabled={isSyncing || totalItems === 0}
              onClick={handleConfirmAndSync}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>Confirm & Sync to Google Calendar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
