/**
 * Calculates the new streak based on the last active date and the current date.
 * Uses UTC calendar days for consistency.
 * 
 * @param currentStreak The current streak count
 * @param lastActiveDate The last recorded active date (Firestore Timestamp or Date)
 * @param nowDate The current date
 * @returns The updated streak count
 */
export function calculateNewStreak(
    currentStreak: number,
    lastActiveDate: Date | null,
    nowDate: Date = new Date()
): number {
    if (!lastActiveDate) {
        return 1;
    }

    // Get UTC date strings (YYYY-MM-DD) to compare calendar days
    const lastDateStr = lastActiveDate.toISOString().split('T')[0];
    const nowDateStr = nowDate.toISOString().split('T')[0];

    // If it's the same day, keep the streak
    if (lastDateStr === nowDateStr) {
        return currentStreak || 1;
    }

    // Calculate the difference in calendar days
    const lastTime = new Date(lastDateStr).getTime();
    const nowTime = new Date(nowDateStr).getTime();
    const dayDiff = Math.round((nowTime - lastTime) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
        // Consecutive day!
        return (currentStreak || 0) + 1;
    } else if (dayDiff > 1) {
        // Missed at least one day
        return 1;
    }

    // dayDiff < 0 should not happen with current time, but return currentStreak just in case
    return currentStreak || 1;
}
