import React, { useState, useMemo } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { DonationLog, DonationCategory } from '../types';
import { DonationLogModal } from './DonationLogModal';
import { PrintDonationLogModal } from './PrintDonationLogModal';
import {
  Scale,
  DollarSign,
  Truck,
  Plus,
  Printer,
  FileSpreadsheet,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  Thermometer,
  Building2,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DONATION_CATEGORIES,
  getCategoryMeta,
  formatCurrency,
  generateDonationLogsCsv,
  downloadCsvFile,
} from '../utils/donationUtils';

export const DonationLogView: React.FC = () => {
  const {
    donationLogs,
    deleteDonationLog,
    addDonationLog,
    volunteers,
  } = useSchedule();

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DonationLog | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [donorFilter, setDonorFilter] = useState<string>('all');
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Distinct donors for filter dropdown
  const uniqueDonors = useMemo(() => {
    const set = new Set<string>();
    donationLogs.forEach((l) => set.add(l.retailerOrDonor));
    return Array.from(set).sort();
  }, [donationLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Compute start of week (Monday)
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const mondayStr = monday.toISOString().split('T')[0];

    // Compute start of month
    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    return donationLogs.filter((log) => {
      // Time filter
      if (timeFilter === 'today' && log.date !== todayStr) return false;
      if (timeFilter === 'week' && log.date < mondayStr) return false;
      if (timeFilter === 'month' && log.date < startOfMonthStr) return false;

      // Donor filter
      if (donorFilter !== 'all' && log.retailerOrDonor !== donorFilter) return false;

      // Category filter
      if (categoryFilter !== 'all') {
        const hasCategory = log.items.some((i) => i.category === categoryFilter);
        if (!hasCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDonor = log.retailerOrDonor.toLowerCase().includes(q);
        const matchNotes = log.notes?.toLowerCase().includes(q);
        const matchRef = log.receiptNumberOrRef?.toLowerCase().includes(q);
        const matchItems = log.items.some((i) =>
          i.description.toLowerCase().includes(q)
        );
        if (!matchDonor && !matchNotes && !matchRef && !matchItems) return false;
      }

      return true;
    });
  }, [donationLogs, timeFilter, donorFilter, categoryFilter, searchQuery]);

  // Aggregate statistics
  const totalWeight = useMemo(
    () => filteredLogs.reduce((sum, l) => sum + (l.totalWeightLbs || 0), 0),
    [filteredLogs]
  );
  const totalValue = useMemo(
    () => filteredLogs.reduce((sum, l) => sum + (l.totalEstimatedValue || 0), 0),
    [filteredLogs]
  );
  const totalUnits = useMemo(
    () => filteredLogs.reduce((sum, l) => sum + (l.totalUnits || 0), 0),
    [filteredLogs]
  );

  // Category breakdown weights
  const categoryStats = useMemo(() => {
    const stats: Record<string, { weight: number; count: number; value: number }> = {};
    filteredLogs.forEach((log) => {
      log.items.forEach((item) => {
        if (!stats[item.category]) {
          stats[item.category] = { weight: 0, count: 0, value: 0 };
        }
        stats[item.category].weight += item.weightLbs || 0;
        stats[item.category].count += item.unitCount || 1;
        stats[item.category].value += item.estimatedValue || 0;
      });
    });
    return stats;
  }, [filteredLogs]);

  // Top category
  const topCategory = useMemo(() => {
    let maxWeight = 0;
    let topCat: DonationCategory = 'produce';
    Object.entries(categoryStats).forEach(([cat, data]) => {
      if (data.weight > maxWeight) {
        maxWeight = data.weight;
        topCat = cat as DonationCategory;
      }
    });
    return maxWeight > 0 ? { category: topCat, weight: maxWeight } : null;
  }, [categoryStats]);

  const handleExportCsv = () => {
    const csv = generateDonationLogsCsv(filteredLogs, (id) => {
      const v = volunteers.find((vol) => vol.id === id);
      return v ? v.name : 'Unknown';
    });
    downloadCsvFile(csv, `donation-logs-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getVolunteerName = (id?: string, fallback?: string) => {
    if (!id) return fallback || 'Staff Receiver';
    const v = volunteers.find((vol) => vol.id === id);
    return v ? v.name : fallback || 'Staff Receiver';
  };

  // Sample data seeder for fast testing
  const handleSeedSampleLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    addDonationLog({
      retailerOrDonor: 'Target Store #1024',
      date: today,
      time: '11:45',
      type: 'pickup',
      loggedByVolunteerId: volunteers[0]?.id,
      driverOrReceiverName: volunteers[0]?.name || 'Alex Morgan',
      receiptNumberOrRef: 'TGT-8842',
      temperatureCheckPassed: true,
      notes: 'Cold chain verified. Pallet loaded into cooler immediately.',
      status: 'inspected',
      items: [
        {
          id: `item-1`,
          category: 'produce',
          description: 'Organic salad mixes, strawberries, broccoli, apples',
          weightLbs: 65.5,
          unitCount: 6,
          unitType: 'cases',
          estimatedValue: 145.0,
          storageLocation: 'Walk-in Cooler (Refrigerated)',
          temperatureF: 36.5,
        },
        {
          id: `item-2`,
          category: 'dairy',
          description: 'Organic whole milk, Greek yogurt, cheddar cheese',
          weightLbs: 48.0,
          unitCount: 4,
          unitType: 'crates',
          estimatedValue: 120.0,
          storageLocation: 'Walk-in Cooler (Refrigerated)',
          temperatureF: 35.8,
        },
        {
          id: `item-3`,
          category: 'bakery',
          description: 'Artisan whole grain breads, bagels, and rolls',
          weightLbs: 28.5,
          unitCount: 3,
          unitType: 'boxes',
          estimatedValue: 65.0,
          storageLocation: 'Bakery / Bread Racks',
        },
      ],
      totalWeightLbs: 142.0,
      totalUnits: 13,
      totalEstimatedValue: 330.0,
    });

    addDonationLog({
      retailerOrDonor: 'Costco Wholesale #482',
      date: yesterday,
      time: '13:15',
      type: 'pickup',
      loggedByVolunteerId: volunteers[1]?.id,
      driverOrReceiverName: volunteers[1]?.name || 'Jordan Smith',
      receiptNumberOrRef: 'CST-9201',
      temperatureCheckPassed: true,
      notes: 'Bulk meat and frozen entrees in good refrigerated transport.',
      status: 'logged',
      items: [
        {
          id: `item-4`,
          category: 'meat',
          description: 'Rotisserie chicken surplus, lean ground turkey, salmon fillets',
          weightLbs: 85.0,
          unitCount: 5,
          unitType: 'boxes',
          estimatedValue: 280.0,
          storageLocation: 'Kitchen Walk-in Freezer',
          temperatureF: 34.0,
        },
        {
          id: `item-5`,
          category: 'pantry',
          description: 'Bulk jasmine rice, canned crushed tomatoes, black beans',
          weightLbs: 120.0,
          unitCount: 8,
          unitType: 'cases',
          estimatedValue: 160.0,
          storageLocation: 'Dry Goods Pantry Shelving',
        },
      ],
      totalWeightLbs: 205.0,
      totalUnits: 13,
      totalEstimatedValue: 440.0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600 text-white">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Donation Logging & Food Rescue Tracker
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Weigh, categorize, and log retail pickups (Target, Costco, Trader Joe's) and community donations.
            Generate certified reports for tax deductions, grants, and health safety inspections.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingLog(null);
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Donation</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Print intake log or clipboard sheets"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Weight */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Weight Rescued</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-tight">
            {totalWeight.toFixed(1)} <span className="text-xs font-bold text-slate-500">lbs</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{totalUnits} containers logged</span>
          </p>
        </div>

        {/* Est. Valuation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Market Value</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 leading-tight">
            {formatCurrency(totalValue)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Tax deductible fair market valuation
          </p>
        </div>

        {/* Total Intakes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Intakes</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-tight">
            {filteredLogs.length} <span className="text-xs font-bold text-slate-500">logs</span>
          </div>
          <p className="text-[11px] text-indigo-700 font-semibold mt-1">
            Across {uniqueDonors.length} donation partners
          </p>
        </div>

        {/* Top Category */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Top Category</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          {topCategory ? (
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                <span>{getCategoryMeta(topCategory.category).icon}</span>
                <span className="truncate">
                  {getCategoryMeta(topCategory.category).label.split(' ')[0]}
                </span>
              </div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                {topCategory.weight.toFixed(1)} lbs (
                {totalWeight > 0
                  ? Math.round((topCategory.weight / totalWeight) * 100)
                  : 0}
                % of intake)
              </p>
            </div>
          ) : (
            <div>
              <div className="text-sm font-semibold text-slate-400">No data</div>
              <p className="text-[11px] text-slate-400 mt-1">Log donations to see trends</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Bar */}
      {totalWeight > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Intake Weight Distribution by Category
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {Object.keys(categoryStats).length} active categories
            </span>
          </div>

          {/* Visual Bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
            {Object.entries(categoryStats).map(([cat, data]) => {
              const meta = getCategoryMeta(cat as DonationCategory);
              const pct = (data.weight / totalWeight) * 100;
              if (pct < 1) return null;
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  title={`${meta.label}: ${data.weight.toFixed(1)} lbs (${pct.toFixed(0)}%)`}
                  className={`h-full transition-all ${
                    cat === 'produce'
                      ? 'bg-emerald-500'
                      : cat === 'meat'
                      ? 'bg-rose-500'
                      : cat === 'dairy'
                      ? 'bg-amber-400'
                      : cat === 'bakery'
                      ? 'bg-orange-400'
                      : cat === 'prepared'
                      ? 'bg-indigo-500'
                      : cat === 'pantry'
                      ? 'bg-cyan-500'
                      : cat === 'frozen'
                      ? 'bg-blue-500'
                      : 'bg-slate-400'
                  }`}
                />
              );
            })}
          </div>

          {/* Category Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {Object.entries(categoryStats).map(([cat, data]) => {
              const meta = getCategoryMeta(cat as DonationCategory);
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                    categoryFilter === cat
                      ? 'ring-2 ring-emerald-500 font-bold bg-white'
                      : 'hover:opacity-80'
                  } ${meta.bg} ${meta.text} ${meta.border}`}
                >
                  <span>{meta.icon}</span>
                  <span className="font-semibold">{meta.label.split(' ')[0]}:</span>
                  <span className="font-bold">{data.weight.toFixed(1)} lbs</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donor, item, or receipt #..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              timeFilter === 'all' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-slate-600'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-2.5 py-1 rounded transition-colors ${
              timeFilter === 'today' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-slate-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-2.5 py-1 rounded transition-colors ${
              timeFilter === 'week' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-slate-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-2.5 py-1 rounded transition-colors ${
              timeFilter === 'month' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-slate-600'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Categories</option>
            {DONATION_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>

          {/* Donor Filter */}
          <select
            value={donorFilter}
            onChange={(e) => setDonorFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Donors ({uniqueDonors.length})</option>
            {uniqueDonors.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List of Logs */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">No Donation Logs Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {donationLogs.length === 0
                ? 'No donation records have been entered yet. You can log an intake here, log from your scheduled pickups, or load demo sample data.'
                : 'No logs match your selected search or filter criteria.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setEditingLog(null);
                setIsLogModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Donation</span>
            </button>

            {donationLogs.length === 0 && (
              <button
                onClick={handleSeedSampleLogs}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-300"
              >
                Load Sample Target/Costco Logs
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogIds.has(log.id);
            const receiverName = getVolunteerName(
              log.loggedByVolunteerId,
              log.driverOrReceiverName
            );

            // Styling accent for known donors
            const lowerName = log.retailerOrDonor.toLowerCase();
            const donorBadge = lowerName.includes('target')
              ? { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
              : lowerName.includes('costco')
              ? { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
              : lowerName.includes('trader')
              ? { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' }
              : { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };

            return (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs overflow-hidden"
              >
                {/* Log Header Row */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-center shrink-0 min-w-[65px]">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {log.date.split('-').slice(1).join('/')}
                      </span>
                      <span className="block text-xs font-bold text-slate-800">{log.time}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${donorBadge.bg} ${donorBadge.text} ${donorBadge.border}`}
                        >
                          {log.retailerOrDonor}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            log.type === 'pickup'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {log.type === 'pickup' ? '🚚 Van Pickup' : '📦 Drop-off'}
                        </span>
                        {log.receiptNumberOrRef && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {log.receiptNumberOrRef}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'distributed'
                              ? 'bg-slate-100 text-slate-700'
                              : log.status === 'inspected'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {log.status === 'distributed'
                            ? 'Distributed'
                            : log.status === 'inspected'
                            ? 'Inspected'
                            : 'Logged'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <span>Receiver:</span>
                          <strong className="text-slate-800">{receiverName}</strong>
                        </span>
                        {log.temperatureCheckPassed && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Safe Cold Chain</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Totals & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {log.totalWeightLbs.toFixed(1)}{' '}
                        <span className="text-xs font-semibold text-slate-500">lbs</span>
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        {formatCurrency(log.totalEstimatedValue)}
                        <span className="text-slate-400 font-normal ml-1">
                          ({log.totalUnits} {log.totalUnits === 1 ? 'unit' : 'units'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => {
                          setEditingLog(log);
                          setIsLogModalOpen(true);
                        }}
                        title="Edit log details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete donation log from ${log.retailerOrDonor} on ${log.date}?`
                            )
                          ) {
                            deleteDonationLog(log.id);
                          }
                        }}
                        title="Delete log"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleExpand(log.id)}
                        title={isExpanded ? 'Hide item breakdown' : 'Show item breakdown'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Item Pills if not expanded */}
                {!isExpanded && log.items.length > 0 && (
                  <div className="px-4 pb-3 pt-0 flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      Items:
                    </span>
                    {log.items.map((item, idx) => {
                      const cat = getCategoryMeta(item.category);
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-700 whitespace-nowrap"
                        >
                          <span>{cat.icon}</span>
                          <span className="font-semibold truncate max-w-[140px]">
                            {item.description || cat.label.split(' ')[0]}
                          </span>
                          {item.weightLbs > 0 && (
                            <span className="text-slate-400 font-mono text-[10px]">
                              {item.weightLbs} lbs
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Item Breakdown Table */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-200 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                      <span>Itemized Receiving Roster</span>
                      <span className="text-slate-400 text-[11px] lowercase">
                        {log.items.length} {log.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3 text-right">Weight (lbs)</th>
                            <th className="py-2 px-3 text-center">Containers</th>
                            <th className="py-2 px-3 text-right">Est. Value</th>
                            <th className="py-2 px-3">Storage Location</th>
                            <th className="py-2 px-3 text-center">Temp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {log.items.map((item, idx) => {
                            const cat = getCategoryMeta(item.category);
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.bg} ${cat.text}`}
                                  >
                                    {cat.icon} {cat.label.split(' ')[0]}
                                  </span>
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-800">
                                  {item.description || 'General donation'}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  {item.weightLbs > 0 ? `${item.weightLbs} lbs` : '—'}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-600">
                                  {item.unitCount ? `${item.unitCount} ${item.unitType || 'cases'}` : '—'}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                                  {item.estimatedValue ? formatCurrency(item.estimatedValue) : '—'}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {item.storageLocation || 'General storage'}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-600">
                                  {item.temperatureF ? `${item.temperatureF}°F` : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {log.notes && (
                      <div className="text-xs bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 text-amber-900">
                        <span className="font-bold">Intake Notes: </span>
                        <span>{log.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Donation Log Entry / Edit Modal */}
      <DonationLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        initialLog={editingLog}
      />

      {/* Print Report Modal */}
      <PrintDonationLogModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        filteredLogs={filteredLogs}
      />
    </div>
  );
};
