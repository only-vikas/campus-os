import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const client = await clientPromise;
    const db = client.db('campus_os');

    switch (action) {
      // ── Student Profile ──────────────────────────────────────
      case 'profile': {
        const usn = searchParams.get('usn');
        if (!usn) return NextResponse.json({ error: 'USN required' }, { status: 400 });
        const student = await db.collection('students').findOne({ usn: usn.toUpperCase() });
        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        return NextResponse.json(student);
      }

      // ── Login / Verify ───────────────────────────────────────
      case 'login': {
        const usn = searchParams.get('usn');
        const password = searchParams.get('password');
        if (!usn || !password) return NextResponse.json({ error: 'USN and password required' }, { status: 400 });
        const student = await db.collection('students').findOne({ usn: usn.toUpperCase(), password });
        if (!student) return NextResponse.json({ error: 'Invalid USN or password' }, { status: 401 });
        // Return student without password
        const { password: _, ...safeStudent } = student as any;
        return NextResponse.json(safeStudent);
      }

      // ── Grades ───────────────────────────────────────────────
      case 'grades': {
        const usn = searchParams.get('usn');
        const semester = searchParams.get('semester') || '6';
        if (!usn) return NextResponse.json({ error: 'USN required' }, { status: 400 });
        const grades = await db.collection('grades')
          .find({ usn: usn.toUpperCase(), semester: parseInt(semester) })
          .toArray();
        return NextResponse.json(grades);
      }

      // ── Attendance ───────────────────────────────────────────
      case 'attendance': {
        const usn = searchParams.get('usn');
        const semester = searchParams.get('semester') || '6';
        if (!usn) return NextResponse.json({ error: 'USN required' }, { status: 400 });
        const attendance = await db.collection('attendance_records')
          .find({ usn: usn.toUpperCase(), semester: parseInt(semester) })
          .toArray();
        return NextResponse.json(attendance);
      }

      // ── Subjects ─────────────────────────────────────────────
      case 'subjects': {
        const dept = searchParams.get('dept');
        const semester = searchParams.get('semester') || '6';
        if (!dept) return NextResponse.json({ error: 'Department required' }, { status: 400 });
        const subjects = await db.collection('subjects')
          .find({ department: dept.toUpperCase(), semester: parseInt(semester) })
          .toArray();
        return NextResponse.json(subjects);
      }

      // ── Notices ──────────────────────────────────────────────
      case 'notices': {
        const notices = await db.collection('notices')
          .find({})
          .sort({ date: -1 })
          .limit(20)
          .toArray();
        return NextResponse.json(notices);
      }

      // ── Timetable ────────────────────────────────────────────
      case 'timetable': {
        const dept = searchParams.get('dept');
        const section = searchParams.get('section');
        if (!dept || !section) return NextResponse.json({ error: 'Department and section required' }, { status: 400 });
        const timetable = await db.collection('timetables').findOne({
          dept: dept.toUpperCase(),
          section: section.toUpperCase(),
        });
        if (!timetable) return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
        return NextResponse.json(timetable);
      }

      // ── Fee Verify (Public — no auth needed) ─────────────────
      case 'fee-verify': {
        const usn = searchParams.get('usn');
        if (!usn) return NextResponse.json({ error: 'USN required' }, { status: 400 });
        const fee = await db.collection('fee_records').findOne({ usn: usn.toUpperCase() });
        if (!fee) return NextResponse.json({ error: 'No fee records found' }, { status: 404 });
        // Return limited info for public view
        return NextResponse.json({
          usn: fee.usn,
          name: fee.name,
          semester: fee.semester,
          tuitionPaid: fee.fees.tuition.paid,
          examPaid: fee.fees.examination.paid,
          labPaid: fee.fees.lab.paid,
          totalAmount: fee.totalAmount,
          totalPaid: fee.totalPaid,
          hallTicketEligible: fee.hallTicketEligible,
        });
      }

      // ── Receipts ─────────────────────────────────────────────
      case 'receipts': {
        const usn = searchParams.get('usn');
        if (!usn) return NextResponse.json({ error: 'USN required' }, { status: 400 });
        const fee = await db.collection('fee_records').findOne({ usn: usn.toUpperCase() });
        if (!fee) return NextResponse.json({ error: 'No records found' }, { status: 404 });
        return NextResponse.json({
          usn: fee.usn,
          name: fee.name,
          semester: fee.semester,
          fees: fee.fees,
          totalAmount: fee.totalAmount,
          totalPaid: fee.totalPaid,
          receipts: fee.receipts,
          hallTicketEligible: fee.hallTicketEligible,
        });
      }

      // ── All Students (for dropdown/search) ───────────────────
      case 'students': {
        const students = await db.collection('students')
          .find({}, { projection: { usn: 1, name: 1, department: 1, semester: 1, section: 1, _id: 0 } })
          .toArray();
        return NextResponse.json(students);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Campus Portal API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
