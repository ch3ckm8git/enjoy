import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { unitId, subId, wpm, accuracy, time } = body;

        if (!unitId || !subId) {
            return NextResponse.json({ error: 'Missing unitId or subId' }, { status: 400 });
        }

        // Read current lesson.json
        const dataPath = path.join(process.cwd(), 'data/json/lesson.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: 'lesson.json not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(dataPath, 'utf8');
        const lessonData = JSON.parse(fileData);

        // Find the unit and update sub-unit
        let updated = false;
        let isFirstTimeFinish = false;
        let xpReward = 0;

        lessonData.units = lessonData.units.map((unit: any) => {
            if (unit.unitId === Number(unitId)) {
                unit.subUnits = unit.subUnits.map((sub: any) => {
                    if (sub.subId === Number(subId)) {
                        updated = true;

                        // Calculate "effective WPM" as the metric for a new high score
                        const oldScore = (sub.wpm || 0) * (sub.accuracy || 0);
                        const newScore = wpm * accuracy;

                        // Overwrite if it's the first time finishing, OR if the new overall score is better
                        const isBetterScore = newScore > oldScore;

                        if (!sub.isFinished) {
                            isFirstTimeFinish = true;
                            // Calculate XP based on unitId
                            if (unitId >= 1 && unitId <= 4) xpReward = 100;
                            else if (unitId >= 5 && unitId <= 9) xpReward = 150;
                            else if (unitId >= 10 && unitId <= 13) xpReward = 200;
                            else if (unitId >= 14 && unitId <= 17) xpReward = 300;
                            else xpReward = 100; // fallback
                        }

                        return {
                            ...sub,
                            isFinished: true,
                            wpm: (isBetterScore || !sub.isFinished) ? wpm : sub.wpm,
                            accuracy: (isBetterScore || !sub.isFinished) ? accuracy : sub.accuracy,
                            time: (isBetterScore || !sub.isFinished) ? time : sub.time
                        };
                    }
                    return sub;
                });
            }
            return unit;
        });

        if (!updated) {
            return NextResponse.json({ error: 'Unit or Subunit not found' }, { status: 404 });
        }

        // Update timestamp
        lessonData.lastUpdated = new Date().toISOString();

        // Write back
        fs.writeFileSync(dataPath, JSON.stringify(lessonData, null, 4));

        // -- NEW: Update user.json totalLearningTime --
        const userPath = path.join(process.cwd(), 'data/json/user.json');
        if (fs.existsSync(userPath)) {
            const userData = JSON.parse(fs.readFileSync(userPath, 'utf8'));
            if (!userData.stats) {
                userData.stats = { totalLearningTime: 0 };
            }
            if (typeof userData.stats.totalLearningTime !== 'number') {
                userData.stats.totalLearningTime = 0;
            }

            // Cap the added time to 20 mins (1200 seconds) in case of AFK
            const timeToAdd = Math.min(Number(time) || 0, 1200);
            userData.stats.totalLearningTime += timeToAdd;

            // Add XP if it was the first time finishing
            if (isFirstTimeFinish && xpReward > 0) {
                if (typeof userData.stats.exp !== 'number') {
                    userData.stats.exp = 0;
                }
                userData.stats.exp += xpReward;
            }

            fs.writeFileSync(userPath, JSON.stringify(userData, null, 4));
        }

        return NextResponse.json({ success: true, message: 'Progress saved successfully' });
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
