import React, { useState } from 'react';
import { ScheduledDonation } from '../types';
import { useSchedule } from '../context/ScheduleContext';
import { formatTime12h } from '../utils/dateUtils';
import { formatCurrency } from '../utils/donationUtils';
import { Truck, CheckCircle2, Clock, Trash2, Edit2, PackageCheck, Scale, AlertCircle } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { DonationLogModal } from './DonationLogModal';

interface DonationCardProps {
  donation: ScheduledDonation;
  onEdit: (donation: ScheduledDonation) => void;
}

export const DonationCard: React.FC<DonationCardProps> = ({ donation, onEdit }) => {
  const {
    roles,
    volunteers,
    assignVolunteerToDonation,
    unassignVolunteerFromDonation,
    updateScheduledDonation,
    deleteScheduledDonation,
    scheduledShifts,
    scheduledDonations,
    getDonationLogForScheduled,
  } = useSchedule();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const linkedLog = getDonationLogForScheduled(donation.id);

  const role = roles.find((r) => r.id === donation.roleId);
  const activeVolunteers = volunteers.filter((v) => v.active);

  const isVolunteerDoubleBooked = (volId: string) => {
    const otherShifts = scheduledShifts.filter(
      (s) => s.date === donation.date && s.assignedVolunteerIds.includes(volId)
    );
    const otherDonations = scheduledDonations.filter(
      (d) => d.date === donation.date && d.id !== donation.id && d.assignedVolunteerIds.includes(volId)
    );
    return otherShifts.length > 0 || otherDonations.length > 0;
  };

  const isAssigned = donation.assignedVolunteerIds.length > 0;
  const isCompleted = donation.status === 'received';

  // Retailer theme accent
  const getRetailerBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('target')) {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', tag: 'Target' };
    }
    if (lower.includes('costco')) {
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', tag: 'Costco' };
    }
    if (lower.includes('trader')) {
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', tag: 'Trader Joe\'s' };
    }
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', tag: 'Retailer' };
  };

  const retailerStyle = getRetailerBadge(donation.retailerName);

  return (
    <div
      className={`rounded-lg border p-3 transition-all shadow-xs ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-300'
          : !isAssigned
          ? 'bg-rose-50/60 border-rose-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${retailerStyle.bg} ${retailerStyle.text} ${retailerStyle.border}`}
            >
              {retailerStyle.tag}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                donation.type === 'pickup'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {donation.type === 'pickup' ? 'Van Pickup' : 'Drop-off'}
            </span>
          </div>
          <h4
            className="text-xs font-bold text-slate-900 truncate mt-1"
            title={donation.retailerName}
          >
            {donation.retailerName}
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{formatTime12h(donation.time)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(donation)}
            title="Edit donation details"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${donation.retailerName} donation for ${donation.date}?`)) {
                deleteScheduledDonation(donation.id);
              }
            }}
            title="Remove donation"
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Role requirement */}
      <div className="mb-2">
        <RoleBadge role={role} size="sm" />
      </div>

      {/* Assigned Volunteer */}
      <div className="space-y-1.5">
        {donation.assignedVolunteerIds.map((volId) => {
          const vol = volunteers.find((v) => v.id === volId);
          const doubleBooked = isVolunteerDoubleBooked(volId);

          return (
            <div
              key={volId}
              className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1 border border-slate-200"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Truck className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate" title={vol?.name}>
                  {vol ? vol.name : 'Unknown Volunteer'}
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
                onClick={() => unassignVolunteerFromDonation(donation.id, volId)}
                title="Unassign volunteer"
                className="text-slate-400 hover:text-red-600 font-bold ml-1 text-sm leading-none"
              >
                &times;
              </button>
            </div>
          );
        })}

        {/* Quick Assign Volunteer */}
        {donation.assignedVolunteerIds.length === 0 && (
          <div className="relative mt-1">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  assignVolunteerToDonation(donation.id, e.target.value);
                }
              }}
              className="w-full text-xs rounded border py-1 px-2 font-semibold bg-rose-100/70 border-rose-300 text-rose-900 focus:ring-1 focus:ring-rose-500 focus:outline-hidden transition-colors"
            >
              <option value="">⚠️ Assign Volunteer...</option>
              {donation.roleId && (
                <optgroup label={role ? `Qualified (${role.name})` : 'Role Qualified'}>
                  {activeVolunteers
                    .filter((v) => v.roleIds.includes(donation.roleId))
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.memberId ? `(#${v.memberId})` : ''}
                      </option>
                    ))}
                </optgroup>
              )}
              <optgroup label={donation.roleId ? 'Other Volunteers' : 'All Active Volunteers'}>
                {activeVolunteers
                  .filter((v) => !donation.roleId || !v.roleIds.includes(donation.roleId))
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        )}
      </div>

      {/* Logged intake status badge if already weighed/logged */}
      {linkedLog && (
        <div className="mt-2 p-1.5 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Scale className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="font-extrabold text-[11px] truncate">
              {linkedLog.totalWeightLbs} lbs
            </span>
            <span className="text-[10px] text-emerald-800 font-semibold truncate">
              ({formatCurrency(linkedLog.totalEstimatedValue)})
            </span>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 ml-1"
          >
            Edit Log
          </button>
        </div>
      )}

      {/* Completion status button & intake action */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              updateScheduledDonation(donation.id, {
                status: donation.status === 'received' ? 'pending' : 'received',
              })
            }
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
              donation.status === 'received'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {donation.status === 'received' ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Received</span>
              </>
            ) : (
              <>
                <PackageCheck className="w-3 h-3" />
                <span>Mark Received</span>
              </>
            )}
          </button>

          {!linkedLog && (
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Record scale weight, items, and food categories for this pickup"
            >
              <Scale className="w-3 h-3 text-emerald-600" />
              <span>Log Weight</span>
            </button>
          )}
        </div>

        {donation.notes && (
          <span
            className="text-[10px] text-slate-400 truncate max-w-[100px]"
            title={donation.notes}
          >
            {donation.notes}
          </span>
        )}
      </div>

      {/* Donation Intake Modal */}
      <DonationLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        initialLog={linkedLog}
        scheduledDonation={donation}
      />
    </div>
  );
};
