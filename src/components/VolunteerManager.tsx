import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Volunteer, Role } from '../types';
import { RoleBadge } from './RoleBadge';
import {
  Users,
  Plus,
  Search,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  Check,
  X,
  Sparkles,
  Tag,
  IdCard,
} from 'lucide-react';

interface VolunteerManagerProps {
  onOpenSheetsModal: () => void;
}

export const VolunteerManager: React.FC<VolunteerManagerProps> = ({ onOpenSheetsModal }) => {
  const {
    volunteers,
    roles,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    addRole,
    updateRole,
    deleteRole,
    loadSampleRoster,
  } = useSchedule();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isAddingVolunteer, setIsAddingVolunteer] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

  // Volunteer form state
  const [name, setName] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  // Role management state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleColor, setRoleColor] = useState('emerald');
  const [roleDesc, setRoleDesc] = useState('');

  const openAddVolunteer = () => {
    setEditingVolunteer(null);
    setName('');
    setSelectedRoleIds(roles.length > 0 ? [roles[0].id] : []);
    setPhone('');
    setEmail('');
    setMemberId('');
    setNotes('');
    setActive(true);
    setIsAddingVolunteer(true);
  };

  const openEditVolunteer = (vol: Volunteer) => {
    setEditingVolunteer(vol);
    setName(vol.name);
    setSelectedRoleIds(vol.roleIds || []);
    setPhone(vol.phone || '');
    setEmail(vol.email || '');
    setMemberId(vol.memberId || '');
    setNotes(vol.notes || '');
    setActive(vol.active);
    setIsAddingVolunteer(true);
  };

  const handleSaveVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVolunteer) {
      updateVolunteer(editingVolunteer.id, {
        name: name.trim(),
        roleIds: selectedRoleIds,
        phone: phone.trim(),
        email: email.trim(),
        memberId: memberId.trim(),
        notes: notes.trim(),
        active,
      });
    } else {
      addVolunteer({
        name: name.trim(),
        roleIds: selectedRoleIds,
        phone: phone.trim(),
        email: email.trim(),
        memberId: memberId.trim(),
        notes: notes.trim(),
        active,
      });
    }
    setIsAddingVolunteer(false);
    setEditingVolunteer(null);
  };

  const toggleVolunteerRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      if (selectedRoleIds.length > 1) {
        setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
      }
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  // Role CRUD handlers
  const handleOpenNewRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleColor('emerald');
    setRoleDesc('');
  };

  const handleOpenEditRole = (r: Role) => {
    setEditingRole(r);
    setRoleName(r.name);
    setRoleColor(r.color);
    setRoleDesc(r.description || '');
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (editingRole) {
      updateRole(editingRole.id, {
        name: roleName.trim(),
        color: roleColor,
        description: roleDesc.trim(),
      });
    } else {
      addRole({
        name: roleName.trim(),
        color: roleColor,
        description: roleDesc.trim(),
      });
    }

    setEditingRole(null);
    setRoleName('');
    setRoleDesc('');
  };

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vol.memberId && vol.memberId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vol.notes && vol.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'all' || vol.roleIds.includes(selectedRoleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Volunteer Employees & Roles</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Manage your volunteer roster and assign them defined roles for your organization. Assign roles to schedule shifts and retail donation pickups without payroll bloat.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Manage Roles ({roles.length})</span>
          </button>

          <button
            onClick={onOpenSheetsModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Google Sheets</span>
          </button>

          <button
            onClick={openAddVolunteer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Volunteer</span>
          </button>
        </div>
      </div>

      {/* Role Overview Bar */}
      <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Defined Volunteer Roles
          </span>
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Edit Roles</span>
          </button>
        </div>
        {roles.length === 0 ? (
          <div className="py-2 text-xs text-slate-500 flex items-center justify-between">
            <span>No roles configured yet. Define custom roles (e.g. Greeter, Shift Lead, Assistant, Coordinator) for your organization.</span>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              + Create First Role
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const count = volunteers.filter((v) => v.roleIds.includes(r.id)).length;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleFilter(r.id === selectedRoleFilter ? 'all' : r.id)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
                    selectedRoleFilter === r.id
                      ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <RoleBadge role={r} size="sm" />
                  <span className="text-xs font-bold">{count} assigned</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search volunteers by name, badge ID, or notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              selectedRoleFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Volunteers ({volunteers.length})
          </button>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleFilter(r.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedRoleFilter === r.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteer Cards Grid or Empty State */}
      {volunteers.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Volunteer Roster is Empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your volunteer team members and assign their roles, or import them from a Google Sheet.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={openAddVolunteer}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              + Add First Volunteer
            </button>
            <button
              onClick={onOpenSheetsModal}
              className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              Import from Google Sheets
            </button>
            <button
              onClick={loadSampleRoster}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
              title="Load 5 sample volunteer profiles for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Load Sample Volunteers</span>
            </button>
          </div>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No volunteers match the current search or role filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVolunteers.map((vol) => {
            const volRoles = vol.roleIds
              .map((id) => roles.find((r) => r.id === id))
              .filter(Boolean) as Role[];

            return (
              <div
                key={vol.id}
                className={`rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  vol.active
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{vol.name}</h4>
                        {!vol.active && (
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      {vol.memberId && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <IdCard className="w-3 h-3 text-slate-400" />
                          <span>ID: {vol.memberId}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditVolunteer(vol)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit volunteer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete volunteer ${vol.name}?`)) {
                            deleteVolunteer(vol.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete volunteer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Role Badges */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {volRoles.length > 0 ? (
                      volRoles.map((role) => <RoleBadge key={role.id} role={role} size="sm" />)
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No roles assigned</span>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    {vol.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{vol.phone}</span>
                      </div>
                    )}
                    {vol.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{vol.email}</span>
                      </div>
                    )}
                  </div>

                  {vol.notes && (
                    <p className="mt-2.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      {vol.notes}
                    </p>
                  )}
                </div>

                {/* Status footer */}
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {vol.roleIds.length} role{vol.roleIds.length === 1 ? '' : 's'} assigned
                  </span>
                  <button
                    onClick={() => updateVolunteer(vol.id, { active: !vol.active })}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      vol.active
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {vol.active ? 'Active' : 'Set Active'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Volunteer Modal (Add / Edit) */}
      {isAddingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">
                {editingVolunteer ? 'Edit Volunteer' : 'Add Volunteer Worker'}
              </h3>
              <button
                onClick={() => setIsAddingVolunteer(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVolunteer} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Roles Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-700">Assigned Roles</label>
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(true)}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    + Define New Role
                  </button>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {roles.map((r) => {
                    const isChecked = selectedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-white cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleVolunteerRole(r.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-medium text-xs text-slate-800">{r.name}</span>
                        </div>
                        <RoleBadge role={r} size="sm" />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Badge / Member ID</label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="e.g. VOL-102"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. (555) 234-5678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes & Availability</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Weekend availability, morning shifts, special skills..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-medium text-slate-700">
                  Active (Available for weekly shift assignment)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingVolunteer(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Save Volunteer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal (Custom Roles) */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Define & Manage Volunteer Roles</h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-sm max-h-[80vh] overflow-y-auto">
              {/* Existing roles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Roles ({roles.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Customizable roles for your organization
                  </span>
                </div>

                {roles.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    No roles defined yet. Create your first role below (e.g. Greeter, Shift Lead, Assistant, Coordinator).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roles.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <RoleBadge role={r} size="md" />
                            <span className="text-xs text-slate-400">
                              ({volunteers.filter((v) => v.roleIds.includes(r.id)).length} volunteers)
                            </span>
                          </div>
                          {r.description && (
                            <p className="text-xs text-slate-500">{r.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditRole(r)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="Edit role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete role "${r.name}"?`)) {
                                deleteRole(r.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add / Edit Role Form */}
              <form onSubmit={handleSaveRole} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{editingRole ? `Edit Role: ${editingRole.name}` : '+ Define New Role'}</span>
                  </h4>
                  {editingRole && (
                    <button
                      type="button"
                      onClick={handleOpenNewRole}
                      className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                    >
                      Clear edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Greeter, Shift Lead, Coordinator, Assistant"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Badge Color</label>
                    <select
                      value={roleColor}
                      onChange={(e) => setRoleColor(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="emerald">Emerald Green</option>
                      <option value="teal">Teal Cyan</option>
                      <option value="indigo">Indigo Blue</option>
                      <option value="amber">Amber Gold</option>
                      <option value="purple">Purple</option>
                      <option value="rose">Rose Red</option>
                      <option value="sky">Sky Blue</option>
                      <option value="slate">Slate Gray</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      placeholder="e.g. Duties summary"
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingRole ? 'Save Changes to Role' : 'Add Role'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
