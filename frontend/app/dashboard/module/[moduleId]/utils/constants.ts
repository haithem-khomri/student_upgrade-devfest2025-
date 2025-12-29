export const DIFFICULTY_LABELS = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
} as const;

export const DIFFICULTY_COLORS = {
  easy: "text-green-400 bg-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/20",
  hard: "text-red-400 bg-red-400/20",
  default: "text-gray-400 bg-gray-400/20",
} as const;

export function getDifficultyColor(difficulty: string): string {
  return (
    DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] ||
    DIFFICULTY_COLORS.default
  );
}

export function getDifficultyText(difficulty: string): string {
  return (
    DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS] ||
    difficulty
  );
}

export function getDifficultyLabel(diff: number): string {
  if (diff <= 3) return "سهل";
  if (diff <= 6) return "متوسط";
  return "صعب";
}

