/**
 * Utility functions for string fuzzy matching
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param a First string
 * @param b Second string
 * @returns The edit distance between the strings
 */
export const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
};

/**
 * Determines if two strings are similar enough based on Levenshtein distance
 * @param source The source string to compare
 * @param target The target string to compare against
 * @param threshold The maximum allowable distance ratio (0 to 1, where lower is stricter)
 * @returns True if strings are considered similar
 */
export const isFuzzyMatch = (source: string, target: string, threshold = 0.3): boolean => {
  if (!source || !target) return false;
  if (source.includes(target) || target.includes(source)) return true;

  const maxLen = Math.max(source.length, target.length);
  if (maxLen === 0) return true;

  const distance = levenshteinDistance(source.toLowerCase(), target.toLowerCase());
  return distance / maxLen <= threshold;
};
