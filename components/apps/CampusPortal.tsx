'use client';

// ============================================================
// Campus OS — Campus Portal
// Browser-like shell connected to MongoDB for student data
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, BarChart2, ClipboardList,
  ChevronLeft, ChevronRight, RotateCcw, Lock, BookOpen,
  AlertTriangle, LogOut, Download, CheckCircle, CreditCard, GraduationCap
} from 'lucide-react';
import { useCampusPortalStore } from '@/stores/useCampusPortalStore';
import { useUser } from '@clerk/nextjs';

const TABS = [
  { id: 'profile', label: 'Profile', icon: <User size={15} /> },
  { id: 'grades', label: 'Grades', icon: <ClipboardList size={15} /> },
  { id: 'attendance', label: 'Attendance', icon: <BarChart2 size={15} /> },
  { id: 'fees', label: 'Fees & Receipts', icon: <BookOpen size={15} /> },
  { id: 'registration', label: 'Registration', icon: <ClipboardList size={15} /> },
  { id: 'subjects', label: 'Subjects', icon: <BookOpen size={15} /> },
  { id: 'timetable', label: 'Timetable', icon: <Calendar size={15} /> },
];

export default function CampusPortal() {
  const { user } = useUser();
  const {
    isAuthenticated, currentUSN, activeTab, isLoading, error,
    profile, grades, attendance, subjects, timetable, feeRecord, registration,
    setActiveTab, login, logout, fetchAllData, submitRegistration
  } = useCampusPortalStore();

  const [loginUsn, setLoginUsn] = useState('2BA23CS001'); // Default for demo (Vikas Kannur)
  const [loginPwd, setLoginPwd] = useState('campus2026');
  
  // Registration state
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Load data on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  // Initial auto-login check based on Clerk email (simulate SSO)
  useEffect(() => {
    if (user && !isAuthenticated) {
      // In a real scenario, we'd map Clerk user to a USN or verify session token.
      // For this demo, we'll just show the login gate unless they log in manually.
    }
  }, [user, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginUsn, loginPwd);
  };

  // Browser Chrome Shell
  return (
    <div className="flex flex-col h-full bg-[#050a18] text-[#e2e8f0] font-['Inter',sans-serif] overflow-hidden rounded-b-xl">
      {/* ── Browser Chrome ── */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[#0a0f1e] border-b border-[rgba(51,65,85,0.4)] flex-shrink-0">
        <div className="flex gap-1.5">
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-[#94a3b8] transition-colors"><ChevronLeft size={16} /></button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-[#94a3b8] transition-colors opacity-50"><ChevronRight size={16} /></button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-[#94a3b8] transition-colors"><RotateCcw size={14} /></button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-1.5 w-full max-w-xl text-xs text-[#94a3b8] shadow-inner">
            <Lock size={12} className="text-[#34d399]" />
            <span className="truncate">https://portal.bec.edu.in/dashboard{isAuthenticated ? `/${activeTab}` : '/login'}</span>
          </div>
        </div>

        {isAuthenticated && profile && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#e2e8f0]">{profile.name.split(' ')[0]}</div>
              <div className="text-[10px] text-[#475569]">{profile.usn}</div>
            </div>
            <button onClick={logout} className="w-8 h-8 rounded-full bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center transition-colors">
              <LogOut size={14} className="text-[#f43f5e]" />
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Loading overlay */}
        {/* Removed global loading overlay in favor of inline skeletons */}

        {!isAuthenticated ? (
          /* ── Login Gate ── */
          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl border border-white/5"
            >
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] flex items-center justify-center">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Campus Portal</h2>
                  <p className="text-xs text-[#94a3b8]">Student ERP System</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">University Seat Number (USN)</label>
                  <input
                    type="text"
                    value={loginUsn}
                    onChange={(e) => setLoginUsn(e.target.value.toUpperCase())}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#60a5fa] transition-colors uppercase"
                    placeholder="e.g. 2BA23IS001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#60a5fa] transition-colors"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Authenticating...' : 'Secure Login'}
                </button>
              </form>
              
              <div className="mt-6 text-center text-[10px] text-[#475569]">
                Protected by Campus OS Security Layer
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Dashboard Layout ── */
          <>
            {/* Sidebar */}
            <div className="w-52 flex flex-col gap-1 p-3 border-r border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.6)] flex-shrink-0">
              <div className="mb-4 px-2">
                <div className="text-xs font-bold text-[#60a5fa] tracking-wider uppercase mb-2">Main Menu</div>
                <div className="space-y-1">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                        activeTab === t.id
                          ? 'bg-[#60a5fa]/20 text-[#60a5fa] font-medium shadow-sm'
                          : 'text-[#94a3b8] hover:bg-white/5 hover:text-[#e2e8f0]'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent">
              {isLoading && !profile ? (
                <div className="animate-pulse space-y-6 max-w-4xl">
                   <div className="h-8 bg-[#334155]/50 rounded w-1/4"></div>
                   <div className="h-48 bg-[#334155]/50 rounded-2xl"></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="h-40 bg-[#334155]/50 rounded-xl"></div>
                     <div className="h-40 bg-[#334155]/50 rounded-xl"></div>
                   </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  
                  {/* ── PROFILE TAB ── */}
                  {activeTab === 'profile' && profile && (
                    <div className="max-w-4xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Student Profile</h2>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium">Active Status</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Info Card */}
                        <div className="md:col-span-2 glass rounded-2xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#60a5fa]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] p-[2px]">
                              <div className="w-full h-full rounded-2xl bg-[#0f172a] flex items-center justify-center text-4xl">
                                👨‍🎓
                              </div>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">{profile.name}</h3>
                              <p className="text-[#94a3b8] font-medium">{profile.departmentFull}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="px-2 py-1 bg-[#1e293b] rounded-lg text-xs font-medium border border-[#334155]">{profile.usn}</span>
                                <span className="text-xs text-[#475569]">Semester {profile.semester} • Section {profile.section}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 relative z-10">
                            <div>
                              <div className="text-[10px] uppercase text-[#475569] font-bold mb-1">Email</div>
                              <div className="text-sm font-medium">{profile.email}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-[#475569] font-bold mb-1">Phone</div>
                              <div className="text-sm font-medium">{profile.phone}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-[#475569] font-bold mb-1">Admission ID</div>
                              <div className="text-sm font-medium">{profile.admissionId}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-[#475569] font-bold mb-1">CSN</div>
                              <div className="text-sm font-medium">{profile.csn}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-[#475569] font-bold mb-1">Entry Type</div>
                              <div className="text-sm font-medium">{profile.entryType}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-[#475569] font-bold mb-1">Category</div>
                              <div className="text-sm font-medium">{profile.paymentCategory}</div>
                            </div>
                          </div>
                        </div>

                        {/* CGPA Card */}
                        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#34d399]/10 rounded-full blur-2xl pointer-events-none" />
                          
                          <div className="text-[10px] uppercase text-[#94a3b8] font-bold tracking-widest mb-4">Current CGPA</div>
                          
                          <div className="relative mb-4">
                            <svg className="w-32 h-32 transform -rotate-90">
                              <circle cx="64" cy="64" r="56" className="stroke-[#1e293b]" strokeWidth="12" fill="none" />
                              <motion.circle
                                cx="64" cy="64" r="56"
                                className="stroke-[#34d399]"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray="351.8"
                                initial={{ strokeDashoffset: 351.8 }}
                                animate={{ strokeDashoffset: 351.8 - (351.8 * (profile.cgpa / 10)) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-black text-white">{profile.cgpa.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-[#34d399] font-medium bg-[#34d399]/10 px-3 py-1 rounded-full">
                            First Class with Distinction
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── GRADES TAB ── */}
                  {activeTab === 'grades' && (
                    <div className="max-w-5xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Academic Grades</h2>
                        <div className="glass px-4 py-1.5 rounded-lg flex items-center gap-2">
                          <span className="text-sm text-[#94a3b8]">Semester:</span>
                          <select className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer">
                            <option value="6">Semester 6</option>
                            <option value="5">Semester 5</option>
                          </select>
                        </div>
                      </div>

                      <div className="glass rounded-2xl overflow-hidden border border-[#334155]/50">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#0f172a]/80 text-[#94a3b8] text-[11px] uppercase font-bold tracking-wider">
                            <tr>
                              <th className="px-5 py-4 border-b border-[#334155]/50">Course Code & Title</th>
                              <th className="px-5 py-4 border-b border-[#334155]/50 text-center">Credits</th>
                              <th className="px-5 py-4 border-b border-[#334155]/50 text-center">CIE <span className="opacity-50">(50)</span></th>
                              <th className="px-5 py-4 border-b border-[#334155]/50 text-center">SEE <span className="opacity-50">(50)</span></th>
                              <th className="px-5 py-4 border-b border-[#334155]/50 text-center">Total <span className="opacity-50">(100)</span></th>
                              <th className="px-5 py-4 border-b border-[#334155]/50 text-center">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#334155]/30">
                            {grades.map((g) => (
                              <tr key={g.subjectCode} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="font-semibold text-white mb-0.5">{g.subjectName}</div>
                                  <div className="text-xs text-[#60a5fa]">{g.subjectCode}</div>
                                </td>
                                <td className="px-5 py-4 text-center text-[#e2e8f0] font-medium">{g.credits}</td>
                                <td className="px-5 py-4 text-center">
                                  <span className="text-white font-medium">{g.cie1 + g.cie2 + g.assignment}</span>
                                </td>
                                <td className="px-5 py-4 text-center text-white font-medium">{g.see}</td>
                                <td className="px-5 py-4 text-center font-bold text-white">{g.total}</td>
                                <td className="px-5 py-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                    g.grade === 'O' || g.grade === 'A+' ? 'bg-purple-500/20 text-purple-400' :
                                    g.grade === 'A' || g.grade === 'B+' ? 'bg-blue-500/20 text-blue-400' :
                                    g.grade === 'B' || g.grade === 'C' ? 'bg-green-500/20 text-green-400' :
                                    g.grade === 'P' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {g.grade}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── ATTENDANCE TAB ── */}
                  {activeTab === 'attendance' && (
                    <div className="max-w-5xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Attendance Tracking</h2>
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" />Safe (&gt;85%)</div>
                          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />Warning (75-85%)</div>
                          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" />Shortage (&lt;75%)</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {attendance.map((att) => {
                          const statusColor = att.percentage >= 85 ? 'bg-green-500' : att.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500';
                          const lightColor = att.percentage >= 85 ? 'bg-green-500/20' : att.percentage >= 75 ? 'bg-yellow-500/20' : 'bg-red-500/20';
                          const textColor = att.percentage >= 85 ? 'text-green-400' : att.percentage >= 75 ? 'text-yellow-400' : 'text-red-400';

                          return (
                            <div key={att.subjectCode} className="glass rounded-xl p-5 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="font-semibold text-white mb-0.5">{att.subjectName}</div>
                                  <div className="text-xs text-[#94a3b8]">{att.subjectCode}</div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg font-bold text-sm ${lightColor} ${textColor}`}>
                                  {att.percentage}%
                                </div>
                              </div>
                              
                              <div className="relative h-2.5 w-full bg-[#1e293b] rounded-full overflow-hidden mb-3">
                                {/* 75% Threshold Marker */}
                                <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-red-500/50 z-10" />
                                
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${att.percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full ${statusColor}`}
                                />
                              </div>

                              <div className="flex justify-between text-xs text-[#94a3b8]">
                                <span>Attended: <strong className="text-white">{att.attended}</strong></span>
                                <span>Total Classes: <strong className="text-white">{att.totalClasses}</strong></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── FEES & RECEIPTS TAB ── */}
                  {activeTab === 'fees' && (
                    <div className="max-w-4xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Fee Details & Receipts</h2>
                        {feeRecord?.hallTicketEligible && (
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition-colors">
                            <Download size={16} /> Download Hall Ticket
                          </button>
                        )}
                      </div>

                      {feeRecord ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { label: 'Tuition Fee', fee: feeRecord.fees.tuition },
                              { label: 'Examination Fee', fee: feeRecord.fees.examination },
                              { label: 'Lab Fee', fee: feeRecord.fees.lab },
                            ].map((item, i) => (
                              <div key={i} className="glass rounded-xl p-5 border border-[#334155]/50">
                                <div className="text-xs text-[#94a3b8] mb-1">{item.label}</div>
                                <div className="text-2xl font-bold text-white mb-3">₹{item.fee.amount.toLocaleString()}</div>
                                {item.fee.paid ? (
                                  <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 w-fit px-2.5 py-1 rounded-md border border-green-500/20">
                                    <CheckCircle size={14} /> Paid via {item.fee.method}
                                  </div>
                                ) : (
                                  <button className="w-full py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors">
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-8">
                            <h3 className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider mb-4">Payment Receipts</h3>
                            {feeRecord.receipts.length > 0 ? (
                              <div className="glass rounded-2xl overflow-hidden border border-[#334155]/50">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-[#0f172a]/80 text-[#94a3b8] text-[11px] uppercase font-bold tracking-wider">
                                    <tr>
                                      <th className="px-5 py-3 border-b border-[#334155]/50">Receipt ID</th>
                                      <th className="px-5 py-3 border-b border-[#334155]/50">Type</th>
                                      <th className="px-5 py-3 border-b border-[#334155]/50 text-right">Amount</th>
                                      <th className="px-5 py-3 border-b border-[#334155]/50">Method</th>
                                      <th className="px-5 py-3 border-b border-[#334155]/50 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#334155]/30">
                                    {feeRecord.receipts.map((rec) => (
                                      <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs text-[#60a5fa]">{rec.id}</td>
                                        <td className="px-5 py-4 text-white font-medium">{rec.type} Fee</td>
                                        <td className="px-5 py-4 text-right text-white font-bold">₹{rec.amount.toLocaleString()}</td>
                                        <td className="px-5 py-4 text-[#94a3b8]">{rec.method}</td>
                                        <td className="px-5 py-4 text-right">
                                          <button className="inline-flex items-center gap-1.5 text-xs text-[#60a5fa] hover:text-white transition-colors">
                                            <Download size={14} /> PDF
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-[#94a3b8] glass rounded-2xl border border-[#334155]/50">
                                No payment receipts found for this semester.
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-[#94a3b8]">Loading fee records...</div>
                      )}
                    </div>
                  )}

                  {/* ── COURSE REGISTRATION TAB ── */}
                  {activeTab === 'registration' && (
                    <div className="max-w-4xl space-y-6">
                      <h2 className="text-xl font-bold text-white">Course Registration — Sem {profile?.semester}</h2>

                      {registration?.status && registration.status !== 'none' ? (
                        <div className="glass rounded-2xl p-8 text-center border border-[#334155]/50">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                            registration.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            registration.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {registration.status === 'approved' ? <CheckCircle size={32} /> :
                             registration.status === 'pending' ? <Calendar size={32} /> :
                             <AlertTriangle size={32} />}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 capitalize">Registration {registration.status}</h3>
                          <p className="text-[#94a3b8] max-w-md mx-auto mb-6">
                            You have registered for {registration.subjects.length} courses. 
                            {registration.status === 'pending' && " Your HOD is reviewing your request."}
                          </p>
                          <div className="inline-flex flex-wrap gap-2 justify-center max-w-2xl">
                            {registration.subjects.map(code => {
                              const sub = subjects.find(s => s.code === code);
                              return (
                                <div key={code} className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#334155] text-xs font-medium text-[#e2e8f0]">
                                  {sub ? `${sub.code} - ${sub.name}` : code}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="glass rounded-2xl p-6 border border-[#334155]/50">
                          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-6 bg-yellow-500/10 p-3 rounded-lg">
                            <AlertTriangle size={18} /> Please select the courses you want to register for this semester. Max 2 backlogs allowed.
                          </div>
                          
                          <div className="space-y-3 mb-8">
                            {subjects.map(sub => (
                              <label key={sub.code} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#334155]/50 cursor-pointer transition-all">
                                <input 
                                  type="checkbox" 
                                  className="w-5 h-5 rounded border-[#334155] bg-[#0f172a] text-[#60a5fa] focus:ring-0"
                                  checked={selectedCourses.includes(sub.code)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedCourses([...selectedCourses, sub.code]);
                                    else setSelectedCourses(selectedCourses.filter(c => c !== sub.code));
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="font-bold text-white">{sub.name}</div>
                                  <div className="text-xs text-[#94a3b8]">{sub.code} • {sub.credits} Credits</div>
                                </div>
                                <div className="text-xs font-medium bg-[#1e293b] px-2.5 py-1 rounded-md text-[#94a3b8]">
                                  Regular
                                </div>
                              </label>
                            ))}
                          </div>

                          <div className="flex justify-end pt-4 border-t border-[#334155]/50">
                            <button 
                              disabled={selectedCourses.length === 0}
                              onClick={async () => {
                                const ok = await submitRegistration(selectedCourses);
                                if (ok) setSelectedCourses([]);
                              }}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                              Submit Registration ({selectedCourses.length} selected)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other tabs omitted for brevity in Phase 3 */}
                  {(activeTab === 'subjects' || activeTab === 'timetable' || activeTab === 'notices') && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[#94a3b8]">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <h3 className="text-lg font-medium text-white mb-2">{TABS.find(t=>t.id===activeTab)?.label} — Coming in next phase</h3>
                      <p className="text-sm max-w-md">Data is available in the store, UI will be implemented in subsequent phases according to plan.</p>
                    </div>
                  )}

                </motion.div>
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
