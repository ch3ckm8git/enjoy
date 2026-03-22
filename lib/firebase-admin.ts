import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.warn('Firebase Admin Error: Check your FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY env vars.');
        // Initialize dummy app or empty config to prevent build crash
        admin.initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dev" });
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
