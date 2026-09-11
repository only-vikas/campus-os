'use client';

// ============================================================
// Campus OS — Placement Portal
// Next-gen browser-like placement management system
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, Filter, Building2, MapPin, DollarSign,
  GraduationCap, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, RotateCcw, Lock, Send, User, Users,
  BarChart2, FileText, Info
} from 'lucide-react';
import { usePlacementStore } from '@/stores/usePlacementStore';

const STUDENT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={15} /> },
  { id: 'jobs', label: 'Job Postings', icon: <Briefcase size={15} /> },
  { id: 'applications', label: 'My Applications', icon: <Send size={15} /> },
];

const TPO_TABS = [
  { id: 'dashboard', label: 'Overview', icon: <BarChart2 size={15} /> },
  { id: 'manage-jobs', label: 'Manage Drives', icon: <Briefcase size={15} /> },
  { id: 'students', label: 'Student Data', icon: <Users size={15} /> },
  { id: 'audit', label: 'Audit Log', icon: <FileText size={15} /> },
];

export default function PlacementPortal() {
  const {
    role, activeTab, isLoading, error, jobs, applications, auditLogs, searchQuery,
    setRole, setActiveTab, setSearchQuery, fetchJobs, fetchApplications, fetchAuditLogs,
    applyForJob, updateApplicationStatus, runAiRanking
  } = usePlacementStore();

  const [studentUsn, setStudentUsn] = useState('2BA23CS001'); // Demo (Vikas Kannur)
  const [studentName, setStudentName] = useState('Vikas Kannur'); // Demo

  useEffect(() => {
    fetchJobs();
    if (role === 'student') {
      fetchApplications(studentUsn);
    } else {
      fetchApplications();
      fetchAuditLogs();
    }
  }, [role, studentUsn, fetchJobs, fetchApplications, fetchAuditLogs]);

  const tabs = role === 'student' ? STUDENT_TABS : TPO_TABS;

  const filteredJobs = jobs.filter(j => 
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#050a18] text-[#e2e8f0] font-['Inter',sans-serif] overflow-hidden rounded-b-xl">
      {/* ── Browser Chrome ── */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[#0a0f1e] border-b border-[rgba(51,65,85,0.4)] flex-shrink-0">
        <div className="flex gap-1.5">
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-[#94a3b8] transition-colors"><ChevronLeft size={16} /></button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-[#94a3b8] transition-colors opacity-50"><ChevronRight size={16} /></button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-[#94a3b8] transition-colors" onClick={() => fetchJobs()}><RotateCcw size={14} /></button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-1.5 w-full max-w-xl text-xs text-[#94a3b8] shadow-inner">
            <Lock size={12} className="text-[#34d399]" />
            <span className="truncate">https://placement.bec.edu.in/{role}/{activeTab}</span>
          </div>
        </div>

        {/* Role Switcher for Demo */}
        <div className="flex items-center gap-2">
          <select 
            className="bg-[#1e293b] border border-[#334155] text-xs rounded-lg px-2 py-1 text-white focus:outline-none"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as any);
              setActiveTab('dashboard');
            }}
          >
            <option value="student">Student View</option>
            <option value="tpo">TPO View</option>
          </select>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Removed global loading overlay in favor of inline skeletons */}

        {/* Sidebar */}
        <div className="w-52 flex flex-col gap-1 p-3 border-r border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.6)] flex-shrink-0">
          <div className="mb-4 px-2">
            <div className="text-xs font-bold text-[#fbbf24] tracking-wider uppercase mb-2">Portal</div>
            <div className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                    activeTab === t.id
                      ? 'bg-[#fbbf24]/20 text-[#fbbf24] font-medium shadow-sm'
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              
              {/* ── STUDENT: JOBS TAB ── */}
              {activeTab === 'jobs' && role === 'student' && (
                <div className="max-w-5xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Drive Opportunities</h2>
                    <div className="relative w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                      <input 
                        type="text" 
                        placeholder="Search company or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                      />
                    </div>
                  </div>

                  {isLoading && jobs.length === 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass rounded-xl p-5 border border-[#334155]/50 animate-pulse">
                          <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-[#334155]/50" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-[#334155]/50 rounded w-1/2" />
                              <div className="h-3 bg-[#334155]/50 rounded w-1/3" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="h-3 bg-[#334155]/50 rounded w-2/3" />
                            <div className="h-3 bg-[#334155]/50 rounded w-2/3" />
                            <div className="h-3 bg-[#334155]/50 rounded w-2/3" />
                            <div className="h-3 bg-[#334155]/50 rounded w-2/3" />
                          </div>
                          <div className="h-8 bg-[#334155]/50 rounded w-full mt-4" />
                        </div>
                      ))}
                    </div>
                  ) : filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredJobs.map(job => {
                      const hasApplied = applications.some(a => a.jobId === job._id);
                      
                      return (
                        <div key={job._id} className="glass rounded-xl p-5 border border-[#334155]/50 flex flex-col group hover:border-[#fbbf24]/50 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={job.logo} alt={job.company} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white leading-tight">{job.role}</h3>
                                <p className="text-[#94a3b8] font-medium">{job.company}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#fbbf24]/20 text-[#fbbf24]">
                              {job.type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2 text-[#94a3b8]">
                              <DollarSign size={14} className="text-[#34d399]" />
                              <span className="text-white font-medium">{job.package} LPA</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#94a3b8]">
                              <MapPin size={14} className="text-[#60a5fa]" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#94a3b8]">
                              <GraduationCap size={14} className="text-[#a78bfa]" />
                              <span>Min CGPA: <strong className="text-white">{job.minCGPA}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-[#94a3b8]">
                              <Clock size={14} className="text-red-400" />
                              <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {job.skills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded bg-[#1e293b] text-[10px] text-[#94a3b8] border border-[#334155]">
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="mt-auto pt-4 border-t border-[#334155]/50 flex items-center justify-between">
                            <div className="text-xs text-[#94a3b8]">
                              <span className="text-white font-medium">{job.applied}</span> applied
                            </div>
                            {hasApplied ? (
                              <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 font-medium">
                                <CheckCircle size={14} /> Applied
                              </div>
                            ) : (
                              <button 
                                onClick={() => applyForJob(studentUsn, studentName, job)}
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black text-sm font-bold hover:opacity-90 transition-opacity"
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#94a3b8] glass rounded-2xl border border-[#334155]/50">
                      No jobs found matching your criteria.
                      <button onClick={() => fetchJobs()} className="block mx-auto mt-4 px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition-colors">
                        Refresh Jobs
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── STUDENT: APPLICATIONS TAB ── */}
              {activeTab === 'applications' && role === 'student' && (
                <div className="max-w-4xl space-y-6">
                  <h2 className="text-xl font-bold text-white">My Applications</h2>
                  
                  {isLoading && applications.length === 0 ? (
                    <div className="glass rounded-2xl border border-[#334155]/50 p-6 space-y-4 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center pb-4 border-b border-[#334155]/30">
                           <div className="space-y-2 w-1/3">
                             <div className="h-4 bg-[#334155]/50 rounded w-full" />
                             <div className="h-3 bg-[#334155]/50 rounded w-2/3" />
                           </div>
                           <div className="h-4 bg-[#334155]/50 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  ) : applications.length > 0 ? (
                    <div className="glass rounded-2xl overflow-hidden border border-[#334155]/50">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#0f172a]/80 text-[#94a3b8] text-[11px] uppercase font-bold tracking-wider">
                          <tr>
                            <th className="px-5 py-4 border-b border-[#334155]/50">Company & Role</th>
                            <th className="px-5 py-4 border-b border-[#334155]/50">Applied On</th>
                            <th className="px-5 py-4 border-b border-[#334155]/50 text-center">AI Match Score</th>
                            <th className="px-5 py-4 border-b border-[#334155]/50 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/30">
                          {applications.map((app) => (
                            <tr key={app._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-bold text-white mb-0.5">{app.company}</div>
                                <div className="text-xs text-[#94a3b8]">{app.role}</div>
                              </td>
                              <td className="px-5 py-4 text-[#e2e8f0]">
                                {new Date(app.appliedDate).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="inline-flex flex-col items-center gap-1">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e293b] border border-[#334155]">
                                    <span className={`text-xs font-bold ${
                                      app.matchScore >= 85 ? 'text-green-400' :
                                      app.matchScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                      {app.matchScore}%
                                    </span>
                                  </div>
                                  {(app.status === 'Shortlisted' || app.status === 'Interview' || app.status === 'Selected') && (
                                    <button 
                                      onClick={() => {
                                        const { openWindow } = require('@/stores/useWindowStore').useWindowStore.getState();
                                        openWindow('interview');
                                      }}
                                      className="text-[10px] text-blue-400 hover:text-blue-300 underline mt-1"
                                    >
                                      Launch Interview Prep 🚀
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                  app.status === 'Applied' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                  app.status === 'Shortlisted' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                  app.status === 'Interview' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                  app.status === 'Selected' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#94a3b8] glass rounded-2xl border border-[#334155]/50">
                      You haven't applied to any jobs yet.
                    </div>
                  )}
                </div>
              )}

              {/* ── TPO: MANAGE JOBS TAB ── */}
              {activeTab === 'manage-jobs' && role === 'tpo' && (
                <div className="max-w-5xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Active Placement Drives</h2>
                    <button className="px-4 py-2 bg-[#fbbf24] text-black text-sm font-bold rounded-xl hover:bg-[#f59e0b] transition-colors">
                      + Create New Drive
                    </button>
                  </div>
                  {isLoading && jobs.length === 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="glass rounded-xl p-5 border border-[#334155]/50 flex items-center justify-between animate-pulse">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-lg bg-[#334155]/50" />
                             <div className="space-y-2">
                               <div className="h-4 bg-[#334155]/50 rounded w-48" />
                               <div className="h-3 bg-[#334155]/50 rounded w-32" />
                             </div>
                          </div>
                          <div className="w-24 h-10 bg-[#334155]/50 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {jobs.map(job => (
                      <div key={job._id} className="glass rounded-xl p-5 border border-[#334155]/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={job.logo} alt={job.company} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{job.company} — {job.role}</h3>
                            <div className="text-xs text-[#94a3b8] mt-1">
                              {job.package} LPA • Min {job.minCGPA} CGPA • Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-black text-white">{job.applied}</div>
                            <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Applicants</div>
                          </div>
                          <div className="flex flex-col gap-2 relative">
                            <div className="group relative flex items-center">
                              <button 
                                onClick={() => runAiRanking(job._id)}
                                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-sm text-white font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] w-full text-left flex justify-between items-center"
                              >
                                <span>✨ AI Rank</span>
                              </button>
                              <div className="absolute right-2 text-white/50 hover:text-white cursor-help z-10 peer">
                                <Info size={14} />
                              </div>
                              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#0f172a] border border-[#334155] rounded-xl text-xs text-[#94a3b8] shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                <span className="font-bold text-white block mb-1">AI Fallback Chain:</span>
                                1. OpenRouter (Primary Model)<br/>
                                2. Ollama (Local Fallback)<br/>
                                3. Simulated Mock Data (Demo Mode)
                                <div className="mt-1 text-[10px] text-purple-400">Rate Limited: 1 run per 30s</div>
                              </div>
                            </div>
                            <button className="px-4 py-1.5 rounded-lg border border-[#334155] hover:bg-[#1e293b] text-sm text-[#e2e8f0] transition-colors">
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#94a3b8] glass rounded-2xl border border-[#334155]/50">
                      No active placement drives found.
                    </div>
                  )}
                </div>
              )}
              
              {/* ── TPO: AUDIT LOG TAB ── */}
              {activeTab === 'audit' && role === 'tpo' && (
                <div className="max-w-4xl space-y-6">
                  <h2 className="text-xl font-bold text-white">System Audit Log</h2>
                  
                  <div className="glass rounded-2xl overflow-hidden border border-[#334155]/50">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#0f172a]/80 text-[#94a3b8] text-[11px] uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-5 py-4 border-b border-[#334155]/50">Timestamp</th>
                          <th className="px-5 py-4 border-b border-[#334155]/50">Action</th>
                          <th className="px-5 py-4 border-b border-[#334155]/50">Details</th>
                          <th className="px-5 py-4 border-b border-[#334155]/50">User</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/30">
                        {auditLogs.length > 0 ? auditLogs.map(log => (
                          <tr key={log._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 text-xs text-[#94a3b8]">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-[#e2e8f0] text-xs leading-relaxed">
                              {log.details}
                            </td>
                            <td className="px-5 py-4 text-[#94a3b8] font-mono text-xs">
                              {log.user}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-5 py-8 text-center text-[#94a3b8]">No audit logs found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* ── PLACEHOLDER FOR OTHER TABS ── */}
              {(activeTab === 'dashboard' || activeTab === 'students') && (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#94a3b8]">
                  <BarChart2 size={48} className="mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-white mb-2">{role === 'student' ? STUDENT_TABS.find(t=>t.id===activeTab)?.label : TPO_TABS.find(t=>t.id===activeTab)?.label} — Analytics Dashboard</h3>
                  <p className="text-sm max-w-md">Detailed visual analytics and AI insights will be rendered here in subsequent phases.</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
