import React, { useState, useEffect } from 'react';
import {
  DonationLog,
  DonationLogItem,
  DonationCategory,
  ScheduledDonation,
} from '../types';
import { useSchedule } from '../context/ScheduleContext';
import {
  DONATION_CATEGORIES,
  COMMON_STORAGE_LOCATIONS,
  COMMON_UNIT_TYPES,
  getCategoryMeta,
  formatCurrency,
} from '../utils/donationUtils';
import {
  X,
  Plus,
  Trash2,
  Scale,
  DollarSign,
  Thermometer,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  CheckCircle,
  Package,
} from 'lucide-react';

interface DonationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLog?: DonationLog | null;
  scheduledDonation?: ScheduledDonation | null;
}

export const DonationLogModal: React.FC<DonationLogModalProps> = ({
  isOpen,
  onClose,
  initialLog,
  scheduledDonation,
}) => {
  const {
    volunteers,
    addDonationLog,
    updateDonationLog,
    addChatMessage,
  } = useSchedule();

  const activeVolunteers = volunteers.filter((v) => v.active);

  // Form states
  const [retailerOrDonor, setRetailerOrDonor] = useState('');
  const [donorContact, setDonorContact] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [type, setType] = useState<'pickup' | 'delivery' | 'dropoff'>('pickup');
  const [loggedByVolunteerId, setLoggedByVolunteerId] = useState('');
  const [driverOrReceiverName, setDriverOrReceiverName] = useState('');
  const [receiptNumberOrRef, setReceiptNumberOrRef] = useState('');
  const [temperatureCheckPassed, setTemperatureCheckPassed] = useState(true);
  const [defaultTempF, setDefaultTempF] = useState<string>('');
  const [defaultStorageLocation, setDefaultStorageLocation] = useState(COMMON_STORAGE_LOCATIONS[0]);
  const [status, setStatus] = useState<'logged' | 'inspected' | 'distributed'>('logged');
  const [notes, setNotes] = useState('');
  const [notifyChat, setNotifyChat] = useState(true);

  // Line items
  const [items, setItems] = useState<DonationLogItem[]>([
    {
      id: `item-${Date.now()}-1`,
      category: 'produce',
      description: '',
      weightLbs: 0,
      unitCount: 1,
      unitType: 'cases',
      estimatedValue: 0,
      storageLocation: COMMON_STORAGE_LOCATIONS[0],
    },
  ]);

  // Prepopulate when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialLog) {
      setRetailerOrDonor(initialLog.retailerOrDonor);
      setDonorContact(initialLog.donorContact || '');
      setDate(initialLog.date);
      setTime(initialLog.time);
      setType(initialLog.type);
      setLoggedByVolunteerId(initialLog.loggedByVolunteerId || '');
      setDriverOrReceiverName(initialLog.driverOrReceiverName || '');
      setReceiptNumberOrRef(initialLog.receiptNumberOrRef || '');
      setTemperatureCheckPassed(initialLog.temperatureCheckPassed ?? true);
      setStatus(initialLog.status);
      setNotes(initialLog.notes || '');
      setItems(
        initialLog.items.length > 0
          ? initialLog.items
          : [
              {
                id: `item-${Date.now()}`,
                category: 'produce',
                description: '',
                weightLbs: 0,
                unitCount: 1,
                unitType: 'cases',
                estimatedValue: 0,
              },
            ]
      );
    } else if (scheduledDonation) {
      setRetailerOrDonor(scheduledDonation.retailerName);
      setDate(scheduledDonation.date);
      setTime(scheduledDonation.time);
      setType(scheduledDonation.type);
      setNotes(scheduledDonation.notes || '');
      // Find assigned volunteer
      if (scheduledDonation.assignedVolunteerIds.length > 0) {
        setLoggedByVolunteerId(scheduledDonation.assignedVolunteerIds[0]);
      } else {
        setLoggedByVolunteerId('');
      }
      setItems([
        {
          id: `item-${Date.now()}`,
          category: 'produce',
          description: `${scheduledDonation.retailerName} retail intake`,
          weightLbs: 0,
          unitCount: 1,
          unitType: 'boxes',
          estimatedValue: 0,
          storageLocation: COMMON_STORAGE_LOCATIONS[0],
        },
      ]);
    } else {
      // Clean slate
      setRetailerOrDonor('');
      setDonorContact('');
      setDate(new Date().toISOString().split('T')[0]);
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setType('pickup');
      setLoggedByVolunteerId(activeVolunteers[0]?.id || '');
      setDriverOrReceiverName('');
      setReceiptNumberOrRef('');
      setTemperatureCheckPassed(true);
      setDefaultTempF('');
      setStatus('logged');
      setNotes('');
      setItems([
        {
          id: `item-${Date.now()}`,
          category: 'produce',
          description: '',
          weightLbs: 0,
          unitCount: 1,
          unitType: 'cases',
          estimatedValue: 0,
          storageLocation: COMMON_STORAGE_LOCATIONS[0],
        },
      ]);
    }
  }, [isOpen, initialLog, scheduledDonation]);

  if (!isOpen) return null;

  // Calculations
  const totalWeightLbs = items.reduce((sum, item) => sum + (Number(item.weightLbs) || 0), 0);
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.unitCount) || 0), 0);
  const totalEstimatedValue = items.reduce(
    (sum, item) => sum + (Number(item.estimatedValue) || 0),
    0
  );

  const handleAddItem = (categoryPreset?: DonationCategory) => {
    const newItem: DonationLogItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      category: categoryPreset || 'produce',
      description: '',
      weightLbs: 0,
      unitCount: 1,
      unitType: 'cases',
      estimatedValue: 0,
      storageLocation: defaultStorageLocation,
      temperatureF: defaultTempF ? parseFloat(defaultTempF) : undefined,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<DonationLogItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      // Clear values of single row rather than removing
      setItems([
        {
          id: `item-${Date.now()}`,
          category: 'produce',
          description: '',
          weightLbs: 0,
          unitCount: 1,
          unitType: 'cases',
          estimatedValue: 0,
          storageLocation: defaultStorageLocation,
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerOrDonor.trim()) {
      alert('Please enter a retailer or donor name.');
      return;
    }

    const assignedVol = volunteers.find((v) => v.id === loggedByVolunteerId);
    const receiverName = assignedVol ? assignedVol.name : driverOrReceiverName.trim() || 'Staff Receiver';

    const logPayload: Omit<DonationLog, 'id' | 'createdAt'> = {
      scheduledDonationId: initialLog?.scheduledDonationId || scheduledDonation?.id,
      retailerOrDonor: retailerOrDonor.trim(),
      donorContact: donorContact.trim() || undefined,
      date,
      time,
      type,
      loggedByVolunteerId: loggedByVolunteerId || undefined,
      driverOrReceiverName: receiverName,
      receiptNumberOrRef: receiptNumberOrRef.trim() || undefined,
      items: items.filter((i) => i.description.trim() || i.weightLbs > 0),
      totalWeightLbs: Number(totalWeightLbs.toFixed(1)),
      totalEstimatedValue: Number(totalEstimatedValue.toFixed(2)),
      totalUnits,
      temperatureCheckPassed,
      notes: notes.trim() || undefined,
      status,
    };

    // If all items were blank, create at least one entry with the total
    if (logPayload.items.length === 0) {
      logPayload.items = [
        {
          id: `item-${Date.now()}`,
          category: 'other',
          description: `${retailerOrDonor.trim()} general donation`,
          weightLbs: 0,
          unitCount: 1,
          unitType: 'boxes',
          estimatedValue: 0,
          storageLocation: defaultStorageLocation,
        },
      ];
    }

    if (initialLog) {
      updateDonationLog(initialLog.id, logPayload);
    } else {
      const created = addDonationLog(logPayload);

      // Post update to team chat if requested
      if (notifyChat) {
        addChatMessage({
          senderName: receiverName,
          senderRole: 'Donation Intake',
          content: `📦 Received & Logged Donation: ${logPayload.totalWeightLbs} lbs from ${retailerOrDonor} (${logPayload.items.length} items logged). Stored in ${defaultStorageLocation}.`,
          category: 'donation_alert',
        });
      }
    }

    onClose();
  };

  const quickRetailers = [
    'Target',
    'Costco',
    'Trader Joe\'s',
    'Whole Foods',
    'Local Food Bank',
    'Panera Bread',
    'Community Farm',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-emerald-700 px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800/80">
              <Scale className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {initialLog ? 'Edit Donation Intake Log' : 'Log Donation Intake & Weight'}
              </h3>
              <p className="text-xs text-emerald-100">
                Record incoming food rescue, retail pickups, and donor weights for records & reporting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Linked Scheduled Shift Banner */}
          {scheduledDonation && (
            <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Logging scheduled <strong>{scheduledDonation.retailerName}</strong> {scheduledDonation.type} for{' '}
                  <strong>{scheduledDonation.date}</strong> ({scheduledDonation.time}).
                </span>
              </div>
              <span className="px-2 py-0.5 rounded font-bold bg-indigo-200/80 text-indigo-800 text-[10px]">
                Linked Pickup
              </span>
            </div>
          )}

          {/* Section 1: Donor & Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            {/* Donor / Retailer */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Retailer or Donor Source *</span>
              </label>
              <input
                type="text"
                required
                value={retailerOrDonor}
                onChange={(e) => setRetailerOrDonor(e.target.value)}
                placeholder="e.g. Target Store #1024, Costco Wholesale, Food Bank..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Fill:</span>
                {quickRetailers.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRetailerOrDonor(r)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-emerald-50 border border-slate-200 text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Intake Method</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setType('pickup')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                    type === 'pickup'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🚚 Van Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setType('dropoff')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                    type === 'dropoff'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📦 Drop-off
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date Received *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time Received *</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
            </div>

            {/* Receiver / Volunteer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Logged By / Receiver</span>
              </label>
              <select
                value={loggedByVolunteerId}
                onChange={(e) => {
                  setLoggedByVolunteerId(e.target.value);
                  if (e.target.value) setDriverOrReceiverName('');
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="">Custom Staff / Driver Name...</option>
                {activeVolunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.memberId ? `(#${v.memberId})` : ''}
                  </option>
                ))}
              </select>
              {!loggedByVolunteerId && (
                <input
                  type="text"
                  placeholder="Or enter receiver/driver name"
                  value={driverOrReceiverName}
                  onChange={(e) => setDriverOrReceiverName(e.target.value)}
                  className="mt-1.5 w-full px-2.5 py-1 text-[11px] rounded border border-slate-300 bg-white focus:ring-1 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Receipt # or Ref */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Receipt / Bill of Lading #</span>
              </label>
              <input
                type="text"
                value={receiptNumberOrRef}
                onChange={(e) => setReceiptNumberOrRef(e.target.value)}
                placeholder="e.g. TGT-9481, Manifest #, or Slip #"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
            </div>

            {/* Food Safety & Cold Chain Temp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-slate-500" />
                <span>Temp Check (°F) & Safety</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={defaultTempF}
                  onChange={(e) => setDefaultTempF(e.target.value)}
                  placeholder="e.g. 36.5"
                  className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={temperatureCheckPassed}
                    onChange={(e) => setTemperatureCheckPassed(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span className="font-semibold text-[11px]">Safe Temp / Passed</span>
                </label>
              </div>
            </div>

            {/* Default Storage Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Storage Location
              </label>
              <select
                value={defaultStorageLocation}
                onChange={(e) => setDefaultStorageLocation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                {COMMON_STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Itemized Goods, Weights, & Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Itemized Goods, Weights & Categories
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            {/* Quick Category Add Pills */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 font-semibold text-[10px] shrink-0">Add Category:</span>
              {DONATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleAddItem(cat.key)}
                  className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap hover:opacity-80 transition-opacity ${cat.bg} ${cat.text} ${cat.border}`}
                >
                  {cat.icon} + {cat.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Table of items */}
            <div className="space-y-2.5">
              {items.map((item, index) => {
                const catMeta = getCategoryMeta(item.category);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      {/* Category */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              category: e.target.value as DonationCategory,
                            })
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                        >
                          {DONATION_CATEGORIES.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.icon} {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Description / Items
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { description: e.target.value })
                          }
                          placeholder="e.g. Mixed fresh greens, apples, yogurt..."
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Weight (lbs) */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5 flex items-center justify-between">
                          <span>Weight (lbs)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={item.weightLbs === 0 ? '' : item.weightLbs}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                weightLbs: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.0"
                            className="w-full px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 pr-7 text-right"
                          />
                          <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-semibold pointer-events-none">
                            lbs
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Unit */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Units / Crates
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.unitCount || ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                unitCount: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            placeholder="1"
                            className="w-12 px-1.5 py-1 text-xs rounded border border-slate-300 text-center"
                          />
                          <select
                            value={item.unitType || 'cases'}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { unitType: e.target.value })
                            }
                            className="w-full px-1.5 py-1 text-[11px] rounded border border-slate-300 bg-slate-50"
                          >
                            {COMMON_UNIT_TYPES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Remove button */}
                      <div className="sm:col-span-1 flex justify-end items-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remove item"
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Secondary row: Est Value & Storage override */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 flex-wrap gap-2 text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400 font-medium">Est. Value ($):</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={item.estimatedValue === 0 ? '' : item.estimatedValue}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                estimatedValue: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-20 px-1.5 py-0.5 text-xs rounded border border-slate-200 text-slate-700 font-semibold"
                          />
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400 font-medium">Stored in:</span>
                          <input
                            type="text"
                            placeholder={defaultStorageLocation}
                            value={item.storageLocation || ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { storageLocation: e.target.value })
                            }
                            className="w-36 px-1.5 py-0.5 text-xs rounded border border-slate-200 text-slate-700"
                          />
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${catMeta.bg} ${catMeta.text}`}>
                        {catMeta.icon} {catMeta.label.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary Banner */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Intake Totals Calculated
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Weight</span>
                  <span className="font-extrabold text-emerald-400 text-base">
                    {totalWeightLbs.toFixed(1)} lbs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Containers</span>
                  <span className="font-extrabold text-white text-base">
                    {totalUnits} units
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est. Fair Market Value</span>
                  <span className="font-extrabold text-amber-300 text-base">
                    {formatCurrency(totalEstimatedValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Intake Notes & Condition
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Excellent fresh produce condition, boxes stacked on pallet 2, best used by Friday..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Donation Intake Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'logged' | 'inspected' | 'distributed')
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white font-medium"
                >
                  <option value="logged">Logged (Received at facility)</option>
                  <option value="inspected">Inspected & Sanitized / Weighed</option>
                  <option value="distributed">Distributed / Prepped for Meals</option>
                </select>
              </div>

              {!initialLog && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={notifyChat}
                    onChange={(e) => setNotifyChat(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-emerald-900 block leading-tight">
                      Post notification to Team Chat Room
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Alerts mobile volunteers and kitchen team that fresh donations are logged
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>{initialLog ? 'Save Log Updates' : 'Confirm & Save Intake Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
