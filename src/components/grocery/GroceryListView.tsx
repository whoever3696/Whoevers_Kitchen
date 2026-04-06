import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Check, Trash2, X } from 'lucide-react';
import { useGrocery } from '../../contexts/GroceryContext';
import { useIngredient } from '../../contexts/IngredientContext';

export function GroceryListView() {
  const { groceryItems, loading, fetchGroceryItems, addGroceryItem, toggleChecked, deleteGroceryItem, clearCheckedItems } = useGrocery();
  const { masterIngredients, fetchMasterIngredients } = useIngredient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchGroceryItems();
    fetchMasterIngredients();
  }, [fetchGroceryItems, fetchMasterIngredients]);

  const totalItems = groceryItems.length;
  const checkedItems = groceryItems.filter(item => item.is_checked).length;
  const remainingItems = totalItems - checkedItems;

  const handleAddItem = async () => {
    try {
      await addGroceryItem({
        ingredientId: selectedIngredient || null,
        customItemName: customName || undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit || undefined,
        notes: notes || undefined,
      });
      setShowAddModal(false);
      setSelectedIngredient('');
      setCustomName('');
      setQuantity('');
      setUnit('');
      setNotes('');
    } catch (error) {
      console.error('Error adding grocery item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleToggleChecked = async (id: string, currentChecked: boolean) => {
    try {
      await toggleChecked(id, !currentChecked);
    } catch (error) {
      console.error('Error toggling item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteGroceryItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleClearChecked = async () => {
    if (checkedItems === 0) return;
    if (!confirm(`Remove ${checkedItems} checked item${checkedItems > 1 ? 's' : ''} from the list?`)) return;
    try {
      await clearCheckedItems();
    } catch (error) {
      console.error('Error clearing checked items:', error);
      alert('Failed to clear items. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grocery List</h2>
          <p className="text-gray-600">Your household shopping list</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          <p className="text-sm text-gray-600">Total Items</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{checkedItems}</p>
          <p className="text-sm text-gray-600">Checked Off</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">{remainingItems}</p>
          <p className="text-sm text-gray-600">Remaining</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
            {checkedItems > 0 && (
              <button
                onClick={handleClearChecked}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear Checked ({checkedItems})
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : groceryItems.length === 0 ? (
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
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {groceryItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                    item.is_checked ? 'bg-gray-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.is_checked || false}
                    onChange={() => handleToggleChecked(item.id, item.is_checked || false)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${item.is_checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.ingredient_name}
                    </p>
                    {(item.quantity || item.unit || item.notes) && (
                      <p className="text-sm text-gray-600">
                        {item.quantity && item.unit ? `${item.quantity} ${item.unit}` : item.quantity || item.unit || ''}
                        {item.notes && ` • ${item.notes}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Automatic Ingredient Transfer</h4>
            <p className="text-sm text-blue-700">
              When you check off an item, it's automatically added to your Ingredients list with appropriate storage settings. Use "Clear Checked" to remove completed items from this list.
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Add Grocery Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Ingredient (Optional)
                </label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Select or enter custom name --</option>
                  {masterIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Organic milk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., lbs"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Get from deli counter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!selectedIngredient && !customName}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
