import React from 'react';
import { ScheduledShift } from '../types';
import { useSchedule } from '../context/ScheduleContext';
import { formatTimeRange } from '../utils/dateUtils';
import { RoleBadge } from './RoleBadge';
import { Clock, User, AlertCircle, Trash2, Edit2 } from 'lucide-react';

interface ShiftCardProps {
  shift: ScheduledShift;
  onEdit: (shift: ScheduledShift) => void;
  dayShiftsAndDonations: { shiftIds: string[]; donationIds: string[] };
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onEdit,
  dayShiftsAndDonations,
}) => {
  const {
    roles,
    volunteers,
    assignVolunteerToShift,
    unassignVolunteerFromShift,
    deleteScheduledShift,
    scheduledShifts,
    scheduledDonations,
  } = useSchedule();

  const role = roles.find((r) => r.id === shift.roleId);
  const activeVolunteers = volunteers.filter((v) => v.active);

  // Check if assigned volunteer is double-booked on same day
  const isVolunteerDoubleBooked = (volId: string) => {
    // Check other shifts on same day
    const otherShifts = scheduledShifts.filter(
      (s) => s.date === shift.date && s.id !== shift.id && s.assignedVolunteerIds.includes(volId)
    );
    // Check donations on same day
    const otherDonations = scheduledDonations.filter(
      (d) => d.date === shift.date && d.assignedVolunteerIds.includes(volId)
    );
    return otherShifts.length > 0 || otherDonations.length > 0;
  };

  const isUnstaffed = shift.assignedVolunteerIds.length === 0;

  return (
    <div
      className={`rounded-lg border p-3 transition-all shadow-xs ${
        isUnstaffed
          ? 'bg-amber-50/50 border-amber-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate" title={shift.name}>
            {shift.name}
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{formatTimeRange(shift.startTime, shift.endTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(shift)}
            title="Edit shift details"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${shift.name} shift for ${shift.date}?`)) {
                deleteScheduledShift(shift.id);
              }
            }}
            title="Remove shift"
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-2">
        <RoleBadge role={role} size="sm" />
      </div>

      {/* Volunteer Assignment Section */}
      <div className="space-y-1.5">
        {/* Existing Assigned Volunteers */}
        {shift.assignedVolunteerIds.map((volId) => {
          const vol = volunteers.find((v) => v.id === volId);
          const doubleBooked = isVolunteerDoubleBooked(volId);

          return (
            <div
              key={volId}
              className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1 border border-slate-200"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <User className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate" title={vol?.name}>
                  {vol ? vol.name : 'Unknown Worker'}
                </span>
                {vol?.memberId && (
                  <span className="text-[10px] text-slate-400 shrink-0">(#{vol.memberId})</span>
                )}
                {doubleBooked && (
                  <span
                    title="Warning: Assigned to multiple duties on this day"
                    className="shrink-0 text-amber-600"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </span>
                )}
              </div>
              <button
                onClick={() => unassignVolunteerFromShift(shift.id, volId)}
                title="Unassign volunteer"
                className="text-slate-400 hover:text-red-600 font-bold ml-1 text-sm leading-none"
              >
                &times;
              </button>
            </div>
          );
        })}

        {/* Quick Assign Dropdown */}
        {shift.assignedVolunteerIds.length < (shift.workersNeeded || 1) && (
          <div className="relative mt-1">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  assignVolunteerToShift(shift.id, e.target.value);
                }
              }}
              className={`w-full text-xs rounded border py-1 px-2 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-colors ${
                isUnstaffed
                  ? 'bg-amber-100/70 border-amber-400 text-amber-900 font-semibold'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="">
                {isUnstaffed ? `⚠️ Assign ${role?.name || 'Worker'}...` : '+ Add Extra Worker...'}
              </option>
              {/* Group 1: Qualified volunteers for this role */}
              <optgroup label={`Qualified ${role?.name || 'Volunteers'}`}>
                {activeVolunteers
                  .filter(
                    (v) =>
                      v.roleIds.includes(shift.roleId) &&
                      !shift.assignedVolunteerIds.includes(v.id)
                  )
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.memberId ? `(#${v.memberId})` : ''}
                    </option>
                  ))}
              </optgroup>
              {/* Group 2: Other available volunteers */}
              <optgroup label="Other Volunteers">
                {activeVolunteers
                  .filter(
                    (v) =>
                      !v.roleIds.includes(shift.roleId) &&
                      !shift.assignedVolunteerIds.includes(v.id)
                  )
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Non-qualified)
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        )}
      </div>

      {shift.notes && (
        <p className="mt-2 text-[10px] text-slate-500 italic line-clamp-2 border-t border-slate-100 pt-1.5">
          {shift.notes}
        </p>
      )}
    </div>
  );
};
