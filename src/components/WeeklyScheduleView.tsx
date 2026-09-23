import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDays } from '../utils/dateUtils';
import { ScheduledShift, ScheduledDonation, DayOfWeek } from '../types';
import { ShiftCard } from './ShiftCard';
import { DonationCard } from './DonationCard';
import { ShiftModal } from './ShiftModal';
import { DonationModal } from './DonationModal';
import {
  Plus,
  Wand2,
  Sparkles,
  AlertTriangle,
  UtensilsCrossed,
  Truck,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const WeeklyScheduleView: React.FC = () => {
  const {
    currentWeekMonday,
    scheduledShifts,
    scheduledDonations,
    applyTemplatesToWeek,
    autoAssignWeek,
    shiftTemplates,
    donationTemplates,
  } = useSchedule();

  const weekDays = getWeekDays(currentWeekMonday);
  const weekDates = new Set(weekDays.map((w) => w.dateStr));

  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState<ScheduledShift | null>(null);
  const [donationToEdit, setDonationToEdit] = useState<ScheduledDonation | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek>('Monday');

  // Filter state
  const [viewFilter, setViewFilter] = useState<'all' | 'shifts' | 'donations' | 'unstaffed'>('all');

  // Filter current week's items
  const weekShifts = scheduledShifts.filter((s) => weekDates.has(s.date));
  const weekDonations = scheduledDonations.filter((d) => weekDates.has(d.date));

  // Count unstaffed items
  const unstaffedShifts = weekShifts.filter(
    (s) => s.assignedVolunteerIds.length < (s.workersNeeded || 1)
  );
  const unstaffedDonations = weekDonations.filter((d) => d.assignedVolunteerIds.length === 0);
  const totalUnstaffed = unstaffedShifts.length + unstaffedDonations.length;

  const handleOpenNewShift = (dateStr: string, dayOfWeek: DayOfWeek) => {
    setShiftToEdit(null);
    setSelectedDate(dateStr);
    setSelectedDayOfWeek(dayOfWeek);
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (shift: ScheduledShift) => {
    setShiftToEdit(shift);
    setIsShiftModalOpen(true);
  };

  const handleOpenNewDonation = (dateStr: string, dayOfWeek: DayOfWeek) => {
    setDonationToEdit(null);
    setSelectedDate(dateStr);
    setSelectedDayOfWeek(dayOfWeek);
    setIsDonationModalOpen(true);
  };

  const handleEditDonation = (donation: ScheduledDonation) => {
    setDonationToEdit(donation);
    setIsDonationModalOpen(true);
  };

  const handleApplyTemplates = () => {
    const result = applyTemplatesToWeek(currentWeekMonday, false);
    if (result.shiftsAdded === 0 && result.donationsAdded === 0) {
      alert('All templates are already scheduled for this week! You can edit or add individual shifts as needed.');
    }
  };

  const handleAutoAssign = () => {
    const res = autoAssignWeek(currentWeekMonday);
    if (res.assignedCount > 0) {
      // successful
    } else {
      alert('No unassigned shifts or retail donations had matching available volunteers.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Summary & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Week Overview:</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {weekShifts.length} Shifts
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              {weekDonations.length} Retail Donations
            </span>
            {totalUnstaffed > 0 ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {totalUnstaffed} Unstaffed
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Fully Staffed!
              </span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setViewFilter('shifts')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewFilter === 'shifts'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shifts Only
            </button>
            <button
              onClick={() => setViewFilter('donations')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewFilter === 'donations'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retail Donations Only
            </button>
            <button
              onClick={() => setViewFilter('unstaffed')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewFilter === 'unstaffed'
                  ? 'bg-white text-amber-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Staffing ({totalUnstaffed})
            </button>
          </div>
        </div>

        {/* Right: Quick Batch Generators */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleApplyTemplates}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
            title="Generate this week's scheduled shifts and recurring retail donations from your saved templates"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate Week from Templates</span>
          </button>

          <button
            onClick={handleAutoAssign}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Intelligently assign available volunteers to unstaffed shifts based on certified roles"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart Auto-Assign</span>
          </button>
        </div>
      </div>

      {/* Empty week helper banner */}
      {weekShifts.length === 0 && weekDonations.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Clean Slate — No Duties Scheduled For This Week Yet</h4>
              <p className="text-xs text-slate-500">
                Generate the week using your configured shift templates, or add individual shifts manually.
              </p>
            </div>
          </div>
          <button
            onClick={handleApplyTemplates}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs shrink-0"
          >
            + Generate Week from Templates
          </button>
        </div>
      )}

      {/* Week Grid (7 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
        {weekDays.map((day) => {
          // Filter items for this day
          let dayShifts = weekShifts.filter((s) => s.date === day.dateStr);
          let dayDonations = weekDonations.filter((d) => d.date === day.dateStr);

          // Apply view filters
          if (viewFilter === 'shifts') {
            dayDonations = [];
          } else if (viewFilter === 'donations') {
            dayShifts = [];
          } else if (viewFilter === 'unstaffed') {
            dayShifts = dayShifts.filter(
              (s) => s.assignedVolunteerIds.length < (s.workersNeeded || 1)
            );
            dayDonations = dayDonations.filter((d) => d.assignedVolunteerIds.length === 0);
          }

          const hasItems = dayShifts.length > 0 || dayDonations.length > 0;
          const dayNeedsStaffing =
            dayShifts.some((s) => s.assignedVolunteerIds.length < (s.workersNeeded || 1)) ||
            dayDonations.some((d) => d.assignedVolunteerIds.length === 0);

          return (
            <div
              key={day.dateStr}
              className={`rounded-xl border flex flex-col min-h-[520px] transition-shadow ${
                day.isToday
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50 shadow-xs'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b rounded-t-xl ${
                  day.isToday
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-900 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {day.dayOfWeek.slice(0, 3)}
                  </span>
                  {day.isToday && (
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-1.5 py-0.5 rounded">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span
                    className={`text-base font-extrabold ${
                      day.isToday ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {day.displayDate}
                  </span>
                  {dayNeedsStaffing && (
                    <span
                      title="Has unassigned shifts or donations"
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        day.isToday ? 'bg-amber-300 text-amber-900' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Needs Staff
                    </span>
                  )}
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100/30">
                  <button
                    onClick={() => handleOpenNewShift(day.dateStr, day.dayOfWeek)}
                    className={`flex-1 text-[11px] font-medium py-1 px-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                      day.isToday
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Add a custom meal or duty shift"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Shift</span>
                  </button>
                  <button
                    onClick={() => handleOpenNewDonation(day.dateStr, day.dayOfWeek)}
                    className={`flex-1 text-[11px] font-medium py-1 px-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                      day.isToday
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                    }`}
                    title="Schedule a retail donation pickup (Target, Costco, etc.)"
                  >
                    <Truck className="w-3 h-3" />
                    <span>Donation</span>
                  </button>
                </div>
              </div>

              {/* Day Body */}
              <div className="p-2 space-y-3 flex-1 flex flex-col">
                {/* 1. Meal & Work Shifts */}
                {dayShifts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 px-1 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      <UtensilsCrossed className="w-3 h-3 text-emerald-600" />
                      <span>Shifts ({dayShifts.length})</span>
                    </div>
                    {dayShifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        onEdit={handleEditShift}
                        dayShiftsAndDonations={{
                          shiftIds: dayShifts.map((s) => s.id),
                          donationIds: dayDonations.map((d) => d.id),
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 2. Retail Donations */}
                {dayDonations.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 px-1 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      <Truck className="w-3 h-3 text-indigo-600" />
                      <span>Donations ({dayDonations.length})</span>
                    </div>
                    {dayDonations.map((donation) => (
                      <DonationCard
                        key={donation.id}
                        donation={donation}
                        onEdit={handleEditDonation}
                      />
                    ))}
                  </div>
                )}

                {/* Empty State for Day */}
                {!hasItems && (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed border-slate-200 bg-white/50 text-slate-400">
                    <p className="text-xs font-medium">No duties scheduled</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Use template or + buttons above
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftToEdit={shiftToEdit}
        defaultDate={selectedDate}
        defaultDayOfWeek={selectedDayOfWeek}
      />

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        donationToEdit={donationToEdit}
        defaultDate={selectedDate}
        defaultDayOfWeek={selectedDayOfWeek}
      />
    </div>
  );
};
