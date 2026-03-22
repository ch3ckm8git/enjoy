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

        const { sessionToken, timeToAddSeconds, isFreeType, totalKeystrokes } = await req.json();

        if (!sessionToken || !timeToAddSeconds) {
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

        // Deactivate session
        await sessionRef.update({ active: false });

        // Use verified backend time
        const actualTimeToAdd = Math.min(elapsedTimeSeconds, 3600); // Max 1 hour free type session

        // Anti-cheat: Validate strokes against actual backend time
        const minutes = actualTimeToAdd / 60;
        const wpm = minutes > 0 ? Math.round((totalKeystrokes / 5) / minutes) : 0;

        let xpReward = 0;
        let finalTimeToAdd = actualTimeToAdd;

        const userRef = adminDb.collection('users').doc(uid);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userSnap.data()!;

        // Anti-Cheat: Idle afk penalty
        if (wpm < 8) {
            finalTimeToAdd = 0;
            xpReward = 0;
        } else if (isFreeType) {
            if (actualTimeToAdd >= 120) xpReward = 100;
            else if (actualTimeToAdd >= 60) xpReward = 50;
            else if (actualTimeToAdd >= 45) xpReward = 37.5;
            else if (actualTimeToAdd >= 30) xpReward = 25;
            else if (actualTimeToAdd >= 15) xpReward = 12.5;
        }

        const currentExp = (userData.stats?.exp || 0) + xpReward;
        const totalLearningTime = (userData.stats?.totalLearningTime || 0) + finalTimeToAdd;

        // Update Streak
        const lastActiveDate = userData.lastActiveDate 
            ? (userData.lastActiveDate.toDate ? userData.lastActiveDate.toDate() : new Date(userData.lastActiveDate))
            : null;
        const newStreak = calculateNewStreak(userData.stats?.streak || 0, lastActiveDate);

        await userRef.update({
            'stats.exp': currentExp,
            'stats.totalLearningTime': totalLearningTime,
            'stats.streak': newStreak,
            lastActiveDate: admin.firestore.FieldValue.serverTimestamp()
        });

        return NextResponse.json({ success: true, updatedTime: totalLearningTime, xpGained: xpReward, wpm });
    } catch (error) {
        console.error('Error adding time:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
