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

        const { sessionToken, unitId, subId, accuracy, totalKeystrokes, wpm } = await req.json();

        if (!sessionToken || !unitId || !subId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const sessionRef = adminDb.collection('users').doc(uid).collection('sessions').doc(sessionToken);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists || !sessionSnap.data()?.active) {
            return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 });
        }

        const sessionData = sessionSnap.data()!;
        if (sessionData.type !== 'lesson') {
            return NextResponse.json({ error: 'Session type is not lesson' }, { status: 400 });
        }

        const startTime = sessionData.startTime.toDate();
        const endTime = new Date();
        const elapsedTimeSeconds = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

        // Anti-cheat validation
        const minutes = elapsedTimeSeconds / 60;
        const backendWpm = minutes > 0 ? Math.round((totalKeystrokes / 5) / minutes) : 0;

        // Verify frontend WPM isn't impossibly high OR wildly different from backend time
        const validatedWpm = wpm !== undefined ? wpm : backendWpm;

        if (validatedWpm > 300 || Math.abs(validatedWpm - backendWpm) > 15) {
            return NextResponse.json({ error: 'Not done typing' }, { status: 400 });
        }

        // Integrity Check: Verify total character count matches lesson content
        // This prevents finishes with "3 words" via dev tools.
        const targetUnitId = sessionData.unitId || unitId;
        const targetSubId = sessionData.subId || subId;

        const lessonsData = require('@/data/json/output_reindexed_with_test.json');
        const unitKey = `unit_${targetUnitId}`;
        const unitData = lessonsData[unitKey];
        let expectedChars = 0;

        if (unitData) {
            const lessonKey = `${targetUnitId}.${targetSubId}`;
            const drillLines = unitData[lessonKey];
            if (drillLines && Array.isArray(drillLines)) {
                // Prepend special drills if subunit is .1
                let finalLines = [...drillLines];
                if (String(targetSubId) === "1" && unitData.special_drill) {
                    finalLines = [...unitData.special_drill, ...finalLines];
                }

                // Calculate total characters (count all chars in all lines)
                expectedChars = finalLines.reduce((acc, line) => acc + Array.from(line).length, 0);
            }
        }

        // We allow a small tolerance (e.g. 90%) in case of minor discrepancies, 
        // but it must be significantly higher than "3 words".
        if (expectedChars > 0 && totalKeystrokes < expectedChars * 0.9) {
            return NextResponse.json({
                passed: false,
                errorCode: 'INCOMPLETE_CONTENT',
                message: 'เนื้อหาไม่ครบถ้วน กรุณาพิมพ์ให้จบแบบฝึกหัด (Incomplete Content)'
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

        // Load User & Lesson
        const userRef = adminDb.collection('users').doc(uid);
        const lessonRef = adminDb.collection('lessons').doc(uid);

        const [userSnap, lessonSnap] = await Promise.all([
            userRef.get(),
            lessonRef.get()
        ]);

        if (!userSnap.exists || !lessonSnap.exists) {
            return NextResponse.json({ error: 'User data not found' }, { status: 404 });
        }

        const userData = userSnap.data()!;
        const lessonData = lessonSnap.data()!;

        let xpReward = 0;
        let isFirstTimeFinish = false;

        // Find existing unit
        let unitIndex = lessonData.units.findIndex((u: any) => u.unitId === Number(unitId));
        if (unitIndex === -1) {
            // Create unit tracking if playing for the first time
            lessonData.units.push({
                unitId: Number(unitId),
                subUnits: []
            });
            unitIndex = lessonData.units.length - 1;
        }

        const currentSubUnits = lessonData.units[unitIndex].subUnits;
        let subIndex = currentSubUnits.findIndex((s: any) => s.subId === Number(subId));

        let existing: any;
        if (subIndex === -1) {
            // Create subunit tracking
            existing = {
                subId: Number(subId),
                isFinished: false,
                wpm: 0,
                accuracy: 0,
                time: 0
            };
            currentSubUnits.push(existing);
            subIndex = currentSubUnits.length - 1;
        } else {
            existing = currentSubUnits[subIndex];
        }

        const oldWpm = existing.wpm || 0;
        const oldAcc = existing.accuracy || 0;

        // const newWpm = validatedWpm > oldWpm;
        // const isSameWpmBetterAcc = validatedWpm === oldWpm && accuracy > oldAcc;
        const isBetterScore = validatedWpm * accuracy > oldWpm * oldAcc;

        if (!existing.isFinished) {
            isFirstTimeFinish = true;
            if (unitId >= 1 && unitId <= 4) xpReward = 100;
            else if (unitId >= 5 && unitId <= 9) xpReward = 150;
            else if (unitId >= 10 && unitId <= 13) xpReward = 200;
            else if (unitId >= 14 && unitId <= 17) xpReward = 300;
            else xpReward = 100;
        } else {
            // Replay minimal reward 10percent
            xpReward = Math.round((unitId <= 4 ? 100 : unitId <= 9 ? 150 : unitId <= 13 ? 200 : 300) * 0.1);
        }

        currentSubUnits[subIndex] = {
            ...existing,
            isFinished: true,
            wpm: isBetterScore || !existing.isFinished ? validatedWpm : existing.wpm,
            accuracy: isBetterScore || !existing.isFinished ? accuracy : existing.accuracy,
            time: isBetterScore || !existing.isFinished ? elapsedTimeSeconds : existing.time
        };

        lessonData.units[unitIndex].subUnits = currentSubUnits;

        const batch = adminDb.batch();
        // Explicitly update specific field paths to guarantee array persistence
        batch.update(lessonRef, {
            units: lessonData.units,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        const currentExp = (userData.stats?.exp || 0) + xpReward;
        const totalLearningTime = (userData.stats?.totalLearningTime || 0) + Math.min(elapsedTimeSeconds, 1200);

        // Update Streak
        const lastActiveDate = userData.lastActiveDate
            ? (userData.lastActiveDate.toDate ? userData.lastActiveDate.toDate() : new Date(userData.lastActiveDate))
            : null;
        const newStreak = calculateNewStreak(userData.stats?.streak || 0, lastActiveDate);

        batch.update(userRef, {
            'stats.exp': currentExp,
            'stats.totalLearningTime': totalLearningTime,
            'stats.streak': newStreak,
            lastActiveDate: admin.firestore.FieldValue.serverTimestamp()
        });

        // Record typing history
        const historyRef = adminDb.collection('users').doc(uid).collection('typingHistory').doc();
        batch.set(historyRef, {
            wpm: validatedWpm,
            accuracy,
            timeTaken: elapsedTimeSeconds,
            unitId: Number(unitId),
            subId: Number(subId),
            type: 'lesson',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();

        return NextResponse.json({ success: true, wpm: validatedWpm, timeTaken: elapsedTimeSeconds, xpGained: xpReward });
    } catch (error: any) {
        console.error('Error saving progress:', error);
        return NextResponse.json({ error: 'Server error', detail: error?.message || String(error) }, { status: 500 });
    }
}
