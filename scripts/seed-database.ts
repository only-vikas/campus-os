/**
 * Campus OS — MongoDB Seed Script
 * Seeds the campus_os database with realistic student data following BecVortex schema patterns.
 * 
 * Usage: npx ts-node --skip-project scripts/seed-database.ts
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI!;
if (!uri) { console.error('MONGODB_URI not set in .env'); process.exit(1); }

// ── Departments & Subjects ──────────────────────────────────────
const DEPARTMENTS = ['CSE', 'ISE', 'ECE', 'ME', 'CV'];
const DEPT_FULL: Record<string, string> = {
  CSE: 'Computer Science & Engineering',
  ISE: 'Information Science & Engineering',
  ECE: 'Electronics & Communication Engineering',
  ME: 'Mechanical Engineering',
  CV: 'Civil Engineering',
};

const SUBJECTS_BY_DEPT: Record<string, { code: string; name: string; credits: number }[]> = {
  CSE: [
    { code: '21CS61', name: 'Machine Learning', credits: 4 },
    { code: '21CS62', name: 'Cloud Computing', credits: 4 },
    { code: '21CS63', name: 'Software Engineering', credits: 3 },
    { code: '21CS64', name: 'Database Systems', credits: 4 },
    { code: '21CS65', name: 'Computer Networks', credits: 3 },
    { code: '21CSL66', name: 'ML Lab', credits: 1 },
    { code: '21CSL67', name: 'Networks Lab', credits: 1 },
    { code: '21CSP68', name: 'Mini Project', credits: 2 },
  ],
  ISE: [
    { code: '21IS61', name: 'Artificial Intelligence', credits: 4 },
    { code: '21IS62', name: 'Web Technologies', credits: 4 },
    { code: '21IS63', name: 'Data Mining', credits: 3 },
    { code: '21IS64', name: 'Operating Systems', credits: 4 },
    { code: '21IS65', name: 'Computer Graphics', credits: 3 },
    { code: '21ISL66', name: 'AI Lab', credits: 1 },
    { code: '21ISL67', name: 'Web Lab', credits: 1 },
    { code: '21ISP68', name: 'Mini Project', credits: 2 },
  ],
  ECE: [
    { code: '21EC61', name: 'VLSI Design', credits: 4 },
    { code: '21EC62', name: 'DSP', credits: 4 },
    { code: '21EC63', name: 'Embedded Systems', credits: 3 },
    { code: '21EC64', name: 'Communication Systems', credits: 4 },
    { code: '21EC65', name: 'Antenna Theory', credits: 3 },
    { code: '21ECL66', name: 'VLSI Lab', credits: 1 },
    { code: '21ECL67', name: 'Embedded Lab', credits: 1 },
    { code: '21ECP68', name: 'Mini Project', credits: 2 },
  ],
  ME: [
    { code: '21ME61', name: 'Heat Transfer', credits: 4 },
    { code: '21ME62', name: 'Design of Machine Elements', credits: 4 },
    { code: '21ME63', name: 'Manufacturing Technology', credits: 3 },
    { code: '21ME64', name: 'Fluid Mechanics', credits: 4 },
    { code: '21ME65', name: 'Operations Research', credits: 3 },
    { code: '21MEL66', name: 'Heat Transfer Lab', credits: 1 },
    { code: '21MEL67', name: 'Manufacturing Lab', credits: 1 },
    { code: '21MEP68', name: 'Mini Project', credits: 2 },
  ],
  CV: [
    { code: '21CV61', name: 'Structural Analysis', credits: 4 },
    { code: '21CV62', name: 'Geotechnical Engineering', credits: 4 },
    { code: '21CV63', name: 'Environmental Engineering', credits: 3 },
    { code: '21CV64', name: 'Transportation Engineering', credits: 4 },
    { code: '21CV65', name: 'Concrete Technology', credits: 3 },
    { code: '21CVL66', name: 'Geotechnical Lab', credits: 1 },
    { code: '21CVL67', name: 'Environmental Lab', credits: 1 },
    { code: '21CVP68', name: 'Mini Project', credits: 2 },
  ],
};

// ── VTU Grade Scale ─────────────────────────────────────────────
const VTU_GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];
const GRADE_POINTS: Record<string, number> = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGrade(): string {
  const r = Math.random();
  if (r < 0.15) return 'O';
  if (r < 0.35) return 'A+';
  if (r < 0.55) return 'A';
  if (r < 0.72) return 'B+';
  if (r < 0.85) return 'B';
  if (r < 0.92) return 'C';
  if (r < 0.97) return 'P';
  return 'F';
}

// ── Student Names ───────────────────────────────────────────────
const FIRST_NAMES = [
  'Vikas', 'Sangam', 'Priya', 'Rahul', 'Sneha', 'Amit', 'Kavya', 'Rohan',
  'Ananya', 'Suresh', 'Divya', 'Karthik', 'Meena', 'Arun', 'Pooja',
  'Nikhil', 'Shreya', 'Varun', 'Deepika', 'Harsha',
];
const LAST_NAMES = [
  'Kannur', 'Gaddi', 'Sharma', 'Patil', 'Kulkarni', 'Gowda', 'Hegde',
  'Naik', 'Joshi', 'Desai', 'Rao', 'Reddy', 'Hiremath', 'Angadi',
  'Badiger', 'Mane', 'Koujalagi', 'Biradar', 'Hugar', 'Nandeshwar',
];

const SECTIONS = ['A', 'B'];
const ENTRY_TYPES = ['CET', 'COMEDK', 'Management'];
const PAYMENT_CATEGORIES = ['General', 'OBC', 'SC/ST', 'EWS'];

const FACULTY_NAMES = [
  'Dr. Priya S.', 'Prof. Rahul M.', 'Dr. Anita K.', 'Prof. Suresh B.',
  'Dr. Meena R.', 'Dr. Kiran P.', 'Prof. Vijay H.', 'Dr. Lakshmi N.',
];

// ── Timetable Template ──────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMESLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'];

function generateTimetable(dept: string, section: string) {
  const subjects = SUBJECTS_BY_DEPT[dept];
  const schedule: Record<string, { time: string; subject: string; code: string; faculty: string; room: string }[]> = {};
  
  for (const day of DAYS) {
    const daySlots = [];
    const slotCount = randomInt(3, 5);
    const usedSlots = new Set<number>();
    
    for (let s = 0; s < slotCount; s++) {
      let slotIdx: number;
      do { slotIdx = randomInt(0, 4); } while (usedSlots.has(slotIdx));
      usedSlots.add(slotIdx);
      
      const subj = subjects[randomInt(0, subjects.length - 1)];
      daySlots.push({
        time: TIMESLOTS[slotIdx],
        subject: subj.name,
        code: subj.code,
        faculty: FACULTY_NAMES[randomInt(0, FACULTY_NAMES.length - 1)],
        room: subj.code.includes('L') ? `Lab-${randomInt(1, 4)}` : `${dept}-${randomInt(301, 310)}`,
      });
    }
    daySlots.sort((a, b) => TIMESLOTS.indexOf(a.time) - TIMESLOTS.indexOf(b.time));
    schedule[day] = daySlots;
  }
  
  return { dept, section, semester: 6, schedule };
}

// ── Main Seed Function ──────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('campus_os');
  
  console.log('🗑️  Clearing existing collections...');
  const collections = ['students', 'grades', 'attendance_records', 'subjects', 'notices', 'timetables', 'fee_records', 'placement_jobs', 'placement_applications'];
  for (const col of collections) {
    try { await db.collection(col).drop(); } catch { /* doesn't exist yet */ }
  }

  // ── 1. Subjects ─────────────────────────────────────────────
  console.log('📚 Seeding subjects...');
  const allSubjects: any[] = [];
  for (const [dept, subjects] of Object.entries(SUBJECTS_BY_DEPT)) {
    for (const subj of subjects) {
      allSubjects.push({ ...subj, department: dept, semester: 6 });
    }
  }
  await db.collection('subjects').insertMany(allSubjects);

  // ── 2. Students ─────────────────────────────────────────────
  console.log('👨‍🎓 Seeding 20 students...');
  const students: any[] = [];
  for (let i = 0; i < 20; i++) {
    const dept = DEPARTMENTS[i % 5];
    const usn = `2BA23${dept.substring(0, 2)}${String(i + 1).padStart(3, '0')}`;
    const student = {
      usn,
      name: `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`,
      department: dept,
      departmentFull: DEPT_FULL[dept],
      semester: 6,
      section: SECTIONS[i % 2],
      admissionId: `BEC2023${String(1000 + i)}`,
      csn: `CSN${String(2300 + i)}`,
      entryType: ENTRY_TYPES[randomInt(0, 2)],
      paymentCategory: PAYMENT_CATEGORIES[randomInt(0, 3)],
      email: `${FIRST_NAMES[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase()}@bec.edu.in`,
      phone: `+91 ${randomInt(70, 99)}${randomInt(10000000, 99999999)}`,
      cgpa: parseFloat((randomInt(55, 99) / 10).toFixed(2)),
      password: 'campus2026', // Default password for all students (demo)
      createdAt: new Date(),
    };
    students.push(student);
  }
  await db.collection('students').insertMany(students);

  // ── 3. Grades ───────────────────────────────────────────────
  console.log('📊 Seeding grades...');
  const grades: any[] = [];
  for (const student of students) {
    const subjects = SUBJECTS_BY_DEPT[student.department];
    for (const subj of subjects) {
      const isLab = subj.code.includes('L') || subj.code.includes('P');
      const cie1 = randomInt(isLab ? 30 : 20, isLab ? 50 : 50);
      const cie2 = randomInt(isLab ? 30 : 20, isLab ? 50 : 50);
      const assignment = randomInt(5, 10);
      const see = randomInt(isLab ? 30 : 28, isLab ? 50 : 60);
      const total = cie1 + cie2 + assignment + see;
      const grade = randomGrade();
      
      grades.push({
        usn: student.usn,
        subjectCode: subj.code,
        subjectName: subj.name,
        credits: subj.credits,
        semester: 6,
        cie1, cie2, assignment, see, total,
        maxCIE: 50, maxAssignment: 10, maxSEE: isLab ? 50 : 60,
        grade,
        gradePoints: GRADE_POINTS[grade],
        status: grade === 'F' ? 'FAIL' : 'PASS',
      });
    }
  }
  await db.collection('grades').insertMany(grades);

  // ── 4. Attendance Records ───────────────────────────────────
  console.log('📋 Seeding attendance...');
  const attendanceRecords: any[] = [];
  for (const student of students) {
    const subjects = SUBJECTS_BY_DEPT[student.department];
    for (const subj of subjects) {
      const totalClasses = randomInt(35, 50);
      const attended = randomInt(Math.floor(totalClasses * 0.6), totalClasses);
      const percentage = parseFloat(((attended / totalClasses) * 100).toFixed(1));
      
      attendanceRecords.push({
        usn: student.usn,
        subjectCode: subj.code,
        subjectName: subj.name,
        semester: 6,
        totalClasses,
        attended,
        percentage,
        belowThreshold: percentage < 75,
        lastUpdated: new Date(),
      });
    }
  }
  await db.collection('attendance_records').insertMany(attendanceRecords);

  // ── 5. Notices ──────────────────────────────────────────────
  console.log('📢 Seeding notices...');
  const notices = [
    { title: 'Placement Drive — TCS Digital', type: 'placement', priority: 'high', content: 'TCS Digital recruitment drive for 2026 batch. Eligible: CSE, ISE, ECE with CGPA ≥ 7.0. Last date to register: 15 Sep 2026.', date: new Date('2026-09-10') },
    { title: 'Internal Assessment-2 Schedule', type: 'academic', priority: 'high', content: 'IA-2 exams scheduled from 22 Sep to 28 Sep 2026. Timetable available on the portal.', date: new Date('2026-09-08') },
    { title: 'Hackathon 2026 — BEC CodeStorm', type: 'event', priority: 'medium', content: '48-hour hackathon on campus. Teams of 2-4. Register by 20 Sep. Prizes worth ₹50,000.', date: new Date('2026-09-05') },
    { title: 'Library Books Return Deadline', type: 'admin', priority: 'low', content: 'All library books must be returned by 25 Sep 2026. Fine: ₹5/day for late returns.', date: new Date('2026-09-04') },
    { title: 'Workshop: Cloud Computing with AWS', type: 'event', priority: 'medium', content: 'Free workshop by AWS Academy. Venue: Seminar Hall. Date: 18 Sep, 10 AM - 4 PM.', date: new Date('2026-09-03') },
    { title: 'Infosys InfyTQ Certification', type: 'placement', priority: 'high', content: 'InfyTQ exam on 1 Oct 2026. Register on Infosys portal. Minimum CGPA: 6.5.', date: new Date('2026-09-02') },
    { title: 'Fee Payment Reminder — Odd Semester', type: 'admin', priority: 'high', content: 'Last date for odd semester fee payment: 30 Sep 2026. Late fee: ₹500.', date: new Date('2026-09-01') },
    { title: 'Sports Day Registration', type: 'event', priority: 'low', content: 'Annual sports day on 10 Oct. Register for events by 25 Sep at the sports dept.', date: new Date('2026-08-30') },
    { title: 'NSS Camp — 7-Day Residential', type: 'event', priority: 'medium', content: 'NSS annual camp at Kudala Sangama. Dates: 15-21 Oct. Limited to 50 students.', date: new Date('2026-08-28') },
    { title: 'Semester Exam Results — 5th Sem', type: 'academic', priority: 'high', content: '5th semester results published on VTU portal. Check results and report discrepancies by 10 Sep.', date: new Date('2026-08-25') },
  ];
  await db.collection('notices').insertMany(notices);

  // ── 6. Timetables ──────────────────────────────────────────
  console.log('🕐 Seeding timetables...');
  const timetables: any[] = [];
  for (const dept of DEPARTMENTS) {
    for (const section of SECTIONS) {
      timetables.push(generateTimetable(dept, section));
    }
  }
  await db.collection('timetables').insertMany(timetables);

  // ── 7. Fee Records ─────────────────────────────────────────
  console.log('💰 Seeding fee records...');
  const feeRecords: any[] = [];
  for (const student of students) {
    const tuitionPaid = Math.random() > 0.15;
    const examPaid = tuitionPaid ? Math.random() > 0.1 : false;
    const labPaid = tuitionPaid ? Math.random() > 0.1 : false;
    
    feeRecords.push({
      usn: student.usn,
      name: student.name,
      semester: 6,
      fees: {
        tuition: { amount: 65000, paid: tuitionPaid, paidDate: tuitionPaid ? new Date('2026-07-15') : null, method: tuitionPaid ? 'UPI' : null },
        examination: { amount: 2500, paid: examPaid, paidDate: examPaid ? new Date('2026-08-10') : null, method: examPaid ? 'Net Banking' : null },
        lab: { amount: 5000, paid: labPaid, paidDate: labPaid ? new Date('2026-07-20') : null, method: labPaid ? 'UPI' : null },
      },
      totalAmount: 72500,
      totalPaid: (tuitionPaid ? 65000 : 0) + (examPaid ? 2500 : 0) + (labPaid ? 5000 : 0),
      hallTicketEligible: tuitionPaid && examPaid,
      receipts: tuitionPaid ? [
        { id: `REC-${student.usn}-TUI`, type: 'Tuition', amount: 65000, date: new Date('2026-07-15'), method: 'UPI', transactionId: `TXN${randomInt(100000, 999999)}` },
        ...(examPaid ? [{ id: `REC-${student.usn}-EXM`, type: 'Examination', amount: 2500, date: new Date('2026-08-10'), method: 'Net Banking', transactionId: `TXN${randomInt(100000, 999999)}` }] : []),
        ...(labPaid ? [{ id: `REC-${student.usn}-LAB`, type: 'Lab', amount: 5000, date: new Date('2026-07-20'), method: 'UPI', transactionId: `TXN${randomInt(100000, 999999)}` }] : []),
      ] : [],
    });
  }
  await db.collection('fee_records').insertMany(feeRecords);

  // ── 8. Placement Jobs ──────────────────────────────────────
  console.log('💼 Seeding placement jobs...');
  const placementJobs = [
    { company: 'TCS Digital', role: 'Software Engineer', package: '7 LPA', location: 'Bengaluru', type: 'Service', minCGPA: 7.0, skills: ['Java', 'SQL', 'Python'], deadline: new Date('2026-09-20'), status: 'active', logo: '🔵', slots: 15, applied: 0, description: 'Full-stack development role with TCS Digital unit. Work on enterprise cloud solutions.' },
    { company: 'Infosys', role: 'Systems Engineer', package: '6.5 LPA', location: 'Pune', type: 'Service', minCGPA: 6.5, skills: ['Java', 'Spring Boot', 'React'], deadline: new Date('2026-09-22'), status: 'active', logo: '🟢', slots: 20, applied: 0, description: 'Core engineering role in the digital transformation unit.' },
    { company: 'Wipro', role: 'Project Engineer', package: '6.8 LPA', location: 'Hyderabad', type: 'Service', minCGPA: 6.0, skills: ['Python', 'AWS', 'Docker'], deadline: new Date('2026-09-25'), status: 'active', logo: '🟡', slots: 12, applied: 0, description: 'Cloud engineering and DevOps practice.' },
    { company: 'Accenture', role: 'Associate SE', package: '8 LPA', location: 'Bengaluru', type: 'Consulting', minCGPA: 7.5, skills: ['Full Stack', 'Cloud', 'AI/ML'], deadline: new Date('2026-10-01'), status: 'active', logo: '🟣', slots: 8, applied: 0, description: 'Technology consulting with Fortune 500 clients.' },
    { company: 'Capgemini', role: 'Analyst', package: '7.5 LPA', location: 'Mumbai', type: 'Service', minCGPA: 7.0, skills: ['Data Analytics', 'SQL', 'Python'], deadline: new Date('2026-10-05'), status: 'active', logo: '🔴', slots: 10, applied: 0, description: 'Data analytics and business intelligence.' },
    { company: 'HCL Technologies', role: 'Graduate Engineer', package: '5.5 LPA', location: 'Noida', type: 'Service', minCGPA: 6.0, skills: ['C++', 'Networking', 'Linux'], deadline: new Date('2026-10-10'), status: 'upcoming', logo: '🟠', slots: 25, applied: 0, description: 'Infrastructure management and networking.' },
    { company: 'Mindtree', role: 'Associate Software Engineer', package: '6 LPA', location: 'Bengaluru', type: 'Product', minCGPA: 6.5, skills: ['React', 'Node.js', 'MongoDB'], deadline: new Date('2026-10-15'), status: 'upcoming', logo: '🟤', slots: 10, applied: 0, description: 'Product development for SaaS platforms.' },
    { company: 'L&T Infotech', role: 'Software Developer', package: '7.2 LPA', location: 'Chennai', type: 'Service', minCGPA: 7.0, skills: ['Java', 'Microservices', 'Kubernetes'], deadline: new Date('2026-10-20'), status: 'upcoming', logo: '⚫', slots: 15, applied: 0, description: 'Microservices development for banking sector.' },
  ];
  await db.collection('placement_jobs').insertMany(placementJobs);

  // ── 9. Placement Applications ──────────────────────────────
  console.log('📝 Seeding placement applications...');
  const applications: any[] = [];
  const statuses = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
  // First 5 students get some applications
  for (let i = 0; i < 5; i++) {
    const student = students[i];
    const numApps = randomInt(1, 3);
    const appliedJobs = new Set<number>();
    for (let j = 0; j < numApps; j++) {
      let jobIdx: number;
      do { jobIdx = randomInt(0, 4); } while (appliedJobs.has(jobIdx));
      appliedJobs.add(jobIdx);
      
      applications.push({
        usn: student.usn,
        studentName: student.name,
        company: placementJobs[jobIdx].company,
        role: placementJobs[jobIdx].role,
        status: statuses[randomInt(0, 3)],
        appliedDate: new Date(`2026-09-${randomInt(1, 10)}`),
        matchScore: randomInt(55, 98),
      });
    }
  }
  if (applications.length > 0) {
    await db.collection('placement_applications').insertMany(applications);
  }

  // ── Create indexes ─────────────────────────────────────────
  console.log('🔑 Creating indexes...');
  await db.collection('students').createIndex({ usn: 1 }, { unique: true });
  await db.collection('grades').createIndex({ usn: 1, semester: 1 });
  await db.collection('attendance_records').createIndex({ usn: 1, semester: 1 });
  await db.collection('fee_records').createIndex({ usn: 1, semester: 1 });
  await db.collection('notices').createIndex({ date: -1 });
  await db.collection('placement_jobs').createIndex({ status: 1, deadline: 1 });
  await db.collection('placement_applications').createIndex({ usn: 1 });

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log(`   📊 ${students.length} students`);
  console.log(`   📋 ${grades.length} grade records`);
  console.log(`   📋 ${attendanceRecords.length} attendance records`);
  console.log(`   📚 ${allSubjects.length} subjects`);
  console.log(`   📢 ${notices.length} notices`);
  console.log(`   🕐 ${timetables.length} timetables`);
  console.log(`   💰 ${feeRecords.length} fee records`);
  console.log(`   💼 ${placementJobs.length} placement jobs`);
  console.log(`   📝 ${applications.length} placement applications`);
  
  await client.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
