export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface Role {
  id: string;
  name: string; // Custom role name (e.g. Greeter, Shift Lead, Coordinator, etc.)
  color: string; // 'emerald' | 'teal' | 'indigo' | 'amber' | 'purple' | 'rose' | 'sky' | 'blue' | 'slate'
  description?: string;
  isStandard?: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  roleIds: string[]; // Roles they are assigned/certified for
  phone?: string;
  email?: string;
  memberId?: string; // Generic optional badge/member ID
  notes?: string;
  active: boolean;
}

export interface ShiftTemplate {
  id: string;
  name: string; // e.g. "Morning Shift", "Closing Duty"
  roleId: string;
  startTime: string; // "09:00"
  endTime: string; // "13:00"
  daysOfWeek: DayOfWeek[]; // Days this shift recurs
  workersNeeded: number; // default 1
  description?: string;
}

export interface DonationTemplate {
  id: string;
  retailerName: string; // e.g. "Target", "Costco", "Trader Joe's"
  roleId: string;
  time: string; // "12:00" or "11:30"
  daysOfWeek: DayOfWeek[]; // e.g. Target on Tue, Thu; Costco on Fri, Sat
  type: 'pickup' | 'delivery';
  notes?: string;
  contactPerson?: string;
}

export interface ScheduledShift {
  id: string;
  templateId?: string;
  name: string;
  roleId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  assignedVolunteerIds: string[];
  workersNeeded: number;
  notes?: string;
  completed?: boolean;
  googleCalendarEventId?: string;
}

export interface ScheduledDonation {
  id: string;
  templateId?: string;
  retailerName: string;
  roleId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  time: string;
  type: 'pickup' | 'delivery';
  assignedVolunteerIds: string[];
  notes?: string;
  status: 'pending' | 'received' | 'cancelled';
  googleCalendarEventId?: string;
  donationLogId?: string; // Linked logged intake details
}

export type DonationCategory =
  | 'produce' // Fresh Fruits & Vegetables
  | 'meat' // Meat, Poultry & Protein
  | 'dairy' // Dairy, Milk, Eggs & Cheese
  | 'bakery' // Bread, Baked Goods & Pastries
  | 'prepared' // Prepared & Deli Meals
  | 'pantry' // Canned, Dry Goods & Grains
  | 'frozen' // Frozen Foods
  | 'beverages' // Juices, Milk, Bottled Water
  | 'hygiene_supplies' // Cleaning, Toiletries & Supplies
  | 'other'; // Miscellaneous

export interface DonationLogItem {
  id: string;
  category: DonationCategory;
  description: string;
  weightLbs: number;
  unitCount?: number;
  unitType?: string; // "cases", "crates", "boxes", "pallets", "bags", "items"
  estimatedValue?: number; // USD estimated fair market / retail value
  storageLocation?: string; // "Walk-in Cooler", "Kitchen Freezer", "Dry Pantry", etc.
  temperatureF?: number; // Food safety temp check (e.g. 38°F)
  expirationDate?: string;
}

export interface DonationLog {
  id: string;
  scheduledDonationId?: string; // Linked scheduled pickup or delivery if applicable
  retailerOrDonor: string; // e.g. "Target", "Costco", "Trader Joe's", "Whole Foods", "Local Food Bank"
  donorContact?: string;
  date: string; // YYYY-MM-DD
  time: string; // "12:30"
  type: 'pickup' | 'delivery' | 'dropoff';
  loggedByVolunteerId?: string;
  driverOrReceiverName?: string;
  receiptNumberOrRef?: string;
  items: DonationLogItem[];
  totalWeightLbs: number;
  totalEstimatedValue: number;
  totalUnits: number;
  temperatureCheckPassed?: boolean;
  notes?: string;
  status: 'logged' | 'inspected' | 'distributed';
  createdAt: string; // ISO
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string; // ISO string
  category: 'general' | 'shift_swap' | 'donation_alert' | 'urgent';
}

