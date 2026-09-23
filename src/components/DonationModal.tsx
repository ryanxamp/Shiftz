import React, { useState, useEffect } from 'react';
import { ScheduledDonation, DayOfWeek } from '../types';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDays } from '../utils/dateUtils';
import { X, Truck, Clock } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationToEdit?: ScheduledDonation | null;
  defaultDate?: string;
  defaultDayOfWeek?: DayOfWeek;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  donationToEdit,
  defaultDate,
  defaultDayOfWeek,
}) => {
  const {
    roles,
    volunteers,
    addManualDonation,
    updateScheduledDonation,
    currentWeekMonday,
  } = useSchedule();
  const weekDays = getWeekDays(currentWeekMonday);

  const [retailerName, setRetailerName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [type, setType] = useState<'pickup' | 'delivery'>('pickup');
  const [assignedVolunteerIds, setAssignedVolunteerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (donationToEdit) {
      setRetailerName(donationToEdit.retailerName);
      setRoleId(donationToEdit.roleId);
      setDate(donationToEdit.date);
      setTime(donationToEdit.time);
      setType(donationToEdit.type);
      setAssignedVolunteerIds(donationToEdit.assignedVolunteerIds || []);
      setNotes(donationToEdit.notes || '');
    } else {
      setRetailerName('');
      setRoleId(roles[0]?.id || '');
      setDate(defaultDate || weekDays[0].dateStr);
      setTime('12:00');
      setType('pickup');
      setAssignedVolunteerIds([]);
      setNotes('');
    }
  }, [donationToEdit, defaultDate, isOpen, roles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dayMatch = weekDays.find((w) => w.dateStr === date);
    const dayOfWeek = dayMatch ? dayMatch.dayOfWeek : defaultDayOfWeek || 'Monday';

    if (donationToEdit) {
      updateScheduledDonation(donationToEdit.id, {
        retailerName,
        roleId,
        date,
        dayOfWeek,
        time,
        type,
        assignedVolunteerIds,
        notes,
      });
    } else {
      addManualDonation({
        retailerName,
        roleId,
        date,
        dayOfWeek,
        time,
        type,
        assignedVolunteerIds,
        notes,
        status: 'pending',
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
            {donationToEdit ? 'Edit Retail Donation' : 'Schedule Retail Donation'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Common Retail Donations
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRetailerName('Target Retail Donation');
                  setTime('12:00');
                  setType('pickup');
                  setNotes('Rear loading dock #3. Bring receipt manifest.');
                }}
                className="px-2 py-1 text-xs bg-red-50 text-red-800 rounded border border-red-200 hover:bg-red-100"
              >
                🎯 Target (12:00 PM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRetailerName('Costco Wholesale Donation');
                  setTime('11:30');
                  setType('pickup');
                  setNotes('Bulk produce, bakery, and dry goods. Bring cargo van.');
                }}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-800 rounded border border-blue-200 hover:bg-blue-100"
              >
                📦 Costco (11:30 AM)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRetailerName("Trader Joe's Food Rescue");
                  setTime('09:30');
                  setType('pickup');
                  setNotes('Fresh organic produce & bakery crates.');
                }}
                className="px-2 py-1 text-xs bg-amber-50 text-amber-800 rounded border border-amber-200 hover:bg-amber-100"
              >
                🥗 Trader Joe's (9:30 AM)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Retailer / Partner Name</label>
            <input
              type="text"
              required
              value={retailerName}
              onChange={(e) => setRetailerName(e.target.value)}
              placeholder="e.g. Target, Costco, Walmart, Local Bakery"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
              >
                {weekDays.map((w) => (
                  <option key={w.dateStr} value={w.dateStr}>
                    {w.fullDisplay}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Action Type</label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setType('pickup')}
                  className={`flex-1 py-2 font-medium transition-colors ${
                    type === 'pickup'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Van Pick-up
                </button>
                <button
                  type="button"
                  onClick={() => setType('delivery')}
                  className={`flex-1 py-2 font-medium transition-colors ${
                    type === 'delivery'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Store Drop-off
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Required Role</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
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

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Volunteer</label>
            <select
              value={assignedVolunteerIds[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAssignedVolunteerIds(val ? [val] : []);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
            >
              <option value="">-- Leave Unassigned (Fill Later) --</option>
              {activeVolunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.memberId ? `(#${v.memberId})` : ''} -{' '}
                  {v.roleIds.includes(roleId) ? 'Qualified' : 'Volunteer'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Dock / Pickup Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Loading dock 4, ask for Sarah, bring 4 cooler bags..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              {donationToEdit ? 'Save Changes' : 'Schedule Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
