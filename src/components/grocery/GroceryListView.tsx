import { ShoppingCart, Plus, Check } from 'lucide-react';

export function GroceryListView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grocery List</h2>
          <p className="text-gray-600">Your household shopping list</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">Total Items</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">Checked Off</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">Remaining</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Clear Checked
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block bg-gray-100 p-6 rounded-full mb-4">
              <ShoppingCart size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your grocery list is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Add items manually or plan meals to automatically generate your list
            </p>
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              Add First Item
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Smart Shopping Lists</h4>
            <p className="text-sm text-blue-700">
              Items are automatically organized by store section and missing ingredients from meal plans are added automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
