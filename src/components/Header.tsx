import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import {
  Calendar as CalendarIcon,
  Layers,
  Users,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  RotateCcw,
  LogOut,
  FileSpreadsheet,
  MessageSquare,
  Smartphone,
  Scale,
} from 'lucide-react';
import { getWeekDays } from '../utils/dateUtils';

interface HeaderProps {
  activeTab: 'schedule' | 'templates' | 'volunteers' | 'donations' | 'chat' | 'calendar';
  setActiveTab: (tab: 'schedule' | 'templates' | 'volunteers' | 'donations' | 'chat' | 'calendar') => void;
  onOpenSyncModal: () => void;
  onOpenPrintModal: () => void;
  onOpenSheetsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSyncModal,
  onOpenPrintModal,
  onOpenSheetsModal,
}) => {
  const {
    currentWeekMonday,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    user,
    loginWithGoogle,
    logoutGoogle,
    isLoggingIn,
    clearAllScheduleData,
    chatMessages,
    donationLogs,
  } = useSchedule();

  const weekDays = getWeekDays(currentWeekMonday);
  const startDay = weekDays[0].displayDate;
  const endDay = weekDays[6].displayDate;
  const currentYear = currentWeekMonday.getFullYear();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Context */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Shiftz</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                Volunteer & Shift Scheduler
              </span>
            </div>
            <p className="text-xs text-slate-500">Roles • Shifts • Retail Donations • Team Chat</p>
          </div>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={goToPreviousWeek}
            title="Previous Week"
            className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToCurrentWeek}
            className="px-3 py-1 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition-colors"
            title="Click to jump to Current Week"
          >
            Week of {startDay} – {endDay}, {currentYear}
          </button>
          <button
            onClick={goToNextWeek}
            title="Next Week"
            className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions & Google Integration */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenSheetsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Import volunteer names and roles from Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={onOpenSyncModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Sync shifts and retail donation pickups to Google Calendar"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Google Calendar Sync</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
            title="Print weekly schedule for team bulletin board"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Board</span>
          </button>

          {/* Google Auth Status / Sign-in */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-7 h-7 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-slate-800 leading-none">
                  {user.displayName?.split(' ')[0] || 'Connected'}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold leading-none mt-0.5">
                  Google Workspace
                </p>
              </div>
              <button
                onClick={logoutGoogle}
                title="Disconnect Google account"
                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
              title="Connect Google Calendar & Google Sheets"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Connect Google'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Clear all scheduled shifts and donations from this calendar?')) {
                clearAllScheduleData();
              }
            }}
            title="Clear all scheduled shifts"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 border-t border-slate-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`py-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'schedule'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Weekly Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'templates'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Shift & Donation Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('volunteers')}
          className={`py-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'volunteers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Volunteers & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`py-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors relative ${
            activeTab === 'donations'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Donation Log</span>
          {donationLogs.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {donationLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors relative ${
            activeTab === 'chat'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Employee Chat Room</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            iOS/Android
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'calendar'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Google Calendar</span>
        </button>
      </div>
    </header>
  );
};
