export interface IngredientMatch {
  ingredientId: string;
  ingredientName: string;
  category: string;
  defaultStorage: string;
  matchScore: number;
  matchConfidence: 'high' | 'medium' | 'low';
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  default_storage: string;
}

export function findIngredientMatches(
  itemName: string,
  ingredients: Ingredient[]
): IngredientMatch[] {
  const normalizedItemName = normalizeText(itemName);
  const matches: IngredientMatch[] = [];

  for (const ingredient of ingredients) {
    const normalizedIngredientName = normalizeText(ingredient.name);
    const score = calculateMatchScore(normalizedItemName, normalizedIngredientName);

    if (score > 0.3) {
      matches.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        category: ingredient.category,
        defaultStorage: ingredient.default_storage || 'pantry',
        matchScore: score,
        matchConfidence: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low',
      });
    }
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, 5);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateMatchScore(itemName: string, ingredientName: string): number {
  if (itemName === ingredientName) {
    return 1.0;
  }

  if (itemName.includes(ingredientName) || ingredientName.includes(itemName)) {
    const longer = Math.max(itemName.length, ingredientName.length);
    const shorter = Math.min(itemName.length, ingredientName.length);
    return 0.7 + (shorter / longer) * 0.3;
  }

  const itemWords = itemName.split(' ');
  const ingredientWords = ingredientName.split(' ');

  let matchingWords = 0;
  for (const itemWord of itemWords) {
    for (const ingredientWord of ingredientWords) {
      if (itemWord === ingredientWord || itemWord.startsWith(ingredientWord) || ingredientWord.startsWith(itemWord)) {
        matchingWords++;
        break;
      }
    }
  }

  const wordMatchScore = matchingWords / Math.max(itemWords.length, ingredientWords.length);

  const levenshteinScore = 1 - (levenshteinDistance(itemName, ingredientName) / Math.max(itemName.length, ingredientName.length));

  return Math.max(wordMatchScore, levenshteinScore);
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}
