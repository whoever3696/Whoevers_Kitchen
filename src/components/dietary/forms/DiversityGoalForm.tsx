import { useState, useEffect } from 'react';
import type { DiversityGoalValue } from '../../../types/dietaryGoals';

interface DiversityGoalFormProps {
  value?: DiversityGoalValue;
  onChange: (value: DiversityGoalValue) => void;
}

export function DiversityGoalForm({ value, onChange }: DiversityGoalFormProps) {
  const [type, setType] = useState<'vegetable' | 'protein'>(value?.type || 'vegetable');
  const [minimumVariety, setMinimumVariety] = useState(value?.minimumVariety || 5);
  const [trackingPeriod, setTrackingPeriod] = useState<'weekly' | 'monthly'>(
    value?.trackingPeriod || 'weekly'
  );

  useEffect(() => {
    onChange({
      type,
      minimumVariety,
      trackingPeriod,
    });
  }, [type, minimumVariety, trackingPeriod]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diversity Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'vegetable' | 'protein')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="vegetable">Vegetable Variety</option>
          <option value="protein">Protein Variety</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Different Types
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={minimumVariety}
          onChange={(e) => setMinimumVariety(parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          Track at least {minimumVariety} different {type === 'vegetable' ? 'vegetables' : 'protein sources'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tracking Period
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="weekly"
              checked={trackingPeriod === 'weekly'}
              onChange={(e) => setTrackingPeriod(e.target.value as 'weekly')}
              className="mr-2"
            />
            Weekly
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="monthly"
              checked={trackingPeriod === 'monthly'}
              onChange={(e) => setTrackingPeriod(e.target.value as 'monthly')}
              className="mr-2"
            />
            Monthly
          </label>
        </div>
      </div>
    </div>
  );
}
