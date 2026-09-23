import { Role, Volunteer, ShiftTemplate, DonationTemplate } from '../types';

// Generic by default: roles are created and customized dynamically by users
// Users define whichever custom roles fit their organization
export const DEFAULT_ROLES: Role[] = [];

// Shift templates start empty so users can build whatever recurring shifts their organization requires
export const DEFAULT_SHIFT_TEMPLATES: ShiftTemplate[] = [];

// Donation templates start empty so users can build their specific pickup/drop-off cadences
export const DEFAULT_DONATION_TEMPLATES: DonationTemplate[] = [];

// Volunteers roster starts empty by default ("please don't have stuff automatically filled in")
export const DEFAULT_VOLUNTEERS: Volunteer[] = [];

// Optional sample volunteers if user clicks "Load Sample Volunteers"
export const SAMPLE_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'Alex Morgan',
    roleIds: [],
    phone: '(555) 234-5678',
    email: 'alex.m@example.org',
    notes: 'Available weekday mornings and weekends.',
    active: true,
  },
  {
    id: 'vol-2',
    name: 'Jordan Smith',
    roleIds: [],
    phone: '(555) 345-6789',
    email: 'jordan.s@example.org',
    notes: 'Available afternoons and evenings.',
    active: true,
  },
  {
    id: 'vol-3',
    name: 'Taylor Reed',
    roleIds: [],
    phone: '(555) 456-7890',
    email: 'taylor.r@example.org',
    notes: 'Has reliable vehicle and flexible schedule.',
    active: true,
  },
];
