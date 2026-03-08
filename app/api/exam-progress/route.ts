import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { examId, wpm, accuracy, time } = body;

        if (!examId) {
            return NextResponse.json({ error: 'Missing examId' }, { status: 400 });
        }

        // Read current exam.json
        const dataPath = path.join(process.cwd(), 'data/json/exam.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: 'exam.json not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(dataPath, 'utf8');
        const examData = JSON.parse(fileData);

        // Find the unit and update sub-unit
        let updated = false;
        let isPassed = false;

        if (examData.milestoneExams) {
            examData.milestoneExams = examData.milestoneExams.map((exam: any) => {
                if (exam.examId === Number(examId)) {
                    updated = true;

                    // Calculate "effective score" as the metric for a new high score
                    const oldScore = (exam.wpm || 0) * (exam.accuracy || 0);
                    const newScore = wpm * accuracy;

                    // Overwrite if it's the first time finishing, OR if the new overall score is better
                    const isBetterScore = newScore > oldScore;
                    const passesCriteria = wpm >= 20;

                    if (passesCriteria) {
                        isPassed = true;
                    }

                    return {
                        ...exam,
                        isFinished: exam.isFinished || passesCriteria, // Do not un-finish tests
                        wpm: (isBetterScore || !exam.isFinished) ? wpm : exam.wpm,
                        accuracy: (isBetterScore || !exam.isFinished) ? accuracy : exam.accuracy,
                        time: (isBetterScore || !exam.isFinished) ? time : exam.time
                    };
                }
                return exam;
            });
        }

        if (!updated) {
            return NextResponse.json({ error: 'Milestone Exam not found' }, { status: 404 });
        }

        // Update timestamp
        examData.lastUpdated = new Date().toISOString();

        // Write back exam.json
        fs.writeFileSync(dataPath, JSON.stringify(examData, null, 4));

        // -- NEW: Update user.json with certificate if passed, AND update totalLearningTime --
        const userPath = path.join(process.cwd(), 'data/json/user.json');
        if (fs.existsSync(userPath)) {
            const userData = JSON.parse(fs.readFileSync(userPath, 'utf8'));

            // Certificate check
            if (isPassed) {
                if (!userData.earnedCertificates) {
                    userData.earnedCertificates = {};
                }
                if (Array.isArray(userData.earnedCertificates)) {
                    // Handle legacy array format if exists
                    userData.earnedCertificates = {};
                }
                userData.earnedCertificates[`exam_${examId}`] = true;
            }

            // Learning Time update
            if (!userData.stats) {
                userData.stats = { totalLearningTime: 0 };
            }
            if (typeof userData.stats.totalLearningTime !== 'number') {
                userData.stats.totalLearningTime = 0;
            }

            // Cap the added time to 20 mins (1200 seconds) in case of AFK
            const timeToAdd = Math.min(Number(time) || 0, 1200);
            userData.stats.totalLearningTime += timeToAdd;

            fs.writeFileSync(userPath, JSON.stringify(userData, null, 4));
        }

        return NextResponse.json({ success: true, message: 'Exam progress saved successfully' });
    } catch (error) {
        console.error('Error saving exam progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
