import { create } from 'zustand';
import { useGamificationStore } from '@/stores/useGamificationStore';

interface StudentProfile {
  usn: string;
  name: string;
  department: string;
  departmentFull: string;
  semester: number;
  section: string;
  admissionId: string;
  csn: string;
  entryType: string;
  paymentCategory: string;
  email: string;
  phone: string;
  cgpa: number;
}

interface GradeRecord {
  usn: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  semester: number;
  cie1: number;
  cie2: number;
  assignment: number;
  see: number;
  total: number;
  maxCIE: number;
  maxAssignment: number;
  maxSEE: number;
  grade: string;
  gradePoints: number;
  status: string;
}

interface AttendanceRecord {
  usn: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  totalClasses: number;
  attended: number;
  percentage: number;
  belowThreshold: boolean;
  lastUpdated: string;
}

interface Subject {
  code: string;
  name: string;
  credits: number;
  department: string;
  semester: number;
}

interface Notice {
  _id: string;
  title: string;
  type: string;
  priority: string;
  content: string;
  date: string;
}

interface TimetableSlot {
  time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
}

interface Timetable {
  dept: string;
  section: string;
  semester: number;
  schedule: Record<string, TimetableSlot[]>;
}

interface FeeReceipt {
  id: string;
  type: string;
  amount: number;
  date: string;
  method: string;
  transactionId: string;
}

interface FeeRecord {
  usn: string;
  name: string;
  semester: number;
  fees: {
    tuition: { amount: number; paid: boolean; paidDate: string | null; method: string | null };
    examination: { amount: number; paid: boolean; paidDate: string | null; method: string | null };
    lab: { amount: number; paid: boolean; paidDate: string | null; method: string | null };
  };
  totalAmount: number;
  totalPaid: number;
  hallTicketEligible: boolean;
  receipts: FeeReceipt[];
}

interface RegistrationRecord {
  usn: string;
  semester: number;
  subjects: string[];
  status: 'none' | 'pending' | 'approved' | 'rejected';
  date?: string;
}

interface CampusPortalState {
  // Auth state
  isAuthenticated: boolean;
  currentUSN: string | null;
  
  // UI state
  activeTab: 'profile' | 'grades' | 'attendance' | 'subjects' | 'notices' | 'timetable' | 'fees' | 'registration';
  isLoading: boolean;
  error: string | null;
  
  // Data state
  profile: StudentProfile | null;
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  subjects: Subject[];
  notices: Notice[];
  timetable: Timetable | null;
  feeRecord: FeeRecord | null;
  registration: RegistrationRecord | null;

  // Actions
  setActiveTab: (tab: CampusPortalState['activeTab']) => void;
  login: (usn: string, password?: string) => Promise<boolean>;
  logout: () => void;
  
  fetchProfile: () => Promise<void>;
  fetchGrades: () => Promise<void>;
  fetchAttendance: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  fetchNotices: () => Promise<void>;
  fetchTimetable: () => Promise<void>;
  fetchFeeRecord: (publicUsn?: string) => Promise<void>;
  fetchRegistration: () => Promise<void>;
  submitRegistration: (subjects: string[]) => Promise<boolean>;
  fetchAllData: () => Promise<void>;
}

export const useCampusPortalStore = create<CampusPortalState>((set, get) => ({
  isAuthenticated: false,
  currentUSN: null,
  activeTab: 'profile',
  isLoading: false,
  error: null,
  
  profile: null,
  grades: [],
  attendance: [],
  subjects: [],
  notices: [],
  timetable: null,
  feeRecord: null,
  registration: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  login: async (usn, password) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app we'd verify the password here.
      // Since it's a demo portal, if a password is provided we check, otherwise we just login (if USN exists)
      const queryParams = new URLSearchParams({ action: password ? 'login' : 'profile', usn });
      if (password) queryParams.append('password', password);
      
      const res = await fetch(`/api/campus-portal?${queryParams}`);
      if (!res.ok) throw new Error('Invalid USN or password');
      
      const profile = await res.json();
      set({ profile, currentUSN: usn, isAuthenticated: true, error: null });
      return true;
    } catch (error: any) {
      set({ error: error.message, isAuthenticated: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => set({
    isAuthenticated: false,
    currentUSN: null,
    profile: null,
    grades: [],
    attendance: [],
    subjects: [],
    timetable: null,
    feeRecord: null,
    registration: null,
  }),

  fetchProfile: async () => {
    const { currentUSN } = get();
    if (!currentUSN) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal?action=profile&usn=${currentUSN}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const profile = await res.json();
      set({ profile });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGrades: async () => {
    const { currentUSN } = get();
    if (!currentUSN) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal?action=grades&usn=${currentUSN}`);
      if (!res.ok) throw new Error('Failed to fetch grades');
      const grades = await res.json();
      set({ grades });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAttendance: async () => {
    const { currentUSN } = get();
    if (!currentUSN) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal?action=attendance&usn=${currentUSN}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const attendance = await res.json();
      set({ attendance });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSubjects: async () => {
    const { profile } = get();
    if (!profile) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal?action=subjects&dept=${profile.department}&semester=${profile.semester}`);
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const subjects = await res.json();
      set({ subjects });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNotices: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal?action=notices`);
      if (!res.ok) throw new Error('Failed to fetch notices');
      const notices = await res.json();
      set({ notices });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTimetable: async () => {
    const { profile } = get();
    if (!profile) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal?action=timetable&dept=${profile.department}&section=${profile.section}`);
      if (!res.ok) throw new Error('Failed to fetch timetable');
      const timetable = await res.json();
      set({ timetable });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeeRecord: async (publicUsn?: string) => {
    const usnToFetch = publicUsn || get().currentUSN;
    if (!usnToFetch) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/campus-portal?action=receipts&usn=${usnToFetch}`);
      if (!res.ok) throw new Error('Fee record not found');
      const feeRecord = await res.json();
      set({ feeRecord });
    } catch (error: any) {
      set({ error: error.message, feeRecord: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRegistration: async () => {
    const { profile, currentUSN } = get();
    if (!currentUSN || !profile) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/campus-portal/registration?usn=${currentUSN}&semester=${profile.semester}`);
      if (!res.ok) throw new Error('Failed to fetch registration');
      const registration = await res.json();
      set({ registration });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  submitRegistration: async (subjects) => {
    const { profile, currentUSN } = get();
    if (!currentUSN || !profile) return false;
    set({ isLoading: true });
    try {
      const res = await fetch('/api/campus-portal/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: currentUSN, semester: profile.semester, subjects })
      });
      if (!res.ok) throw new Error('Registration failed');
      
      // Gamification Reward
      useGamificationStore.getState().addXP(100, `Registered for ${subjects.length} courses!`);

      await get().fetchRegistration();
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllData: async () => {
    const { fetchProfile, fetchGrades, fetchAttendance, fetchSubjects, fetchNotices, fetchTimetable, fetchFeeRecord, fetchRegistration, isAuthenticated } = get();
    if (!isAuthenticated) return;
    
    set({ isLoading: true });
    await Promise.all([
      fetchProfile().then(() => {
        // Fetch subjects, timetable, and registration only after profile is loaded
        return Promise.all([fetchSubjects(), fetchTimetable(), fetchRegistration()]);
      }),
      fetchGrades(),
      fetchAttendance(),
      fetchNotices(),
      fetchFeeRecord(),
    ]);
    set({ isLoading: false });
  }
}));
