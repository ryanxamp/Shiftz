import React, { useState, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { fetchUpcomingCalendarEvents } from '../services/googleCalendar';
import {
  CalendarCheck,
  Calendar,
  ExternalLink,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface GoogleCalendarViewProps {
  onOpenSyncModal: () => void;
}

export const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = ({ onOpenSyncModal }) => {
  const { user, loginWithGoogle, currentWeekMonday } = useSchedule();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchUpcomingCalendarEvents();
      setEvents(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load upcoming events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Google Calendar Integration</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Keep your volunteer team synced on their mobile phones and Google Calendar. Synced shifts and retail donation pickups appear directly on your calendar with automated reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {user ? (
            <>
              <button
                onClick={loadEvents}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Calendar</span>
              </button>
              <button
                onClick={onOpenSyncModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Sync Current Week</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Connect Google Account</span>
            </button>
          )}
        </div>
      </div>

      {!user ? (
        <div className="bg-indigo-50/60 rounded-xl border border-indigo-200 p-8 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Connect Google Calendar</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              With permission from the app's users, Shiftz can add volunteer kitchen shifts and recurring retail donation pickups (Target, Costco, Trader Joe's) straight to Google Calendar.
            </p>
          </div>
          <button
            onClick={() => loginWithGoogle()}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Connected to Google Calendar ({user.email})
                </p>
                <p className="text-[11px] text-slate-500">
                  Read & write access enabled for calendar events.
                </p>
              </div>
            </div>

            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Open in Google Calendar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upcoming Events List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Google Calendar Events ({events.length})
              </h3>
              <span className="text-xs text-slate-400">Live feed from primary calendar</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading events from Google Calendar...
              </div>
            ) : events.length === 0 ? (
              <div className="py-8 text-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                <p>No upcoming events found on your primary calendar.</p>
                <button
                  onClick={onOpenSyncModal}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Click here to sync this week's halfway house schedule!
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                {events.map((evt) => {
                  const start = evt.start?.dateTime
                    ? new Date(evt.start.dateTime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : evt.start?.date || 'All Day';

                  const isHalfwayHouse =
                    evt.summary?.includes('[Halfway House]') || evt.summary?.includes('[Donation]');

                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 flex items-start justify-between gap-4 transition-colors ${
                        isHalfwayHouse ? 'bg-indigo-50/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isHalfwayHouse && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-indigo-100 text-indigo-800">
                              Shiftz Event
                            </span>
                          )}
                          <h4 className="font-bold text-slate-900">{evt.summary}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {start}
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-600 p-1"
                          title="View on Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
