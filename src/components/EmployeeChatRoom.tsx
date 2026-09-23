import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { RoleBadge } from './RoleBadge';
import { formatTimeRange, formatTime12h, getWeekDays } from '../utils/dateUtils';
import {
  MessageSquare,
  Send,
  Smartphone,
  ExternalLink,
  Share2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Truck,
  UtensilsCrossed,
  Sparkles,
  QrCode,
  Settings,
  HelpCircle,
  Copy,
} from 'lucide-react';

export const EmployeeChatRoom: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChatMessages,
    googleChatSpaceUrl,
    setGoogleChatSpaceUrl,
    volunteers,
    roles,
    scheduledShifts,
    scheduledDonations,
    currentWeekMonday,
  } = useSchedule();

  const [messageText, setMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'general' | 'shift_swap' | 'donation_alert' | 'urgent'
  >('general');
  const [senderName, setSenderName] = useState(
    volunteers.length > 0 ? volunteers[0].name : 'Shift Coordinator'
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isSpaceConfigOpen, setIsSpaceConfigOpen] = useState(false);
  const [spaceInputUrl, setSpaceInputUrl] = useState(googleChatSpaceUrl);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Send new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    // Detect sender role
    const matchedVol = volunteers.find((v) => v.name === senderName);
    const primaryRole = matchedVol && matchedVol.roleIds.length > 0
      ? roles.find((r) => r.id === matchedVol.roleIds[0])?.name
      : 'Coordinator';

    addChatMessage({
      senderName: senderName || 'Volunteer',
      senderRole: primaryRole,
      content: messageText.trim(),
      category: selectedCategory,
    });

    setMessageText('');
  };

  // Broadcast Today's Schedule to Chat
  const handleBroadcastTodaySchedule = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayShifts = scheduledShifts.filter((s) => s.date === todayStr);
    const todayDonations = scheduledDonations.filter((d) => d.date === todayStr);

    let summaryText = `📢 DAILY SCHEDULE UPDATE (${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })}):\n`;

    if (todayShifts.length === 0 && todayDonations.length === 0) {
      summaryText += '• No duties scheduled for today.\n';
    } else {
      if (todayShifts.length > 0) {
        summaryText += '\n📋 Scheduled Shifts:\n';
        todayShifts.forEach((s) => {
          const names = s.assignedVolunteerIds
            .map((id) => volunteers.find((v) => v.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'Unassigned';
          summaryText += `  • ${s.name} (${formatTimeRange(s.startTime, s.endTime)}): ${names}\n`;
        });
      }

      if (todayDonations.length > 0) {
        summaryText += '\n🚚 Retail Donations:\n';
        todayDonations.forEach((d) => {
          const names = d.assignedVolunteerIds
            .map((id) => volunteers.find((v) => v.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'Unassigned';
          summaryText += `  • ${d.retailerName} (${formatTime12h(d.time)}): ${names}\n`;
        });
      }
    }

    addChatMessage({
      senderName: 'Schedule Bot',
      senderRole: 'Coordinator',
      content: summaryText,
      category: 'urgent',
    });
  };

  const handleSaveSpaceUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleChatSpaceUrl(spaceInputUrl.trim());
    setIsSpaceConfigOpen(false);
  };

  const handleCopyInviteLink = () => {
    const link =
      googleChatSpaceUrl ||
      'https://chat.google.com/room/AAAAShiftzTeamSpace';
    navigator.clipboard.writeText(link);
    setCopyFeedback('Google Chat invite link copied to clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Filter messages
  const filteredMessages = chatMessages.filter((msg) => {
    if (filterCategory === 'all') return true;
    return msg.category === filterCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Mobile Google Chat Connection */}
      <div className="bg-linear-to-r from-emerald-700 via-teal-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-white/20 tracking-wider">
                iOS & Android Ready
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-200">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile Google Chat App
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Employee Chat Room & Mobile Team Space
            </h2>
            <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
              Stay in touch with your team on the web, iPhone, or Android. Workers can request shift coverage, share retail pickup updates, and get instant push notifications via Google Chat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {googleChatSpaceUrl ? (
              <a
                href={googleChatSpaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-emerald-900 hover:bg-slate-100 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Open in Google Chat App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={() => setIsSpaceConfigOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-emerald-900 hover:bg-slate-100 shadow-md transition-all"
              >
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>Connect Google Chat Space</span>
              </button>
            )}

            <button
              onClick={handleCopyInviteLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
              title="Copy link to join on iOS & Android"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Share Invite Link</span>
            </button>

            <button
              onClick={() => setIsSpaceConfigOpen(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Google Chat Space Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {copyFeedback && (
          <div className="mt-4 p-2.5 rounded-lg bg-white/20 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{copyFeedback}</span>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Mobile App Setup & Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Schedule Broadcast */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Coordinator Shortcuts
            </h3>
            <button
              onClick={handleBroadcastTodaySchedule}
              className="w-full text-left p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="block font-bold">Broadcast Today's Schedule</span>
                <span className="text-[10px] text-emerald-700 block">
                  Post shifts & assignments into chat
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('shift_swap');
                setMessageText(
                  '🔄 Shift Coverage Needed: Anyone available to take an upcoming shift this week? Please reply below.'
                );
              }}
              className="w-full text-left p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4 text-indigo-700 shrink-0" />
              <div>
                <span className="block font-bold">Request Shift Coverage</span>
                <span className="text-[10px] text-indigo-700 block">
                  Template for shift swap requests
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('donation_alert');
                setMessageText(
                  '🚚 Retail Donation Arrival: Retail donation van has arrived. Need volunteers to assist with receiving.'
                );
              }}
              className="w-full text-left p-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Truck className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="block font-bold">Donation Drop Alert</span>
                <span className="text-[10px] text-teal-700 block">
                  Notify team of incoming retail boxes
                </span>
              </div>
            </button>
          </div>

          {/* iOS & Android Mobile Apps Info Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>How Mobile App Works</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Workers can download the free <strong>Google Chat</strong> app on iOS (App Store) and Android (Google Play).
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                <span className="font-semibold text-slate-800">1. iOS (iPhone/iPad)</span>
                <span className="text-[10px] text-slate-500 font-mono">App Store</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                <span className="font-semibold text-slate-800">2. Android</span>
                <span className="text-[10px] text-slate-500 font-mono">Google Play</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Team members get real-time mobile push notifications whenever a shift swap or announcement is sent!
            </p>
          </div>
        </div>

        {/* Right Column: In-App Message Stream */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Stream Header & Filters */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Volunteer Employee Team Stream</h3>
              <span className="text-xs text-slate-400">({chatMessages.length} messages)</span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterCategory('shift_swap')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  filterCategory === 'shift_swap'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                🔄 Swaps
              </button>
              <button
                onClick={() => setFilterCategory('donation_alert')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  filterCategory === 'donation_alert'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                🚚 Donations
              </button>
              <button
                onClick={() => setFilterCategory('urgent')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  filterCategory === 'urgent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                🚨 Announcements
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No messages in this filter</p>
                <p className="text-[11px] text-slate-400">Post a message below to start the conversation</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isScheduleBot = msg.senderName === 'Schedule Bot';
                const isSwap = msg.category === 'shift_swap';
                const isDonation = msg.category === 'donation_alert';
                const isUrgent = msg.category === 'urgent';

                return (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-3.5 border transition-all ${
                      isUrgent
                        ? 'bg-amber-50/70 border-amber-200'
                        : isSwap
                        ? 'bg-indigo-50/50 border-indigo-200'
                        : isDonation
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{msg.senderName}</span>
                        {msg.senderRole && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {msg.senderRole}
                          </span>
                        )}
                        {isSwap && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                            🔄 Shift Coverage
                          </span>
                        )}
                        {isDonation && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                            🚚 Retail Pickup
                          </span>
                        )}
                        {isUrgent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                            🚨 Announcement
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3.5 border-t border-slate-200 bg-white space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              {/* Sender Selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold text-[11px]">Posting as:</span>
                <select
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded font-medium bg-slate-50"
                >
                  <option value="Shift Coordinator">Shift Coordinator</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag / Category Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold text-[11px]">Type:</span>
                <div className="flex rounded border border-slate-300 overflow-hidden text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('general')}
                    className={`px-2 py-0.5 ${
                      selectedCategory === 'general' ? 'bg-slate-800 text-white font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('shift_swap')}
                    className={`px-2 py-0.5 ${
                      selectedCategory === 'shift_swap' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    Shift Swap
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('donation_alert')}
                    className={`px-2 py-0.5 ${
                      selectedCategory === 'donation_alert' ? 'bg-teal-600 text-white font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    Donation
                  </button>
                </div>
              </div>
            </div>

            {/* Input & Send Button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  selectedCategory === 'shift_swap'
                    ? 'Need someone to cover my Thursday shift...'
                    : selectedCategory === 'donation_alert'
                    ? 'Retail donation is loaded and ready at dock...'
                    : 'Write a message to team or post an update...'
                }
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: Google Chat Space Configuration */}
      {isSpaceConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Google Chat Space Configuration</h3>
              </div>
              <button
                onClick={() => setIsSpaceConfigOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSpaceUrl} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Connect your team's Google Chat Space so volunteers can open it directly in the <strong>Google Chat app on iOS and Android</strong>.
              </p>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Chat Space URL / Room Link
                </label>
                <input
                  type="text"
                  value={spaceInputUrl}
                  onChange={(e) => setSpaceInputUrl(e.target.value)}
                  placeholder="https://chat.google.com/room/... or https://mail.google.com/chat/u/0/#chat/space/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: In Google Chat, create a space like "Shiftz Volunteer Team", click the Space title &gt; "Copy link to space", and paste it here.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800">iOS & Android App Instructions for Volunteers:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Install <strong>Google Chat</strong> from the App Store (iOS) or Play Store (Android).</li>
                  <li>Sign in with their Google account.</li>
                  <li>Tap the invite link or button to join the team chat room.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSpaceConfigOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Save Space Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
