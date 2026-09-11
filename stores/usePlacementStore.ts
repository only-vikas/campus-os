import { create } from 'zustand';
import { useGamificationStore } from '@/stores/useGamificationStore';

export type Role = 'student' | 'recruiter' | 'tpo';

export interface Job {
  _id: string;
  company: string;
  role: string;
  package: string;
  location: string;
  type: string;
  minCGPA: number;
  skills: string[];
  deadline: string;
  status: 'active' | 'upcoming' | 'closed';
  logo: string;
  slots: number;
  applied: number;
  description: string;
}

export interface Application {
  _id: string;
  usn: string;
  studentName?: string;
  jobId: string;
  company: string;
  role: string;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  appliedDate: string;
  matchScore: number;
}

export interface AuditLog {
  _id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

interface PlacementState {
  role: Role;
  activeTab: string;
  isLoading: boolean;
  error: string | null;
  jobs: Job[];
  applications: Application[];
  auditLogs: AuditLog[];
  
  // Filters
  searchQuery: string;

  setRole: (role: Role) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  
  fetchJobs: () => Promise<void>;
  fetchApplications: (usn?: string) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  applyForJob: (usn: string, studentName: string, job: Job) => Promise<boolean>;
  updateApplicationStatus: (appId: string, status: string) => Promise<boolean>;
  runAiRanking: (jobId: string) => Promise<boolean>;
}

export const usePlacementStore = create<PlacementState>((set, get) => ({
  role: 'student',
  activeTab: 'dashboard',
  isLoading: false,
  error: null,
  jobs: [],
  applications: [],
  auditLogs: [],
  searchQuery: '',

  setRole: (role) => set({ role }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/placement/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const jobs = await res.json();
      set({ jobs });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchApplications: async (usn) => {
    set({ isLoading: true, error: null });
    try {
      const url = usn ? `/api/placement/applications?usn=${usn}` : '/api/placement/applications';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch applications');
      const applications = await res.json();
      set({ applications });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  applyForJob: async (usn, studentName, job) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/placement/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn, studentName, jobId: job._id, company: job.company, role: job.role })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to apply');
      }
      
      // Reward Gamification XP
      useGamificationStore.getState().addXP(50, `Applied to ${job.company}`);

      // Refresh applications and jobs (for applied count)
      await get().fetchApplications(usn);
      await get().fetchJobs();
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateApplicationStatus: async (appId, status) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/placement/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Refresh applications list
      await get().fetchApplications();
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAuditLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/placement/audit');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const auditLogs = await res.json();
      set({ auditLogs });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  runAiRanking: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/placement/ai-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'AI Ranking failed');
      }
      
      await get().fetchApplications();
      await get().fetchAuditLogs();
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
