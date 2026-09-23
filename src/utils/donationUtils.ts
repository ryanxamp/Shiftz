import { DonationCategory, DonationLog, DonationLogItem } from '../types';

export interface CategoryMeta {
  key: DonationCategory;
  label: string;
  icon: string;
  bg: string;
  text: string;
  border: string;
}

export const DONATION_CATEGORIES: CategoryMeta[] = [
  {
    key: 'produce',
    label: 'Produce (Fresh Fruits & Veggies)',
    icon: '🥬',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    key: 'meat',
    label: 'Meat, Poultry & Protein',
    icon: '🥩',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  {
    key: 'dairy',
    label: 'Dairy, Eggs & Milk',
    icon: '🧀',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  {
    key: 'bakery',
    label: 'Bakery & Bread',
    icon: '🍞',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    key: 'prepared',
    label: 'Prepared Meals & Deli',
    icon: '🍲',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  {
    key: 'pantry',
    label: 'Dry Goods, Canned & Pantry',
    icon: '🥫',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  {
    key: 'frozen',
    label: 'Frozen Goods',
    icon: '❄️',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  {
    key: 'beverages',
    label: 'Beverages & Juices',
    icon: '🧃',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  {
    key: 'hygiene_supplies',
    label: 'Hygiene, Cleaning & Supplies',
    icon: '🧼',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  {
    key: 'other',
    label: 'Other / Miscellaneous',
    icon: '📦',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
];

export function getCategoryMeta(category: DonationCategory): CategoryMeta {
  return (
    DONATION_CATEGORIES.find((c) => c.key === category) || {
      key: 'other',
      label: 'Other',
      icon: '📦',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
    }
  );
}

export const COMMON_STORAGE_LOCATIONS = [
  'Walk-in Cooler (Refrigerated)',
  'Kitchen Walk-in Freezer',
  'Dry Goods Pantry Shelving',
  'Bakery / Bread Racks',
  'Kitchen Prep Station',
  'Basement Storage Room',
  'Immediate Service / Kitchen Line',
];

export const COMMON_UNIT_TYPES = [
  'cases',
  'crates',
  'boxes',
  'pallets',
  'bags',
  'cartons',
  'flats',
  'items',
  'lbs',
];

export function formatWeight(weightLbs: number): string {
  if (!weightLbs && weightLbs !== 0) return '0 lbs';
  return `${Number(weightLbs.toFixed(1))} lbs`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

/**
 * Generate CSV content for exporting donation logs
 */
export function generateDonationLogsCsv(logs: DonationLog[], getVolunteerName?: (id?: string) => string): string {
  const headers = [
    'Log ID',
    'Date',
    'Time',
    'Retailer / Donor',
    'Type',
    'Receiver / Volunteer',
    'Total Weight (lbs)',
    'Total Units',
    'Total Est Value ($)',
    'Category',
    'Item Description',
    'Item Weight (lbs)',
    'Item Units',
    'Item Est Value ($)',
    'Storage Location',
    'Temp (°F)',
    'Temp Passed',
    'Receipt / Ref #',
    'Notes',
    'Status',
  ];

  const rows: string[][] = [];

  logs.forEach((log) => {
    const receiver = log.loggedByVolunteerId && getVolunteerName
      ? getVolunteerName(log.loggedByVolunteerId)
      : log.driverOrReceiverName || 'Unassigned';

    if (log.items.length === 0) {
      rows.push([
        log.id,
        log.date,
        log.time,
        `"${log.retailerOrDonor.replace(/"/g, '""')}"`,
        log.type,
        `"${receiver.replace(/"/g, '""')}"`,
        log.totalWeightLbs.toString(),
        log.totalUnits.toString(),
        log.totalEstimatedValue.toFixed(2),
        'N/A',
        'No itemized details',
        '0',
        '0',
        '0.00',
        'N/A',
        'N/A',
        log.temperatureCheckPassed ? 'YES' : 'NO',
        `"${(log.receiptNumberOrRef || '').replace(/"/g, '""')}"`,
        `"${(log.notes || '').replace(/"/g, '""')}"`,
        log.status,
      ]);
    } else {
      log.items.forEach((item, idx) => {
        const catMeta = getCategoryMeta(item.category);
        rows.push([
          idx === 0 ? log.id : '',
          idx === 0 ? log.date : '',
          idx === 0 ? log.time : '',
          idx === 0 ? `"${log.retailerOrDonor.replace(/"/g, '""')}"` : '',
          idx === 0 ? log.type : '',
          idx === 0 ? `"${receiver.replace(/"/g, '""')}"` : '',
          idx === 0 ? log.totalWeightLbs.toString() : '',
          idx === 0 ? log.totalUnits.toString() : '',
          idx === 0 ? log.totalEstimatedValue.toFixed(2) : '',
          `"${catMeta.label.replace(/"/g, '""')}"`,
          `"${item.description.replace(/"/g, '""')}"`,
          item.weightLbs.toString(),
          item.unitCount ? `${item.unitCount} ${item.unitType || 'units'}` : '',
          (item.estimatedValue || 0).toFixed(2),
          `"${(item.storageLocation || '').replace(/"/g, '""')}"`,
          item.temperatureF ? `${item.temperatureF}°F` : 'N/A',
          log.temperatureCheckPassed ? 'YES' : 'NO',
          idx === 0 ? `"${(log.receiptNumberOrRef || '').replace(/"/g, '""')}"` : '',
          idx === 0 ? `"${(log.notes || '').replace(/"/g, '""')}"` : '',
          idx === 0 ? log.status : '',
        ]);
      });
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCsvFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
