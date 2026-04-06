import { useState } from 'react';
import { useHousehold } from '../../contexts/HouseholdContext';
import { Home, Users, ArrowRight } from 'lucide-react';

interface HouseholdSetupProps {
  onComplete: () => void;
}

export function HouseholdSetup({ onComplete }: HouseholdSetupProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [householdName, setHouseholdName] = useState('');
  const [travelTime, setTravelTime] = useState(15);
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createHousehold, joinHousehold } = useHousehold();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await createHousehold(householdName, travelTime);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onComplete();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await joinHousehold(invitationCode);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onComplete();
    }
  };

  if (mode === 'choose') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Whoever's Kitchen</h2>
          <p className="text-lg text-gray-600">
            Let's set up your kitchen. You can create a new household or join an existing one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('create')}
            className="bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <Home size={32} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Household</h3>
            <p className="text-gray-600">
              Start fresh with your own kitchen setup. You'll be the admin and can invite others later.
            </p>
          </button>

          <button
            onClick={() => setMode('join')}
            className="bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Users size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Join Existing Household</h3>
            <p className="text-gray-600">
              Join a kitchen that's already been set up by a family member or roommate.
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your Household</h2>
          <p className="text-gray-600">Tell us about your kitchen</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-2">
              Household Name
            </label>
            <input
              id="householdName"
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="The Smith Family Kitchen"
            />
          </div>

          <div>
            <label htmlFor="travelTime" className="block text-sm font-medium text-gray-700 mb-2">
              Travel Time to Grocery Store (minutes)
            </label>
            <input
              id="travelTime"
              type="number"
              min="0"
              value={travelTime}
              onChange={(e) => setTravelTime(parseInt(e.target.value))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              This helps calculate total cooking time when ingredients need to be purchased
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Join a Household</h2>
        <p className="text-gray-600">Enter the invitation code you received</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
            Invitation Code
          </label>
          <input
            id="invitationCode"
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value.trim())}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-wider"
            placeholder="ABC12345"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('choose')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Join
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
