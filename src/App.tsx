import React, { useState } from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { Header } from './components/Header';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { TemplateManager } from './components/TemplateManager';
import { VolunteerManager } from './components/VolunteerManager';
import { EmployeeChatRoom } from './components/EmployeeChatRoom';
import { GoogleCalendarView } from './components/GoogleCalendarView';
import { DonationLogView } from './components/DonationLogView';
import { SyncCalendarModal } from './components/SyncCalendarModal';
import { PrintScheduleModal } from './components/PrintScheduleModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'templates' | 'volunteers' | 'donations' | 'chat' | 'calendar'
  >('schedule');

  // Global modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'schedule' && <WeeklyScheduleView />}
        {activeTab === 'templates' && <TemplateManager />}
        {activeTab === 'volunteers' && (
          <VolunteerManager onOpenSheetsModal={() => setIsSheetsModalOpen(true)} />
        )}
        {activeTab === 'donations' && <DonationLogView />}
        {activeTab === 'chat' && <EmployeeChatRoom />}
        {activeTab === 'calendar' && (
          <GoogleCalendarView onOpenSyncModal={() => setIsSyncModalOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Shiftz • Volunteer Employee & Shift Scheduling System</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Custom Volunteer Roles</span>
            <span>•</span>
            <span>Shift Templates</span>
            <span>•</span>
            <span>Retail Donations</span>
            <span>•</span>
            <span>iOS / Android Chat Room</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SyncCalendarModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      <PrintScheduleModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ScheduleProvider>
      <AppContent />
    </ScheduleProvider>
  );
}
