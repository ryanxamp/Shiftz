import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDays, formatTimeRange, formatTime12h } from '../utils/dateUtils';
import { Printer, X, UtensilsCrossed, Truck, Calendar } from 'lucide-react';

interface PrintScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintScheduleModal: React.FC<PrintScheduleModalProps> = ({ isOpen, onClose }) => {
  const {
    currentWeekMonday,
    scheduledShifts,
    scheduledDonations,
    roles,
    volunteers,
    getDonationLogForScheduled,
  } = useSchedule();

  if (!isOpen) return null;

  const weekDays = getWeekDays(currentWeekMonday);
  const weekDates = new Set(weekDays.map((w) => w.dateStr));

  const weekShifts = scheduledShifts.filter((s) => weekDates.has(s.date));
  const weekDonations = scheduledDonations.filter((d) => weekDates.has(d.date));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Modal Top Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Printable Bulletin Board Schedule</h3>
            <p className="text-xs text-slate-500">
              Formatted for posting in the kitchen, dining hall, or house common area.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Schedule</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-6 overflow-y-auto flex-1 print:p-0 print:overflow-visible text-slate-900">
          {/* Header on Printed Document */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Volunteer Shift & Retail Donation Schedule
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Week of {weekDays[0].fullDisplay} — {weekDays[6].fullDisplay}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                Official Roster
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Please report on time for scheduled duties</p>
            </div>
          </div>

          {/* 7-Day Table */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 print:grid-cols-7 print:gap-1.5 text-xs">
            {weekDays.map((day) => {
              const dayShifts = weekShifts.filter((s) => s.date === day.dateStr);
              const dayDonations = weekDonations.filter((d) => d.date === day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/40 flex flex-col justify-between min-h-[300px] print:min-h-[420px]"
                >
                  <div>
                    {/* Day header */}
                    <div className="border-b border-slate-300 pb-1 mb-2 text-center">
                      <span className="font-black text-sm uppercase block text-slate-900">
                        {day.dayOfWeek}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{day.displayDate}</span>
                    </div>

                    {/* Shifts */}
                    {dayShifts.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Volunteer Shifts</span>
                        </span>
                        {dayShifts.map((shift) => {
                          const assigned = shift.assignedVolunteerIds
                            .map((id) => {
                              const v = volunteers.find((vol) => vol.id === id);
                              return v ? `${v.name} ${v.memberId ? `(#${v.memberId})` : ''}` : '';
                            })
                            .filter(Boolean)
                            .join(', ');

                          return (
                            <div
                              key={shift.id}
                              className="border border-slate-200 rounded p-1.5 bg-white text-[11px]"
                            >
                              <span className="font-bold block text-slate-900">{shift.name}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {formatTimeRange(shift.startTime, shift.endTime)}
                              </span>
                              <div className="mt-1 pt-1 border-t border-slate-100 font-semibold text-emerald-800">
                                {assigned || (
                                  <span className="text-rose-600 uppercase text-[9px] font-black">
                                    [Unassigned]
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Donations */}
                    {dayDonations.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>Retail Donation</span>
                        </span>
                        {dayDonations.map((don) => {
                          const assigned = don.assignedVolunteerIds
                            .map((id) => {
                              const v = volunteers.find((vol) => vol.id === id);
                              return v ? `${v.name} ${v.memberId ? `(#${v.memberId})` : ''}` : '';
                            })
                            .filter(Boolean)
                            .join(', ');

                          return (
                            <div
                              key={don.id}
                              className="border border-slate-200 rounded p-1.5 bg-white text-[11px]"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{don.retailerName}</span>
                                <span className="text-[9px] font-bold text-indigo-700">
                                  {don.type === 'pickup' ? 'Van' : 'Drop'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                {formatTime12h(don.time)}
                              </span>
                              {(() => {
                                const log = getDonationLogForScheduled(don.id);
                                if (!log) return null;
                                return (
                                  <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                    {log.totalWeightLbs} lbs logged
                                  </span>
                                );
                              })()}
                              <div className="mt-1 pt-1 border-t border-slate-100 font-semibold text-indigo-800">
                                {assigned || (
                                  <span className="text-rose-600 uppercase text-[9px] font-black">
                                    [Unassigned]
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer on printed document */}
          <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <span>Shiftz Volunteer Scheduling System</span>
            <span>If unable to work your shift, notify house manager 24h in advance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
