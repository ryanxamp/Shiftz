import React, { useState, useEffect } from 'react';
import { ScheduledShift, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDays } from '../utils/dateUtils';
import { X, Clock, User, Briefcase } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit?: ScheduledShift | null;
  defaultDate?: string;
  defaultDayOfWeek?: DayOfWeek;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  shiftToEdit,
  defaultDate,
  defaultDayOfWeek,
}) => {
  const { roles, volunteers, addManualShift, updateScheduledShift, currentWeekMonday } =
    useSchedule();
  const weekDays = getWeekDays(currentWeekMonday);

  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [assignedVolunteerIds, setAssignedVolunteerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (shiftToEdit) {
      setName(shiftToEdit.name);
      setRoleId(shiftToEdit.roleId);
      setDate(shiftToEdit.date);
      setStartTime(shiftToEdit.startTime);
      setEndTime(shiftToEdit.endTime);
      setWorkersNeeded(shiftToEdit.workersNeeded || 1);
      setAssignedVolunteerIds(shiftToEdit.assignedVolunteerIds || []);
      setNotes(shiftToEdit.notes || '');
    } else {
      setName('');
      setRoleId(roles[0]?.id || '');
      setDate(defaultDate || weekDays[0].dateStr);
      setStartTime('09:00');
      setEndTime('13:00');
      setWorkersNeeded(1);
      setAssignedVolunteerIds([]);
      setNotes('');
    }
  }, [shiftToEdit, defaultDate, isOpen, roles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dayMatch = weekDays.find((w) => w.dateStr === date);
    const dayOfWeek = dayMatch ? dayMatch.dayOfWeek : defaultDayOfWeek || 'Monday';

    if (shiftToEdit) {
      updateScheduledShift(shiftToEdit.id, {
        name,
        roleId,
        date,
        dayOfWeek,
        startTime,
        endTime,
        workersNeeded,
        assignedVolunteerIds,
        notes,
      });
    } else {
      addManualShift({
        name,
        roleId,
        date,
        dayOfWeek,
        startTime,
        endTime,
        workersNeeded,
        assignedVolunteerIds,
        notes,
      });
    }
    onClose();
  };

  const activeVolunteers = volunteers.filter((v) => v.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">
            {shiftToEdit ? 'Edit Scheduled Shift' : 'Add Volunteer Shift'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {/* Quick Time Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Time Block Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (!name) setName('Morning Shift');
                  setStartTime('09:00');
                  setEndTime('13:00');
                }}
                className="px-2 py-1 text-xs bg-emerald-50 text-emerald-800 rounded border border-emerald-200 hover:bg-emerald-100"
              >
                🌅 Morning (9am - 1pm)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!name) setName('Afternoon Shift');
                  setStartTime('13:00');
                  setEndTime('17:00');
                }}
                className="px-2 py-1 text-xs bg-sky-50 text-sky-800 rounded border border-sky-200 hover:bg-sky-100"
              >
                ☀️ Afternoon (1pm - 5pm)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!name) setName('Evening Shift');
                  setStartTime('17:00');
                  setEndTime('21:00');
                }}
                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-800 rounded border border-indigo-200 hover:bg-indigo-100"
              >
                🌙 Evening (5pm - 9pm)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Shift Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Shift, Front Desk, Closing"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
              >
                {weekDays.map((w) => (
                  <option key={w.dateStr} value={w.dateStr}>
                    {w.fullDisplay}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Required Role</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
              >
                <option value="">-- No Specific Role / Any --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Volunteer</label>
            <select
              value={assignedVolunteerIds[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAssignedVolunteerIds(val ? [val] : []);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
            >
              <option value="">-- Leave Unassigned (Fill Later) --</option>
              {activeVolunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.memberId ? `(#${v.memberId})` : ''} -{' '}
                  {v.roleIds.includes(roleId) ? 'Qualified' : 'Other Role'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Shift Notes / Duties</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prep salad bar, clean stovetops, disinfect tables..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              {shiftToEdit ? 'Save Changes' : 'Add Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
