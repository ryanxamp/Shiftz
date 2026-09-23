import React, { useState } from 'react';
import { DonationLog } from '../types';
import { useSchedule } from '../context/ScheduleContext';
import {
  Printer,
  X,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  Scale,
  ClipboardList,
} from 'lucide-react';
import {
  formatCurrency,
  getCategoryMeta,
  generateDonationLogsCsv,
  downloadCsvFile,
} from '../utils/donationUtils';

interface PrintDonationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredLogs: DonationLog[];
}

export const PrintDonationLogModal: React.FC<PrintDonationLogModalProps> = ({
  isOpen,
  onClose,
  filteredLogs,
}) => {
  const { volunteers } = useSchedule();
  const [printMode, setPrintMode] = useState<'report' | 'blank_sheet'>('report');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalWeight = filteredLogs.reduce((sum, l) => sum + (l.totalWeightLbs || 0), 0);
  const totalValue = filteredLogs.reduce((sum, l) => sum + (l.totalEstimatedValue || 0), 0);
  const totalUnits = filteredLogs.reduce((sum, l) => sum + (l.totalUnits || 0), 0);

  const getReceiverName = (log: DonationLog) => {
    if (log.loggedByVolunteerId) {
      const v = volunteers.find((vol) => vol.id === log.loggedByVolunteerId);
      if (v) return v.name;
    }
    return log.driverOrReceiverName || 'Staff';
  };

  const handleExportCsv = () => {
    const csv = generateDonationLogsCsv(filteredLogs, (id) => {
      const v = volunteers.find((vol) => vol.id === id);
      return v ? v.name : 'Unknown';
    });
    downloadCsvFile(csv, `donation-log-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-4 max-h-[94vh] flex flex-col">
        {/* Controls Header (Hidden during browser printing) */}
        <div className="print:hidden bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Print Donation Intake & Valuation Records
              </h3>
              <p className="text-xs text-slate-300">
                Official records for 501(c)(3) tax deductions, food safety compliance, and physical dock clipboards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Download spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector (Hidden during browser printing) */}
        <div className="print:hidden bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-600">Document Type:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintMode('report')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  printMode === 'report'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Intake Log & Tax Valuation Summary ({filteredLogs.length} entries)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('blank_sheet')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  printMode === 'blank_sheet'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blank Receiving Scale & Dock Sheet (For Clipboard)
              </button>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Use standard 8.5 x 11" Letter format
          </span>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white print:p-0 print:m-0">
          {printMode === 'report' ? (
            /* Mode 1: Official Donation Intake Report */
            <div className="space-y-6 text-slate-900">
              {/* Organization Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                    Official Food Donation Intake & Weight Log
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Shiftz Volunteer & Food Rescue Operations • Official Receiving Record
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded border border-emerald-800 text-emerald-900 bg-emerald-50">
                    Audit Certified
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Total Records: {filteredLogs.length}
                  </p>
                </div>
              </div>

              {/* KPI Summary Banner */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Rescued Weight
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {totalWeight.toFixed(1)} lbs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Containers / Units
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {totalUnits} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Est. Fair Market Valuation
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-800">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800">
                      <th className="py-2 px-2 font-bold">Date / Time</th>
                      <th className="py-2 px-2 font-bold">Donor / Retailer</th>
                      <th className="py-2 px-2 font-bold">Type</th>
                      <th className="py-2 px-2 font-bold">Category & Items</th>
                      <th className="py-2 px-2 font-bold text-right">Weight</th>
                      <th className="py-2 px-2 font-bold text-right">Est. Value</th>
                      <th className="py-2 px-2 font-bold">Receiver</th>
                      <th className="py-2 px-2 font-bold text-center">Temp Safe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">
                          No donation logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2 whitespace-nowrap font-medium text-slate-800">
                            {log.date}
                            <span className="block text-[10px] text-slate-400">{log.time}</span>
                          </td>
                          <td className="py-2 px-2 font-bold text-slate-900">
                            {log.retailerOrDonor}
                            {log.receiptNumberOrRef && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Ref: {log.receiptNumberOrRef}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 uppercase text-[10px] font-bold text-slate-600">
                            {log.type === 'pickup' ? 'Van Pickup' : 'Drop-off'}
                          </td>
                          <td className="py-2 px-2">
                            {log.items.length === 0 ? (
                              <span className="text-slate-400 text-[11px]">—</span>
                            ) : (
                              <div className="space-y-0.5">
                                {log.items.map((item, i) => {
                                  const cat = getCategoryMeta(item.category);
                                  return (
                                    <div key={i} className="text-[11px] flex items-center gap-1.5">
                                      <span className="font-semibold text-slate-700">
                                        {cat.icon} {item.description || cat.label.split(' ')[0]}
                                      </span>
                                      {item.weightLbs > 0 && (
                                        <span className="text-slate-400 text-[10px]">
                                          ({item.weightLbs} lbs)
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right font-extrabold text-slate-900 whitespace-nowrap">
                            {log.totalWeightLbs.toFixed(1)} lbs
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-emerald-800 whitespace-nowrap">
                            {formatCurrency(log.totalEstimatedValue)}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap text-slate-700">
                            {getReceiverName(log)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {log.temperatureCheckPassed ? (
                              <span className="inline-block text-[10px] font-bold text-emerald-700">
                                PASS
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-bold text-amber-600">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold text-xs">
                      <td colSpan={4} className="py-2 px-2 uppercase tracking-wider text-slate-700">
                        Total Sum:
                      </td>
                      <td className="py-2 px-2 text-right font-extrabold text-slate-900">
                        {totalWeight.toFixed(1)} lbs
                      </td>
                      <td className="py-2 px-2 text-right font-extrabold text-emerald-900">
                        {formatCurrency(totalValue)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures Section */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700 mt-8">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 h-8"></div>
                  <span className="font-bold block">Receiving Coordinator / Shift Lead Signature</span>
                  <span className="text-[10px] text-slate-400">Date: ______________</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 h-8"></div>
                  <span className="font-bold block">Program Director / Food Safety Verification</span>
                  <span className="text-[10px] text-slate-400">Date: ______________</span>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Blank Dock & Kitchen Scale Log Sheet */
            <div className="space-y-4 text-slate-900">
              <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">
                    Daily Receiving Scale & Dock Intake Sheet
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Shiftz Volunteer & Facility Operations • Physical Clipboard Roster
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-slate-700 block">Date: __________________</span>
                  <span className="text-slate-500 block text-[10px]">Supervisor: ________________</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-400">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-400 text-slate-900 font-bold">
                      <th className="py-2 px-2 border-r border-slate-300 w-16">Time</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-36">Donor / Retailer</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-16">Type</th>
                      <th className="py-2 px-2 border-r border-slate-300">Item Description / Category</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-20 text-right">Scale Lbs</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-16 text-center">Cases</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-16 text-center">Temp °F</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-24">Storage Loc</th>
                      <th className="py-2 px-2 w-16 text-center">Initials</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 14 }).map((_, idx) => (
                      <tr key={idx} className="border-b border-slate-300 h-9">
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="border-r border-slate-300 py-1.5 px-2 text-[10px] text-slate-300 text-center">
                          P / D
                        </td>
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="border-r border-slate-300 py-1.5 px-2"></td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-slate-600">
                <span>* Keep all chilled items below 41°F. Report temperature deviations immediately.</span>
                <span className="font-semibold">Shiftz Facilities Management</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
