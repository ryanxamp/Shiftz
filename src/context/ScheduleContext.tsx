import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Role,
  Volunteer,
  ShiftTemplate,
  DonationTemplate,
  ScheduledShift,
  ScheduledDonation,
  ChatMessage,
  DayOfWeek,
  DonationLog,
} from '../types';
import {
  DEFAULT_ROLES,
  DEFAULT_VOLUNTEERS,
  DEFAULT_SHIFT_TEMPLATES,
  DEFAULT_DONATION_TEMPLATES,
  SAMPLE_VOLUNTEERS,
} from '../services/defaultData';
import { getMondayOfCurrentWeek, getWeekDays } from '../utils/dateUtils';
import {
  initAuth,
  googleSignIn,
  logout as fbLogout,
  setAccessTokenInMemory,
} from '../lib/firebase';

interface ScheduleContextType {
  roles: Role[];
  volunteers: Volunteer[];
  shiftTemplates: ShiftTemplate[];
  donationTemplates: DonationTemplate[];
  scheduledShifts: ScheduledShift[];
  scheduledDonations: ScheduledDonation[];
  currentWeekMonday: Date;
  setCurrentWeekMonday: (d: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;

  // Role actions
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => void;

  // Volunteer actions
  addVolunteer: (vol: Omit<Volunteer, 'id'>) => void;
  updateVolunteer: (id: string, vol: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;
  importVolunteers: (newVolunteers: Omit<Volunteer, 'id'>[]) => void;
  loadSampleRoster: () => void;

  // Template actions
  addShiftTemplate: (tmpl: Omit<ShiftTemplate, 'id'>) => void;
  updateShiftTemplate: (id: string, tmpl: Partial<ShiftTemplate>) => void;
  deleteShiftTemplate: (id: string) => void;
  addDonationTemplate: (tmpl: Omit<DonationTemplate, 'id'>) => void;
  updateDonationTemplate: (id: string, tmpl: Partial<DonationTemplate>) => void;
  deleteDonationTemplate: (id: string) => void;

  // Scheduling actions
  applyTemplatesToWeek: (
    mondayDate: Date,
    overwrite?: boolean,
    seedDemoAssignees?: boolean
  ) => { shiftsAdded: number; donationsAdded: number };
  addManualShift: (shift: Omit<ScheduledShift, 'id'>) => void;
  updateScheduledShift: (id: string, updates: Partial<ScheduledShift>) => void;
  deleteScheduledShift: (id: string) => void;
  assignVolunteerToShift: (shiftId: string, volunteerId: string) => void;
  unassignVolunteerFromShift: (shiftId: string, volunteerId: string) => void;

  addManualDonation: (don: Omit<ScheduledDonation, 'id'>) => void;
  updateScheduledDonation: (id: string, updates: Partial<ScheduledDonation>) => void;
  deleteScheduledDonation: (id: string) => void;
  assignVolunteerToDonation: (donId: string, volunteerId: string) => void;
  unassignVolunteerFromDonation: (donId: string, volunteerId: string) => void;

  autoAssignWeek: (mondayDate: Date) => { assignedCount: number };
  clearAllScheduleData: () => void;

  // Donation Logging
  donationLogs: DonationLog[];
  addDonationLog: (log: Omit<DonationLog, 'id' | 'createdAt'>) => DonationLog;
  updateDonationLog: (id: string, updates: Partial<DonationLog>) => void;
  deleteDonationLog: (id: string) => void;
  getDonationLogForScheduled: (scheduledDonationId: string) => DonationLog | undefined;
  clearAllDonationLogs: () => void;

  // Employee Chat Room & Google Chat Space
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  googleChatSpaceUrl: string;
  setGoogleChatSpaceUrl: (url: string) => void;

  // Auth state
  user: User | null;
  accessToken: string | null;
  isLoggingIn: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLES: 'shiftz_roles_v4',
  VOLUNTEERS: 'shiftz_volunteers_v4',
  SHIFT_TEMPLATES: 'shiftz_shift_templates_v4',
  DONATION_TEMPLATES: 'shiftz_donation_templates_v4',
  SHIFTS: 'shiftz_scheduled_shifts_v4',
  DONATIONS: 'shiftz_scheduled_donations_v4',
  DONATION_LOGS: 'shiftz_donation_logs_v4',
  CHAT: 'shiftz_chat_messages_v4',
  GOOGLE_CHAT_SPACE: 'shiftz_google_chat_space_v4',
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return defaultValue;
  }
}

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMondayOfCurrentWeek());

  // Custom volunteer roles defined by organization
  const [roles, setRoles] = useState<Role[]>(() =>
    loadStorage(STORAGE_KEYS.ROLES, DEFAULT_ROLES)
  );

  // Volunteers: empty by default ("please don't have stuff automatically filled in")
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() =>
    loadStorage(STORAGE_KEYS.VOLUNTEERS, DEFAULT_VOLUNTEERS)
  );

  // Shift & Donation Templates
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>(() =>
    loadStorage(STORAGE_KEYS.SHIFT_TEMPLATES, DEFAULT_SHIFT_TEMPLATES)
  );
  const [donationTemplates, setDonationTemplates] = useState<DonationTemplate[]>(() =>
    loadStorage(STORAGE_KEYS.DONATION_TEMPLATES, DEFAULT_DONATION_TEMPLATES)
  );

  // Scheduled shifts & donations: empty by default
  const [scheduledShifts, setScheduledShifts] = useState<ScheduledShift[]>(() =>
    loadStorage(STORAGE_KEYS.SHIFTS, [])
  );
  const [scheduledDonations, setScheduledDonations] = useState<ScheduledDonation[]>(() =>
    loadStorage(STORAGE_KEYS.DONATIONS, [])
  );

  // Donation Logs: records of food/goods weight, items, and intake
  const [donationLogs, setDonationLogs] = useState<DonationLog[]>(() =>
    loadStorage(STORAGE_KEYS.DONATION_LOGS, [])
  );

  // Chat Messages & Google Chat Space URL
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadStorage(STORAGE_KEYS.CHAT, [
      {
        id: 'msg-welcome',
        senderName: 'Shift Coordinator',
        senderRole: 'Coordinator',
        content: 'Welcome to the team chat! Use this space for shift coverage requests, announcements, and donation updates. Also accessible via Google Chat on iOS & Android.',
        timestamp: new Date().toISOString(),
        category: 'general',
      },
    ])
  );

  const [googleChatSpaceUrl, setGoogleChatSpaceUrlState] = useState<string>(() =>
    loadStorage(STORAGE_KEYS.GOOGLE_CHAT_SPACE, '')
  );

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logoutGoogle = async () => {
    await fbLogout();
    setUser(null);
    setAccessToken(null);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFT_TEMPLATES, JSON.stringify(shiftTemplates));
  }, [shiftTemplates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DONATION_TEMPLATES, JSON.stringify(donationTemplates));
  }, [donationTemplates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(scheduledShifts));
  }, [scheduledShifts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(scheduledDonations));
  }, [scheduledDonations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DONATION_LOGS, JSON.stringify(donationLogs));
  }, [donationLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  const setGoogleChatSpaceUrl = (url: string) => {
    setGoogleChatSpaceUrlState(url);
    localStorage.setItem(STORAGE_KEYS.GOOGLE_CHAT_SPACE, JSON.stringify(url));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeekMonday(getMondayOfCurrentWeek());
  };

  // Roles CRUD
  const addRole = (roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setRoles((prev) => [...prev, newRole]);
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  // Volunteers CRUD
  const addVolunteer = (volData: Omit<Volunteer, 'id'>) => {
    const newVol: Volunteer = {
      ...volData,
      id: `vol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setVolunteers((prev) => [...prev, newVol]);
  };

  const updateVolunteer = (id: string, updates: Partial<Volunteer>) => {
    setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVolunteer = (id: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
  };

  const importVolunteers = (newVols: Omit<Volunteer, 'id'>[]) => {
    const created: Volunteer[] = newVols.map((v, i) => ({
      ...v,
      id: `vol-imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
    }));
    setVolunteers((prev) => [...prev, ...created]);
  };

  const loadSampleRoster = () => {
    setVolunteers(SAMPLE_VOLUNTEERS);
  };

  // Shift Templates CRUD
  const addShiftTemplate = (tmpl: Omit<ShiftTemplate, 'id'>) => {
    const newTmpl: ShiftTemplate = {
      ...tmpl,
      id: `tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setShiftTemplates((prev) => [...prev, newTmpl]);
  };

  const updateShiftTemplate = (id: string, tmpl: Partial<ShiftTemplate>) => {
    setShiftTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...tmpl } : t)));
  };

  const deleteShiftTemplate = (id: string) => {
    setShiftTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Donation Templates CRUD
  const addDonationTemplate = (tmpl: Omit<DonationTemplate, 'id'>) => {
    const newTmpl: DonationTemplate = {
      ...tmpl,
      id: `don-tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setDonationTemplates((prev) => [...prev, newTmpl]);
  };

  const updateDonationTemplate = (id: string, tmpl: Partial<DonationTemplate>) => {
    setDonationTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...tmpl } : t)));
  };

  const deleteDonationTemplate = (id: string) => {
    setDonationTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Apply templates to week
  const applyTemplatesToWeek = (
    mondayDate: Date,
    overwrite: boolean = false,
    seedDemoAssignees: boolean = false
  ) => {
    const weekDays = getWeekDays(mondayDate);
    const dateSet = new Set(weekDays.map((w) => w.dateStr));

    let existingShifts = scheduledShifts;
    let existingDonations = scheduledDonations;

    if (overwrite) {
      existingShifts = existingShifts.filter((s) => !dateSet.has(s.date));
      existingDonations = existingDonations.filter((d) => !dateSet.has(d.date));
    }

    const newShifts: ScheduledShift[] = [];
    const newDonations: ScheduledDonation[] = [];

    weekDays.forEach((day, dayIndex) => {
      // 1. Shifts from templates
      shiftTemplates.forEach((tmpl) => {
        if (tmpl.daysOfWeek.includes(day.dayOfWeek)) {
          const alreadyExists = existingShifts.some(
            (s) => s.date === day.dateStr && s.templateId === tmpl.id
          );
          if (!alreadyExists) {
            let assignedIds: string[] = [];
            if (seedDemoAssignees) {
              const qualified = tmpl.roleId
                ? volunteers.filter((v) => v.roleIds.includes(tmpl.roleId) && v.active)
                : volunteers.filter((v) => v.active);
              if (qualified.length > 0) {
                const assigned = qualified[dayIndex % qualified.length];
                if (assigned) assignedIds = [assigned.id];
              }
            }

            newShifts.push({
              id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              templateId: tmpl.id,
              name: tmpl.name,
              roleId: tmpl.roleId,
              date: day.dateStr,
              dayOfWeek: day.dayOfWeek,
              startTime: tmpl.startTime,
              endTime: tmpl.endTime,
              workersNeeded: tmpl.workersNeeded || 1,
              assignedVolunteerIds: assignedIds,
              notes: tmpl.description,
            });
          }
        }
      });

      // 2. Retail Donations from templates
      donationTemplates.forEach((tmpl) => {
        if (tmpl.daysOfWeek.includes(day.dayOfWeek)) {
          const alreadyExists = existingDonations.some(
            (d) => d.date === day.dateStr && d.templateId === tmpl.id
          );
          if (!alreadyExists) {
            let assignedIds: string[] = [];
            if (seedDemoAssignees) {
              const qualified = tmpl.roleId
                ? volunteers.filter((v) => v.roleIds.includes(tmpl.roleId) && v.active)
                : volunteers.filter((v) => v.active);
              if (qualified.length > 0) {
                const assigned = qualified[dayIndex % qualified.length];
                if (assigned) assignedIds = [assigned.id];
              }
            }

            newDonations.push({
              id: `don-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              templateId: tmpl.id,
              retailerName: tmpl.retailerName,
              roleId: tmpl.roleId,
              date: day.dateStr,
              dayOfWeek: day.dayOfWeek,
              time: tmpl.time,
              type: tmpl.type,
              assignedVolunteerIds: assignedIds,
              notes: tmpl.notes,
              status: 'pending',
            });
          }
        }
      });
    });

    setScheduledShifts([...existingShifts, ...newShifts]);
    setScheduledDonations([...existingDonations, ...newDonations]);

    return {
      shiftsAdded: newShifts.length,
      donationsAdded: newDonations.length,
    };
  };

  // Scheduled shifts actions
  const addManualShift = (shiftData: Omit<ScheduledShift, 'id'>) => {
    const shift: ScheduledShift = {
      ...shiftData,
      id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    setScheduledShifts((prev) => [...prev, shift]);
  };

  const updateScheduledShift = (id: string, updates: Partial<ScheduledShift>) => {
    setScheduledShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteScheduledShift = (id: string) => {
    setScheduledShifts((prev) => prev.filter((s) => s.id !== id));
  };

  const assignVolunteerToShift = (shiftId: string, volunteerId: string) => {
    setScheduledShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        if (s.assignedVolunteerIds.includes(volunteerId)) return s;
        return {
          ...s,
          assignedVolunteerIds: [...s.assignedVolunteerIds, volunteerId],
        };
      })
    );
  };

  const unassignVolunteerFromShift = (shiftId: string, volunteerId: string) => {
    setScheduledShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        return {
          ...s,
          assignedVolunteerIds: s.assignedVolunteerIds.filter((id) => id !== volunteerId),
        };
      })
    );
  };

  // Scheduled Donations actions
  const addManualDonation = (donData: Omit<ScheduledDonation, 'id'>) => {
    const donation: ScheduledDonation = {
      ...donData,
      id: `don-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    setScheduledDonations((prev) => [...prev, donation]);
  };

  const updateScheduledDonation = (id: string, updates: Partial<ScheduledDonation>) => {
    setScheduledDonations((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteScheduledDonation = (id: string) => {
    setScheduledDonations((prev) => prev.filter((d) => d.id !== id));
  };

  const assignVolunteerToDonation = (donId: string, volunteerId: string) => {
    setScheduledDonations((prev) =>
      prev.map((d) => {
        if (d.id !== donId) return d;
        if (d.assignedVolunteerIds.includes(volunteerId)) return d;
        return {
          ...d,
          assignedVolunteerIds: [...d.assignedVolunteerIds, volunteerId],
        };
      })
    );
  };

  const unassignVolunteerFromDonation = (donId: string, volunteerId: string) => {
    setScheduledDonations((prev) =>
      prev.map((d) => {
        if (d.id !== donId) return d;
        return {
          ...d,
          assignedVolunteerIds: d.assignedVolunteerIds.filter((id) => id !== volunteerId),
        };
      })
    );
  };

  // Auto assign week
  const autoAssignWeek = (mondayDate: Date) => {
    const weekDays = getWeekDays(mondayDate);
    const dateSet = new Set(weekDays.map((w) => w.dateStr));
    const activeVols = volunteers.filter((v) => v.active);

    if (activeVols.length === 0) {
      return { assignedCount: 0 };
    }

    let totalAssigned = 0;
    const dailyVolunteerAssignments: Record<string, Set<string>> = {};
    weekDays.forEach((w) => {
      dailyVolunteerAssignments[w.dateStr] = new Set();
    });

    scheduledShifts
      .filter((s) => dateSet.has(s.date))
      .forEach((s) => {
        s.assignedVolunteerIds.forEach((id) => {
          dailyVolunteerAssignments[s.date]?.add(id);
        });
      });

    scheduledDonations
      .filter((d) => dateSet.has(d.date))
      .forEach((d) => {
        d.assignedVolunteerIds.forEach((id) => {
          dailyVolunteerAssignments[d.date]?.add(id);
        });
      });

    // Auto-assign unstaffed shifts
    const updatedShifts = scheduledShifts.map((shift) => {
      if (!dateSet.has(shift.date)) return shift;
      if (shift.assignedVolunteerIds.length >= shift.workersNeeded) return shift;

      const needed = shift.workersNeeded - shift.assignedVolunteerIds.length;
      const candidates = activeVols.filter(
        (v) =>
          v.roleIds.includes(shift.roleId) &&
          !dailyVolunteerAssignments[shift.date]?.has(v.id) &&
          !shift.assignedVolunteerIds.includes(v.id)
      );

      const assignedNow: string[] = [];
      for (let i = 0; i < needed && i < candidates.length; i++) {
        const candidate = candidates[i];
        assignedNow.push(candidate.id);
        dailyVolunteerAssignments[shift.date]?.add(candidate.id);
        totalAssigned++;
      }

      return {
        ...shift,
        assignedVolunteerIds: [...shift.assignedVolunteerIds, ...assignedNow],
      };
    });

    // Auto-assign unstaffed retail donations
    const updatedDonations = scheduledDonations.map((donation) => {
      if (!dateSet.has(donation.date)) return donation;
      if (donation.assignedVolunteerIds.length > 0) return donation;

      const candidates = activeVols.filter(
        (v) =>
          v.roleIds.includes(donation.roleId) &&
          !dailyVolunteerAssignments[donation.date]?.has(v.id)
      );

      if (candidates.length > 0) {
        const chosen = candidates[0];
        dailyVolunteerAssignments[donation.date]?.add(chosen.id);
        totalAssigned++;
        return {
          ...donation,
          assignedVolunteerIds: [chosen.id],
        };
      }
      return donation;
    });

    setScheduledShifts(updatedShifts);
    setScheduledDonations(updatedDonations);

    return { assignedCount: totalAssigned };
  };

  const clearAllScheduleData = () => {
    setScheduledShifts([]);
    setScheduledDonations([]);
  };

  // Donation log management
  const addDonationLog = (logData: Omit<DonationLog, 'id' | 'createdAt'>): DonationLog => {
    const newLog: DonationLog = {
      ...logData,
      id: `don-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setDonationLogs((prev) => [newLog, ...prev]);

    // If linked to a scheduled donation, update status to received and link log id
    if (newLog.scheduledDonationId) {
      setScheduledDonations((prev) =>
        prev.map((d) =>
          d.id === newLog.scheduledDonationId
            ? { ...d, status: 'received', donationLogId: newLog.id }
            : d
        )
      );
    }

    return newLog;
  };

  const updateDonationLog = (id: string, updates: Partial<DonationLog>) => {
    setDonationLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const deleteDonationLog = (id: string) => {
    const existing = donationLogs.find((l) => l.id === id);
    if (existing?.scheduledDonationId) {
      setScheduledDonations((prev) =>
        prev.map((d) =>
          d.id === existing.scheduledDonationId ? { ...d, donationLogId: undefined } : d
        )
      );
    }
    setDonationLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const getDonationLogForScheduled = (scheduledDonationId: string) => {
    return donationLogs.find((l) => l.scheduledDonationId === scheduledDonationId);
  };

  const clearAllDonationLogs = () => {
    setDonationLogs([]);
  };

  // Chat message management
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };

  return (
    <ScheduleContext.Provider
      value={{
        roles,
        volunteers,
        shiftTemplates,
        donationTemplates,
        scheduledShifts,
        scheduledDonations,
        currentWeekMonday,
        setCurrentWeekMonday,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        addRole,
        updateRole,
        deleteRole,
        addVolunteer,
        updateVolunteer,
        deleteVolunteer,
        importVolunteers,
        loadSampleRoster,
        addShiftTemplate,
        updateShiftTemplate,
        deleteShiftTemplate,
        addDonationTemplate,
        updateDonationTemplate,
        deleteDonationTemplate,
        applyTemplatesToWeek,
        addManualShift,
        updateScheduledShift,
        deleteScheduledShift,
        assignVolunteerToShift,
        unassignVolunteerFromShift,
        addManualDonation,
        updateScheduledDonation,
        deleteScheduledDonation,
        assignVolunteerToDonation,
        unassignVolunteerFromDonation,
        autoAssignWeek,
        clearAllScheduleData,
        donationLogs,
        addDonationLog,
        updateDonationLog,
        deleteDonationLog,
        getDonationLogForScheduled,
        clearAllDonationLogs,
        chatMessages,
        addChatMessage,
        clearChatMessages,
        googleChatSpaceUrl,
        setGoogleChatSpaceUrl,
        user,
        accessToken,
        isLoggingIn,
        loginWithGoogle,
        logoutGoogle,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
