import { useState, useEffect } from 'react';
import { User, Home, Target, Bell, ChefHat, Plus, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useKitchen } from '../../contexts/KitchenContext';
import { KitchenSetup } from '../onboarding/KitchenSetup';

export function SettingsView() {
  const { user } = useAuth();
  const { household, members } = useHousehold();
  const { locations, loading, fetchLocations, deleteKitchenLocation } = useKitchen();
  const [showKitchenSetup, setShowKitchenSetup] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleDeleteLocation = async (location: string) => {
    if (confirm(`Are you sure you want to delete the "${location}" kitchen? This will remove all associated appliances and implements.`)) {
      try {
        await deleteKitchenLocation(location);
      } catch (error) {
        alert('Failed to delete kitchen location. Please try again.');
      }
    }
  };

  if (showKitchenSetup) {
    return (
      <div>
        <button
          onClick={() => {
            setShowKitchenSetup(false);
            setEditingLocation(null);
          }}
          className="mb-4 text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Back to Settings
        </button>
        <KitchenSetup
          initialLocation={editingLocation || undefined}
          onComplete={() => {
            setShowKitchenSetup(false);
            setEditingLocation(null);
            fetchLocations();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Serving Size
              </label>
              <input
                type="number"
                defaultValue={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="nutrition"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="nutrition" className="text-sm text-gray-700">
                Calculate and display nutritional information
              </label>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Home size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Household</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Household Name
              </label>
              <input
                type="text"
                value={household?.name || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Travel Time (minutes)
              </label>
              <input
                type="number"
                value={household?.store_travel_time_minutes || 15}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invitation Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={household?.invitation_code || ''}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono"
                />
                <button
                  onClick={() => household && navigator.clipboard.writeText(household.invitation_code)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Household Members: {members.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <ChefHat size={20} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kitchen Locations</h3>
            </div>
            <button
              onClick={() => setShowKitchenSetup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus size={16} />
              Add Kitchen
            </button>
          </div>
          <div className="space-y-3">
            {loading && locations.length === 0 ? (
              <p className="text-sm text-gray-600">Loading kitchens...</p>
            ) : locations.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 mb-4">No kitchens set up yet</p>
                <button
                  onClick={() => setShowKitchenSetup(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Set Up Your First Kitchen
                </button>
              </div>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.location}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{loc.location}</h4>
                    <p className="text-sm text-gray-600">
                      {loc.applianceCount} appliances, {loc.implementCount} tools
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLocation(loc.location);
                        setShowKitchenSetup(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit kitchen"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.location)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete kitchen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Dietary Goals</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure your dietary preferences, restrictions, and goals to get personalized recipe suggestions.
            </p>
            <button className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Manage Dietary Goals
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Bell size={20} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="expiring" className="text-sm text-gray-700">
                Expiring ingredients
              </label>
              <input
                type="checkbox"
                id="expiring"
                defaultChecked
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="meal-reminders" className="text-sm text-gray-700">
                Meal reminders
              </label>
              <input
                type="checkbox"
                id="meal-reminders"
                defaultChecked
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="low-stock" className="text-sm text-gray-700">
                Low stock alerts
              </label>
              <input
                type="checkbox"
                id="low-stock"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Danger Zone</h4>
        <p className="text-sm text-red-700 mb-4">
          These actions are permanent and cannot be undone.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
          Leave Household
        </button>
      </div>
    </div>
  );
}
