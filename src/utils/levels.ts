const BASE_XP = 100;
const FACTOR = 1.5;

export function requirementForLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.round(BASE_XP * Math.pow(FACTOR, level - 1));
}

export function cumulativeForLevel(level: number): number {
  if (level <= 0) return 0;
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += requirementForLevel(i);
  }
  return total;
}

export function deriveLevelFromXp(xpTotal: number, maxLevel = 100): number {
  let level = 0;
  // Incrementa enquanto XP total atinge a cumulativa do próximo nível
  while (level < maxLevel && xpTotal >= cumulativeForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function getProgressToNextLevel(xpTotal: number, level: number) {
  const currentLevelXp = cumulativeForLevel(level);
  const nextLevelXp = cumulativeForLevel(level + 1);
  const withinLevelXp = xpTotal - currentLevelXp;
  const nextRequirement = nextLevelXp - currentLevelXp;
  const percent = nextRequirement > 0 ? (withinLevelXp / nextRequirement) * 100 : 0;

  return { withinLevelXp, nextRequirement, percent };
}

