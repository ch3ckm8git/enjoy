import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { calculateNewStreak } from '@/lib/streak-utils';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const { sessionToken, examId, wpm, accuracy, totalKeystrokes } = await req.json();

        if (!sessionToken || !examId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const sessionRef = adminDb.collection('users').doc(uid).collection('sessions').doc(sessionToken);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists || !sessionSnap.data()?.active) {
            return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 });
        }

        const sessionData = sessionSnap.data()!;
        const startTime = sessionData.startTime.toDate();
        const endTime = new Date();
        const elapsedTimeSeconds = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

        const minutes = elapsedTimeSeconds / 60;
        const backendWpm = minutes > 0 ? Math.round((totalKeystrokes / 5) / minutes) : 0;

        // Verify frontend WPM isn't impossibly high OR wildly different from backend time
        const validatedWpm = wpm !== undefined ? wpm : backendWpm;

        if (validatedWpm > 300 || Math.abs(validatedWpm - backendWpm) > 15) {
            return NextResponse.json({ error: 'INCOMPLETE_CONTENT', message: 'ข้อมูลไม่ถูกต้อง กรุณาทำแบบทดสอบให้ครบเวลา' }, { status: 400 });
        }

        // Integrity Check: Exams must last ~120 seconds and have minimum keystrokes
        // This prevents finishing a 2-minute test in 5 seconds via dev tools.
        const MIN_EXAM_CHARS = 200; // 20 WPM * 2 minutes = 200 chars
        if (elapsedTimeSeconds < 110 || totalKeystrokes < MIN_EXAM_CHARS) {
            return NextResponse.json({
                passed: false,
                errorCode: 'INCOMPLETE_CONTENT',
                message: 'ข้อมูลไม่ถูกต้อง กรุณาทำแบบทดสอบให้ครบเวลา (Incomplete Exam Session)'
            });
        }

        // Deactivate session
        await sessionRef.update({ active: false });

        // Minimum performance requirement:
        // WPM must be >= 8 AND session must be under 10 minutes
        const MAX_ALLOWED_SECONDS = 600; // 10 minutes
        const MIN_WPM = 8;
        if (validatedWpm < MIN_WPM || elapsedTimeSeconds > MAX_ALLOWED_SECONDS) {
            return NextResponse.json({ passed: false, wpm: validatedWpm, timeTaken: elapsedTimeSeconds });
        }

        // Load User & Exam
        const userRef = adminDb.collection('users').doc(uid);
        const examRef = adminDb.collection('exams').doc(uid);

        const [userSnap, examSnap] = await Promise.all([
            userRef.get(),
            examRef.get()
        ]);

        if (!userSnap.exists || !examSnap.exists) {
            return NextResponse.json({ error: 'User data not found' }, { status: 404 });
        }

        const userData = userSnap.data()!;
        const examData = examSnap.data()!;

        let isPassed = false;

        let examIndex = (examData.milestoneExams || []).findIndex((e: any) => e.examId === Number(examId));

        let existing: any;
        if (examIndex === -1) {
            // Create exam tracking if playing for the first time
            if (!examData.milestoneExams) {
                examData.milestoneExams = [];
            }
            existing = {
                examId: Number(examId),
                isFinished: false,
                wpm: 0,
                accuracy: 0,
                time: 0
            };
            examData.milestoneExams.push(existing);
            examIndex = examData.milestoneExams.length - 1;
        } else {
            existing = examData.milestoneExams[examIndex];
        }

        const oldWpm = existing.wpm || 0;
        const oldAcc = existing.accuracy || 0;

        // const isBetterWpm = validatedWpm > oldWpm;
        // const isSameWpmBetterAcc = validatedWpm === oldWpm && accuracy > oldAcc;

        const isBetterScore = validatedWpm * accuracy > oldWpm * oldAcc;

        const passesCriteria = validatedWpm >= 20 && accuracy >= 80; // Add accuracy requirement for passing exam
        if (passesCriteria) isPassed = true;

        examData.milestoneExams[examIndex] = {
            ...existing,
            isFinished: existing.isFinished || passesCriteria, // Do not un-finish tests
            wpm: isBetterScore || !existing.isFinished ? validatedWpm : existing.wpm,
            accuracy: isBetterScore || !existing.isFinished ? accuracy : existing.accuracy,
            time: isBetterScore || !existing.isFinished ? elapsedTimeSeconds : existing.time
        };

        const batch = adminDb.batch();
        // Explicitly update specific field paths to guarantee array persistence
        batch.update(examRef, {
            milestoneExams: examData.milestoneExams,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        const currentExp = (userData.stats?.exp || 0) + (isPassed && !existing.isFinished ? 500 : 0);
        const totalLearningTime = (userData.stats?.totalLearningTime || 0) + Math.min(elapsedTimeSeconds, 1200);

        // Update Streak
        const lastActiveDate = userData.lastActiveDate 
            ? (userData.lastActiveDate.toDate ? userData.lastActiveDate.toDate() : new Date(userData.lastActiveDate))
            : null;
        const newStreak = calculateNewStreak(userData.stats?.streak || 0, lastActiveDate);

        const userUpdate: any = {
            'stats.exp': currentExp,
            'stats.totalLearningTime': totalLearningTime,
            'stats.streak': newStreak,
            lastActiveDate: admin.firestore.FieldValue.serverTimestamp()
        };

        if (isPassed) {
            userUpdate[`earnedCertificates.exam_${examId}`] = true;
        }

        batch.update(userRef, userUpdate);

        await batch.commit();

        return NextResponse.json({ success: true, wpm: validatedWpm, accuracy, timeTaken: elapsedTimeSeconds });
    } catch (error) {
        console.error('Error saving exam progress:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
