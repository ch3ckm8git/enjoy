import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { timeToAddSeconds, isFreeType } = body;

        if (!timeToAddSeconds || typeof timeToAddSeconds !== 'number') {
            return NextResponse.json({ error: 'Missing or invalid timeToAddSeconds' }, { status: 400 });
        }

        const dataPath = path.join(process.cwd(), 'data/json/user.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: 'user.json not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(dataPath, 'utf8');
        const userData = JSON.parse(fileData);

        if (!userData.stats) {
            userData.stats = { totalLearningTime: 0 };
        }
        if (typeof userData.stats.totalLearningTime !== 'number') {
            userData.stats.totalLearningTime = 0;
        }

        userData.stats.totalLearningTime += timeToAddSeconds;

        // NEW: Add XP for Free Type
        if (isFreeType) {
            let xpReward = 0;
            if (timeToAddSeconds >= 120) xpReward = 100;
            else if (timeToAddSeconds >= 60) xpReward = 75;
            else if (timeToAddSeconds >= 45) xpReward = 50;
            else if (timeToAddSeconds >= 30) xpReward = 25;
            else if (timeToAddSeconds >= 15) xpReward = 12.5;

            if (xpReward > 0) {
                if (typeof userData.stats.exp !== 'number') userData.stats.exp = 0;
                userData.stats.exp += Math.floor(xpReward); // Floor to keep integers, or keep decimals if desired
            }
        }

        fs.writeFileSync(dataPath, JSON.stringify(userData, null, 4));

        return NextResponse.json({ success: true, updatedTime: userData.stats.totalLearningTime });
    } catch (error) {
        console.error('Error adding time:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
