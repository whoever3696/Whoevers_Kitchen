import { useState } from 'react';
import { Package, Plus } from 'lucide-react';

type StorageTab = 'pantry' | 'fridge' | 'freezer';

export function IngredientsView() {
  const [activeTab, setActiveTab] = useState<StorageTab>('pantry');

  const tabs: { id: StorageTab; label: string }[] = [
    { id: 'pantry', label: 'Pantry' },
    { id: 'fridge', label: 'Fridge' },
    { id: 'freezer', label: 'Freezer' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingredients</h2>
          <p className="text-gray-600">Manage your kitchen inventory</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
          <Plus size={20} />
          Add Ingredient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block bg-gray-100 p-6 rounded-full mb-4">
              <Package size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No ingredients in {activeTab}
            </h3>
            <p className="text-gray-600 mb-6">
              Start tracking your ingredients to get personalized recipe suggestions
            </p>
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              Add Your First Ingredient
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-1">Quick Add</h4>
          <p className="text-sm text-blue-700">
            Add common staple ingredients quickly with smart defaults
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-1">Track Expiration</h4>
          <p className="text-sm text-green-700">
            Get notified when ingredients are about to expire
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-1">Auto Grocery List</h4>
          <p className="text-sm text-purple-700">
            Low stock items automatically added to your list
          </p>
        </div>
      </div>
    </div>
  );
}
