import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const body = await req.json().catch(() => ({}));
        const { type } = body;

        // Generate a new session doc
        const sessionRef = adminDb.collection('users').doc(uid).collection('sessions').doc();

        const sessionData: any = {
            startTime: admin.firestore.FieldValue.serverTimestamp(),
            type: type || 'lesson',
            active: true
        };

        if (body.unitId !== undefined) sessionData.unitId = Number(body.unitId);
        if (body.subId !== undefined) sessionData.subId = Number(body.subId);
        if (body.examId !== undefined) sessionData.examId = Number(body.examId);

        await sessionRef.set(sessionData);

        return NextResponse.json({ sessionToken: sessionRef.id });
    } catch (error) {
        console.error('Error starting session:', error);
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
    }
}
