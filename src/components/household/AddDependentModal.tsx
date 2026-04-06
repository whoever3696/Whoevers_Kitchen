import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useHousehold } from '../../contexts/HouseholdContext';
import type { Database } from '../../lib/database.types';

type HouseholdDependent = Database['public']['Tables']['household_dependents']['Row'];

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDependent?: HouseholdDependent | null;
}

export function AddDependentModal({ isOpen, onClose, editingDependent }: AddDependentModalProps) {
  const { addDependent, updateDependent } = useHousehold();
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | ''>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDependent) {
      setName(editingDependent.name);
      setAgeGroup(editingDependent.age_group || '');
      setDietaryRestrictions(editingDependent.dietary_restrictions || '');
    } else {
      setName('');
      setAgeGroup('');
      setDietaryRestrictions('');
    }
    setError('');
  }, [editingDependent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (editingDependent) {
        result = await updateDependent(
          editingDependent.id,
          name.trim(),
          ageGroup || undefined,
          dietaryRestrictions.trim() || undefined
        );
      } else {
        result = await addDependent(
          name.trim(),
          ageGroup || undefined,
          dietaryRestrictions.trim() || undefined
        );
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Failed to save family member');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingDependent ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Group (Optional)
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as 'child' | 'teen' | 'adult' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Not specified</option>
              <option value="child">Child</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Restrictions (Optional)
            </label>
            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., allergic to peanuts, vegetarian, lactose intolerant"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingDependent ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
