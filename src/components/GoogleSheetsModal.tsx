import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import {
  fetchSpreadsheetMetadata,
  fetchSheetValues,
  extractSpreadsheetId,
  SheetMetadata,
} from '../services/googleSheets';
import { Volunteer } from '../types';
import {
  FileSpreadsheet,
  X,
  Download,
  AlertCircle,
  CheckCircle2,
  Table,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, roles, importVolunteers } = useSchedule();

  const [inputUrlOrId, setInputUrlOrId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SheetMetadata | null>(null);
  const [selectedSheetTitle, setSelectedSheetTitle] = useState<string>('');
  const [rawRows, setRawRows] = useState<string[][]>([]);

  // Column mapping indices
  const [nameCol, setNameCol] = useState<number>(0);
  const [roleCol, setRoleCol] = useState<number>(1);
  const [memberIdCol, setMemberIdCol] = useState<number>(2);
  const [phoneCol, setPhoneCol] = useState<number>(3);
  const [notesCol, setNotesCol] = useState<number>(4);

  // Success message
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFetchSheet = async () => {
    setError(null);
    setImportedCount(null);
    const sheetId = extractSpreadsheetId(inputUrlOrId);
    if (!sheetId) {
      setError('Please enter a valid Google Sheets URL or spreadsheet ID.');
      return;
    }

    setLoading(true);
    try {
      const meta = await fetchSpreadsheetMetadata(sheetId);
      setMetadata(meta);
      if (meta.sheets.length > 0) {
        const firstSheet = meta.sheets[0].title;
        setSelectedSheetTitle(firstSheet);
        const rows = await fetchSheetValues(sheetId, firstSheet);
        setRawRows(rows);
        autoDetectColumns(rows);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'Failed to load Google Sheet. Ensure your Google account has permission to view this sheet.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSheetTabChange = async (sheetTitle: string) => {
    setSelectedSheetTitle(sheetTitle);
    if (!metadata) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSheetValues(metadata.spreadsheetId, sheetTitle);
      setRawRows(rows);
      autoDetectColumns(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tab data');
    } finally {
      setLoading(false);
    }
  };

  const autoDetectColumns = (rows: string[][]) => {
    if (rows.length === 0) return;
    const header = rows[0].map((c) => c.toLowerCase());
    header.forEach((colName, index) => {
      if (colName.includes('name')) setNameCol(index);
      else if (colName.includes('role') || colName.includes('duty') || colName.includes('position'))
        setRoleCol(index);
      else if (colName.includes('badge') || colName.includes('id') || colName.includes('member'))
        setMemberIdCol(index);
      else if (colName.includes('phone') || colName.includes('cell') || colName.includes('contact'))
        setPhoneCol(index);
      else if (colName.includes('note') || colName.includes('cert') || colName.includes('comment'))
        setNotesCol(index);
    });
  };

  const loadSampleGoogleSheetData = () => {
    setError(null);
    setImportedCount(null);
    setMetadata({
      spreadsheetId: 'sample-volunteer-roster',
      title: 'Volunteer Team Roster (Sample Sheet)',
      sheets: [{ sheetId: 0, title: 'Volunteer Roster' }],
    });
    setSelectedSheetTitle('Volunteer Roster');

    const sampleRows = [
      ['Full Name', 'Assigned Roles', 'Badge / ID', 'Phone Number', 'Notes / Skills'],
      ['Alex Morgan', 'Shift Lead', 'VOL-101', '(555) 234-5678', 'Available weekday mornings, team leader'],
      ['Jordan Smith', 'Coordinator', 'VOL-102', '(555) 345-6789', 'Available afternoons & weekends'],
      ['Taylor Reed', 'Volunteer', 'VOL-103', '(555) 456-7890', 'Flexible schedule, bilingual'],
      ['Sam Casey', 'Assistant', 'VOL-104', '(555) 567-8901', 'Experienced helper, punctual'],
      ['Morgan Bailey', 'Specialist', 'VOL-105', '(555) 678-9012', 'Restocking and supplies support'],
    ];

    setRawRows(sampleRows);
    setNameCol(0);
    setRoleCol(1);
    setMemberIdCol(2);
    setPhoneCol(3);
    setNotesCol(4);
  };

  const parseVolunteersFromRows = (): Omit<Volunteer, 'id'>[] => {
    if (rawRows.length <= 1) return [];

    const dataRows = rawRows.slice(1);
    const parsed: Omit<Volunteer, 'id'>[] = [];

    dataRows.forEach((row) => {
      const rawName = row[nameCol]?.trim();
      if (!rawName) return;

      const rawRole = row[roleCol] || '';
      const rawMemberId = row[memberIdCol] || '';
      const rawPhone = row[phoneCol] || '';
      const rawNotes = row[notesCol] || '';

      // Match roles dynamically by configured role names
      const matchedRoleIds: string[] = [];
      roles.forEach((r) => {
        if (
          r.name &&
          (rawRole.toLowerCase().includes(r.name.toLowerCase()) ||
            r.name.toLowerCase().includes(rawRole.toLowerCase()))
        ) {
          matchedRoleIds.push(r.id);
        }
      });

      parsed.push({
        name: rawName,
        roleIds: matchedRoleIds,
        memberId: rawMemberId.trim(),
        phone: rawPhone.trim(),
        notes: rawNotes.trim(),
        active: true,
      });
    });

    return parsed;
  };

  const handleExecuteImport = () => {
    const list = parseVolunteersFromRows();
    if (list.length === 0) {
      setError('No valid rows found to import.');
      return;
    }

    importVolunteers(list);
    setImportedCount(list.length);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const previewVolunteers = parseVolunteersFromRows();
  const headers = rawRows.length > 0 ? rawRows[0] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900">Import Volunteers from Google Sheets</h3>
              <p className="text-xs text-slate-500">
                Connect your spreadsheet to sync volunteer names, assigned roles, and contact info.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {!user && (
            <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-xs text-indigo-900">Sign in with Google to read your sheets</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Connect your Google account with permission to access your volunteer spreadsheet.
                </p>
              </div>
              <button
                onClick={() => loginWithGoogle()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {/* Input field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Google Sheet URL or Spreadsheet ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrlOrId}
                onChange={(e) => setInputUrlOrId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                onClick={handleFetchSheet}
                disabled={loading || !inputUrlOrId.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{loading ? 'Fetching...' : 'Fetch Sheet'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Paste any Google Sheets link that your connected Google account has read access to.</span>
              <button
                type="button"
                onClick={loadSampleGoogleSheetData}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test with Sample Roster</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {importedCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Successfully imported {importedCount} volunteers into Shiftz!</span>
            </div>
          )}

          {/* Loaded Sheet Controls & Column Mapping */}
          {metadata && rawRows.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {metadata.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Found {rawRows.length - 1} data rows. Verify the column mapping below.
                  </p>
                </div>

                {metadata.sheets.length > 1 && (
                  <select
                    value={selectedSheetTitle}
                    onChange={(e) => handleSheetTabChange(e.target.value)}
                    className="text-xs border border-slate-300 rounded p-1.5 bg-slate-50"
                  >
                    {metadata.sheets.map((s) => (
                      <option key={s.sheetId} value={s.title}>
                        Tab: {s.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Column Mapping Selectors */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                  Map Sheet Columns to Volunteer Fields:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Full Name</label>
                    <select
                      value={nameCol}
                      onChange={(e) => setNameCol(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                    >
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Assigned Roles</label>
                    <select
                      value={roleCol}
                      onChange={(e) => setRoleCol(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                    >
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Badge / Member ID</label>
                    <select
                      value={memberIdCol}
                      onChange={(e) => setMemberIdCol(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                    >
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Phone Number</label>
                    <select
                      value={phoneCol}
                      onChange={(e) => setPhoneCol(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                    >
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">Notes / Skills</label>
                    <select
                      value={notesCol}
                      onChange={(e) => setNotesCol(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                    >
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview parsed volunteers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Roster Preview ({previewVolunteers.length} workers ready to import)
                  </h5>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Roles</th>
                        <th className="p-2">Badge / ID</th>
                        <th className="p-2">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewVolunteers.map((vol, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{vol.name}</td>
                          <td className="p-2 text-slate-600">
                            {vol.roleIds
                              .map((rid) => roles.find((r) => r.id === rid)?.name)
                              .filter(Boolean)
                              .join(', ') || 'Default Role'}
                          </td>
                          <td className="p-2 text-slate-500">{vol.memberId || '-'}</td>
                          <td className="p-2 text-slate-500">{vol.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {metadata && previewVolunteers.length > 0 && (
            <button
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <span>Import {previewVolunteers.length} Volunteers into Shiftz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
