export function getMaxXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.1, level));
}

export function calculateLevelAndProgress(totalXp: number): {
  level: number;
  currentXp: number;
  maxXp: number;
  progressPercentage: number;
} {
  let level = 0;
  let remainingXp = totalXp;
  let maxXp = getMaxXpForLevel(level);

  while (remainingXp >= maxXp && level < 10000) {
    remainingXp -= maxXp;
    level++;
    maxXp = getMaxXpForLevel(level);
  }

  return {
    level,
    currentXp: remainingXp,
    maxXp,
    progressPercentage: Math.min(100, Math.max(0, (remainingXp / maxXp) * 100)),
  };
}

export function getRankTag(level: number, langData: any): string {
  const ranks = langData?.lessons?.ranks || langData?.ranks;
  if (level < 10) return ranks?.beginner || "Beginner";
  if (level < 30) return ranks?.intermediate || "Intermediate";
  return ranks?.pro || "Pro";
}
