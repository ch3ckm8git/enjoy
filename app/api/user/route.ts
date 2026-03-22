import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const body = await request.json();

        if (!body.username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const userRef = adminDb.collection('users').doc(uid);

        await userRef.update({
            username: body.username
        });

        return NextResponse.json({ success: true, username: body.username });
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
