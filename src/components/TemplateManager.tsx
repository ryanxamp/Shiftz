import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { ShiftTemplate, DonationTemplate, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { formatTimeRange, formatTime12h } from '../utils/dateUtils';
import { RoleBadge } from './RoleBadge';
import {
  Plus,
  Trash2,
  Edit2,
  Clock,
  Truck,
  UtensilsCrossed,
  Layers,
  Wand2,
  Check,
  X,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const TemplateManager: React.FC = () => {
  const {
    roles,
    shiftTemplates,
    donationTemplates,
    addShiftTemplate,
    updateShiftTemplate,
    deleteShiftTemplate,
    addDonationTemplate,
    updateDonationTemplate,
    deleteDonationTemplate,
    applyTemplatesToWeek,
    currentWeekMonday,
  } = useSchedule();

  // Shift template form state
  const [editingShiftTmpl, setEditingShiftTmpl] = useState<ShiftTemplate | null>(null);
  const [isAddingShiftTmpl, setIsAddingShiftTmpl] = useState(false);
  const [shiftName, setShiftName] = useState('');
  const [shiftRoleId, setShiftRoleId] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('12:00');
  const [shiftDays, setShiftDays] = useState<DayOfWeek[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]);
  const [shiftDesc, setShiftDesc] = useState('');

  // Donation template form state
  const [editingDonationTmpl, setEditingDonationTmpl] = useState<DonationTemplate | null>(null);
  const [isAddingDonationTmpl, setIsAddingDonationTmpl] = useState(false);
  const [donRetailer, setDonRetailer] = useState('');
  const [donRoleId, setDonRoleId] = useState('');
  const [donTime, setDonTime] = useState('12:00');
  const [donType, setDonType] = useState<'pickup' | 'delivery'>('pickup');
  const [donDays, setDonDays] = useState<DayOfWeek[]>(['Tuesday', 'Thursday']);
  const [donNotes, setDonNotes] = useState('');
  const [donContact, setDonContact] = useState('');

  // Feedback banner
  const [feedback, setFeedback] = useState<string | null>(null);

  const openNewShiftTmpl = () => {
    setEditingShiftTmpl(null);
    setShiftName('');
    setShiftRoleId(roles[0]?.id || '');
    setShiftStartTime('09:00');
    setShiftEndTime('13:00');
    setShiftDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setShiftDesc('');
    setIsAddingShiftTmpl(true);
  };

  const openEditShiftTmpl = (tmpl: ShiftTemplate) => {
    setEditingShiftTmpl(tmpl);
    setShiftName(tmpl.name);
    setShiftRoleId(tmpl.roleId);
    setShiftStartTime(tmpl.startTime);
    setShiftEndTime(tmpl.endTime);
    setShiftDays(tmpl.daysOfWeek);
    setShiftDesc(tmpl.description || '');
    setIsAddingShiftTmpl(true);
  };

  const handleSaveShiftTmpl = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShiftTmpl) {
      updateShiftTemplate(editingShiftTmpl.id, {
        name: shiftName,
        roleId: shiftRoleId,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        daysOfWeek: shiftDays,
        description: shiftDesc,
        workersNeeded: 1,
      });
    } else {
      addShiftTemplate({
        name: shiftName,
        roleId: shiftRoleId,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        daysOfWeek: shiftDays,
        description: shiftDesc,
        workersNeeded: 1,
      });
    }
    setIsAddingShiftTmpl(false);
    setEditingShiftTmpl(null);
  };

  const openNewDonationTmpl = () => {
    setEditingDonationTmpl(null);
    setDonRetailer('');
    setDonRoleId(roles[0]?.id || '');
    setDonTime('12:00');
    setDonType('pickup');
    setDonDays(['Tuesday', 'Thursday']);
    setDonNotes('');
    setDonContact('');
    setIsAddingDonationTmpl(true);
  };

  const openEditDonationTmpl = (tmpl: DonationTemplate) => {
    setEditingDonationTmpl(tmpl);
    setDonRetailer(tmpl.retailerName);
    setDonRoleId(tmpl.roleId);
    setDonTime(tmpl.time);
    setDonType(tmpl.type);
    setDonDays(tmpl.daysOfWeek);
    setDonNotes(tmpl.notes || '');
    setDonContact(tmpl.contactPerson || '');
    setIsAddingDonationTmpl(true);
  };

  const handleSaveDonationTmpl = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDonationTmpl) {
      updateDonationTemplate(editingDonationTmpl.id, {
        retailerName: donRetailer,
        roleId: donRoleId,
        time: donTime,
        type: donType,
        daysOfWeek: donDays,
        notes: donNotes,
        contactPerson: donContact,
      });
    } else {
      addDonationTemplate({
        retailerName: donRetailer,
        roleId: donRoleId,
        time: donTime,
        type: donType,
        daysOfWeek: donDays,
        notes: donNotes,
        contactPerson: donContact,
      });
    }
    setIsAddingDonationTmpl(false);
    setEditingDonationTmpl(null);
  };

  const toggleDay = (day: DayOfWeek, currentList: DayOfWeek[], setter: (val: DayOfWeek[]) => void) => {
    if (currentList.includes(day)) {
      if (currentList.length > 1) {
        setter(currentList.filter((d) => d !== day));
      }
    } else {
      setter([...currentList, day]);
    }
  };

  const handleApplyTemplatesNow = () => {
    const res = applyTemplatesToWeek(currentWeekMonday, true, true);
    setFeedback(`Successfully generated ${res.shiftsAdded} shifts and ${res.donationsAdded} retail donations for this week!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Shift & Donation Templates</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Configure recurring shifts and weekly retail donation drop-offs/pickups according to your organization's weekly cadence.
          </p>
        </div>

        <button
          onClick={handleApplyTemplatesNow}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          title="Instantiate all templates for the current week"
        >
          <Wand2 className="w-4 h-4" />
          <span>Apply Weekly Setup to Current Week</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Grid: 2 Columns (Shift Templates & Retail Donations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* SECTION 1: SHIFT TEMPLATES */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Recurring Shift Templates</h3>
            </div>
            <button
              onClick={openNewShiftTmpl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Shift Template</span>
            </button>
          </div>

          {/* List of Shift Templates */}
          <div className="space-y-3">
            {shiftTemplates.map((tmpl) => {
              const role = roles.find((r) => r.id === tmpl.roleId);
              const isAllWeek = tmpl.daysOfWeek.length === 7;

              return (
                <div
                  key={tmpl.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-all bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{tmpl.name}</h4>
                        <RoleBadge role={role} size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTimeRange(tmpl.startTime, tmpl.endTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditShiftTmpl(tmpl)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        title="Edit template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete template "${tmpl.name}"?`)) {
                            deleteShiftTemplate(tmpl.id);
                          }
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Days */}
                  <div className="mt-3 flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Days:</span>
                    {isAllWeek ? (
                      <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded">
                        Every Day (Mon – Sun)
                      </span>
                    ) : (
                      DAYS_OF_WEEK.map((day) => {
                        const active = tmpl.daysOfWeek.includes(day);
                        return (
                          <span
                            key={day}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              active
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </span>
                        );
                      })
                    )}
                  </div>

                  {tmpl.description && (
                    <p className="mt-2 text-xs text-slate-500 italic">{tmpl.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: RETAIL DONATION TEMPLATES */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Retail Donation Schedule</h3>
            </div>
            <button
              onClick={openNewDonationTmpl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Donation Partner</span>
            </button>
          </div>

          {/* List of Donation Templates */}
          <div className="space-y-3">
            {donationTemplates.map((tmpl) => {
              const role = roles.find((r) => r.id === tmpl.roleId);

              return (
                <div
                  key={tmpl.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-all bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{tmpl.retailerName}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tmpl.type === 'pickup'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {tmpl.type === 'pickup' ? 'Van Pick-up' : 'Drop-off'}
                        </span>
                        <RoleBadge role={role} size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTime12h(tmpl.time)}</span>
                        {tmpl.contactPerson && (
                          <span className="text-slate-400">• Contact: {tmpl.contactPerson}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDonationTmpl(tmpl)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        title="Edit template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete donation template "${tmpl.retailerName}"?`)) {
                            deleteDonationTemplate(tmpl.id);
                          }
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Days */}
                  <div className="mt-3 flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Repeats On:</span>
                    {DAYS_OF_WEEK.map((day) => {
                      const active = tmpl.daysOfWeek.includes(day);
                      return (
                        <span
                          key={day}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>

                  {tmpl.notes && (
                    <p className="mt-2 text-xs text-slate-500 italic">{tmpl.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: Shift Template Edit / Add */}
      {isAddingShiftTmpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">
                {editingShiftTmpl ? 'Edit Shift Template' : 'New Shift Template'}
              </h3>
              <button
                onClick={() => setIsAddingShiftTmpl(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftTmpl} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Shift Name</label>
                <input
                  type="text"
                  required
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  placeholder="e.g. Morning Shift, Front Desk, Evening Closing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Role Needed</label>
                <select
                  value={shiftRoleId}
                  onChange={(e) => setShiftRoleId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              {/* Days of week selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-700">Days of Week</label>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShiftDays([...DAYS_OF_WEEK])}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      All 7 Days
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setShiftDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
                      }
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Mon-Fri
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const active = shiftDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, shiftDays, setShiftDays)}
                        className={`py-1.5 text-xs font-bold rounded transition-colors ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description / Duties</label>
                <textarea
                  rows={2}
                  value={shiftDesc}
                  onChange={(e) => setShiftDesc(e.target.value)}
                  placeholder="e.g. Greet visitors, check credentials, restock supplies..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingShiftTmpl(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Save Shift Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Donation Template Edit / Add */}
      {isAddingDonationTmpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">
                {editingDonationTmpl ? 'Edit Donation Partner' : 'New Donation Partner Template'}
              </h3>
              <button
                onClick={() => setIsAddingDonationTmpl(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonationTmpl} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Retailer / Partner Name</label>
                <input
                  type="text"
                  required
                  value={donRetailer}
                  onChange={(e) => setDonRetailer(e.target.value)}
                  placeholder="e.g. Target, Costco, Trader Joe's"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={donTime}
                    onChange={(e) => setDonTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Action Type</label>
                  <select
                    value={donType}
                    onChange={(e) => setDonType(e.target.value as 'pickup' | 'delivery')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                  >
                    <option value="pickup">Van Pick-up</option>
                    <option value="delivery">Store Drop-off</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Role Needed</label>
                <select
                  value={donRoleId}
                  onChange={(e) => setDonRoleId(e.target.value)}
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

              {/* Days of week selector */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Recurring Days</label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const active = donDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, donDays, setDonDays)}
                        className={`py-1.5 text-xs font-bold rounded transition-colors ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pickup Notes / Bay Details</label>
                <textarea
                  rows={2}
                  value={donNotes}
                  onChange={(e) => setDonNotes(e.target.value)}
                  placeholder="e.g. Loading dock 2, ask for grocery manager..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingDonationTmpl(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Partner Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
