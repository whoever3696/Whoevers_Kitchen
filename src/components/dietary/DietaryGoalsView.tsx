import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, DollarSign, Leaf, Heart, AlertTriangle, Ban, Shield, User } from 'lucide-react';
import { useDietaryGoals } from '../../contexts/DietaryGoalsContext';
import { AddEditDietaryGoalModal } from './AddEditDietaryGoalModal';
import type { Database } from '../../lib/database.types';
import type { GoalType, GoalValue } from '../../types/dietaryGoals';
import {
  isBudgetGoalValue,
  isDiversityGoalValue,
  isNutritionGoalValue,
  isAllergyGoalValue,
  isIntoleranceGoalValue,
  isRestrictionGoalValue,
  isLifestyleGoalValue,
} from '../../types/dietaryGoals';

type DietaryGoal = Database['public']['Tables']['dietary_goals']['Row'];

interface DietaryGoalsViewProps {
  onBack: () => void;
}

export function DietaryGoalsView({ onBack }: DietaryGoalsViewProps) {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useDietaryGoals();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DietaryGoal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddGoal = async (goalType: GoalType, goalValue: GoalValue) => {
    const { error } = await addGoal(goalType, goalValue);
    if (error) throw error;
  };

  const handleEditGoal = async (goalType: GoalType, goalValue: GoalValue) => {
    if (!editingGoal) return;
    const { error } = await updateGoal(editingGoal.id, goalValue);
    if (error) throw error;
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    setDeletingId(id);
    const { error } = await deleteGoal(id);
    if (error) {
      alert('Failed to delete goal');
    }
    setDeletingId(null);
  };

  const openAddModal = () => {
    setEditingGoal(null);
    setShowModal(true);
  };

  const openEditModal = (goal: DietaryGoal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGoal(null);
  };

  const getGoalIcon = (type: GoalType) => {
    switch (type) {
      case 'budget':
        return <DollarSign className="w-5 h-5" />;
      case 'diversity':
        return <Leaf className="w-5 h-5" />;
      case 'nutrition':
        return <Heart className="w-5 h-5" />;
      case 'allergy':
        return <AlertTriangle className="w-5 h-5" />;
      case 'intolerance':
        return <Ban className="w-5 h-5" />;
      case 'restriction':
        return <Shield className="w-5 h-5" />;
      case 'lifestyle':
        return <User className="w-5 h-5" />;
    }
  };

  const getGoalBadgeColor = (type: GoalType) => {
    switch (type) {
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'diversity':
        return 'bg-emerald-100 text-emerald-800';
      case 'nutrition':
        return 'bg-blue-100 text-blue-800';
      case 'allergy':
        return 'bg-red-100 text-red-800';
      case 'intolerance':
        return 'bg-orange-100 text-orange-800';
      case 'restriction':
        return 'bg-yellow-100 text-yellow-800';
      case 'lifestyle':
        return 'bg-teal-100 text-teal-800';
    }
  };

  const formatGoalSummary = (goal: DietaryGoal) => {
    const value = goal.goal_value as GoalValue;

    if (isBudgetGoalValue(value)) {
      return `$${value.amount} ${value.period}`;
    }
    if (isDiversityGoalValue(value)) {
      return `${value.minimumVariety}+ different ${value.type}s ${value.trackingPeriod}`;
    }
    if (isNutritionGoalValue(value)) {
      const parts = [];
      if (value.calorieTarget) parts.push(`${value.calorieTarget} cal`);
      if (value.proteinTarget) parts.push(`${value.proteinTarget}g protein`);
      return parts.join(', ') + ' daily';
    }
    if (isAllergyGoalValue(value)) {
      return `Avoid ${value.allergen}`;
    }
    if (isIntoleranceGoalValue(value)) {
      return `${value.ingredient} - ${value.toleranceLevel}`;
    }
    if (isRestrictionGoalValue(value)) {
      return `${value.restrictionType} (${value.flexibility})`;
    }
    if (isLifestyleGoalValue(value)) {
      const name = value.lifestyleType === 'other' ? value.customName : value.lifestyleType;
      return `${name} - ${value.strictness}`;
    }
    return 'Unknown goal type';
  };

  const categorizeGoals = () => {
    return {
      financial: goals.filter((g) => g.goal_type === 'budget'),
      health: goals.filter((g) => ['diversity', 'nutrition'].includes(g.goal_type)),
      restrictions: goals.filter((g) => ['allergy', 'intolerance', 'restriction'].includes(g.goal_type)),
      lifestyle: goals.filter((g) => g.goal_type === 'lifestyle'),
    };
  };

  const categories = categorizeGoals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Settings
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dietary Goals</h1>
              <p className="text-gray-600 mt-1">Manage your dietary preferences and restrictions</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Goal
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No dietary goals yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first dietary goal to help us personalize your meal planning.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.financial.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Budget & Financial</h2>
                <div className="space-y-3">
                  {categories.financial.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={openEditModal}
                      onDelete={handleDeleteGoal}
                      isDeleting={deletingId === goal.id}
                      getIcon={getGoalIcon}
                      getBadgeColor={getGoalBadgeColor}
                      formatSummary={formatGoalSummary}
                    />
                  ))}
                </div>
              </section>
            )}

            {categories.health.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Health & Nutrition</h2>
                <div className="space-y-3">
                  {categories.health.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={openEditModal}
                      onDelete={handleDeleteGoal}
                      isDeleting={deletingId === goal.id}
                      getIcon={getGoalIcon}
                      getBadgeColor={getGoalBadgeColor}
                      formatSummary={formatGoalSummary}
                    />
                  ))}
                </div>
              </section>
            )}

            {categories.restrictions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Restrictions</h2>
                <div className="space-y-3">
                  {categories.restrictions.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={openEditModal}
                      onDelete={handleDeleteGoal}
                      isDeleting={deletingId === goal.id}
                      getIcon={getGoalIcon}
                      getBadgeColor={getGoalBadgeColor}
                      formatSummary={formatGoalSummary}
                    />
                  ))}
                </div>
              </section>
            )}

            {categories.lifestyle.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h2>
                <div className="space-y-3">
                  {categories.lifestyle.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={openEditModal}
                      onDelete={handleDeleteGoal}
                      isDeleting={deletingId === goal.id}
                      getIcon={getGoalIcon}
                      getBadgeColor={getGoalBadgeColor}
                      formatSummary={formatGoalSummary}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AddEditDietaryGoalModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={editingGoal ? handleEditGoal : handleAddGoal}
        editingGoal={editingGoal}
      />
    </div>
  );
}

interface GoalCardProps {
  goal: DietaryGoal;
  onEdit: (goal: DietaryGoal) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  getIcon: (type: GoalType) => JSX.Element;
  getBadgeColor: (type: GoalType) => string;
  formatSummary: (goal: DietaryGoal) => string;
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  isDeleting,
  getIcon,
  getBadgeColor,
  formatSummary,
}: GoalCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${getBadgeColor(goal.goal_type as GoalType)}`}>
          {getIcon(goal.goal_type as GoalType)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getBadgeColor(goal.goal_type as GoalType)}`}>
              {goal.goal_type}
            </span>
          </div>
          <p className="text-gray-900 font-medium">{formatSummary(goal)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(goal)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit goal"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          disabled={isDeleting}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete goal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
