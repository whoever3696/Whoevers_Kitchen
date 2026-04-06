export type GoalType =
  | 'budget'
  | 'diversity'
  | 'nutrition'
  | 'allergy'
  | 'intolerance'
  | 'restriction'
  | 'lifestyle';

export interface BudgetGoalValue {
  amount: number;
  period: 'weekly' | 'monthly';
  household_id: string;
}

export interface DiversityGoalValue {
  type: 'vegetable' | 'protein';
  minimumVariety: number;
  trackingPeriod: 'weekly' | 'monthly';
}

export interface NutritionGoalValue {
  calorieTarget?: number;
  proteinTarget?: number;
}

export interface AllergyGoalValue {
  allergen: string;
}

export interface IntoleranceGoalValue {
  ingredient: string;
  toleranceLevel: 'never' | 'rarely' | 'occasionally';
}

export interface RestrictionGoalValue {
  restrictionType: string;
  flexibility: 'strict' | 'moderate' | 'flexible';
  notes?: string;
}

export interface LifestyleGoalValue {
  lifestyleType: 'vegan' | 'vegetarian' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'low-carb' | 'low-fat' | 'gluten-free' | 'dairy-free' | 'other';
  strictness: 'strict' | 'flexible';
  customName?: string;
}

export type GoalValue =
  | BudgetGoalValue
  | DiversityGoalValue
  | NutritionGoalValue
  | AllergyGoalValue
  | IntoleranceGoalValue
  | RestrictionGoalValue
  | LifestyleGoalValue;

export function isBudgetGoalValue(value: GoalValue): value is BudgetGoalValue {
  return 'amount' in value && 'period' in value && 'household_id' in value;
}

export function isDiversityGoalValue(value: GoalValue): value is DiversityGoalValue {
  return 'type' in value && 'minimumVariety' in value && 'trackingPeriod' in value;
}

export function isNutritionGoalValue(value: GoalValue): value is NutritionGoalValue {
  return 'calorieTarget' in value || 'proteinTarget' in value;
}

export function isAllergyGoalValue(value: GoalValue): value is AllergyGoalValue {
  return 'allergen' in value && !('toleranceLevel' in value);
}

export function isIntoleranceGoalValue(value: GoalValue): value is IntoleranceGoalValue {
  return 'ingredient' in value && 'toleranceLevel' in value;
}

export function isRestrictionGoalValue(value: GoalValue): value is RestrictionGoalValue {
  return 'restrictionType' in value && 'flexibility' in value;
}

export function isLifestyleGoalValue(value: GoalValue): value is LifestyleGoalValue {
  return 'lifestyleType' in value && 'strictness' in value;
}
