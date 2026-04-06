import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useIngredient } from '../../contexts/IngredientContext';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIngredient?: {
    id: string;
    ingredient_id: string | null;
    custom_name: string | null;
    quantity: number;
    unit: string;
    storage_location: 'pantry' | 'fridge' | 'freezer';
    expiration_date: string | null;
  } | null;
}

const commonUnits = [
  'cups',
  'tbsp',
  'tsp',
  'oz',
  'lb',
  'g',
  'kg',
  'mL',
  'L',
  'pieces',
  'cans',
  'packages',
  'bunches',
  'heads',
];

export function AddIngredientModal({ isOpen, onClose, editingIngredient }: AddIngredientModalProps) {
  const { masterIngredients, addIngredient, updateIngredient, fetchMasterIngredients } = useIngredient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [storageLocation, setStorageLocation] = useState<'pantry' | 'fridge' | 'freezer'>('pantry');
  const [expirationDate, setExpirationDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [useCustomName, setUseCustomName] = useState(false);

  useEffect(() => {
    if (masterIngredients.length === 0) {
      fetchMasterIngredients();
    }
  }, [masterIngredients.length, fetchMasterIngredients]);

  useEffect(() => {
    if (editingIngredient) {
      setSelectedIngredientId(editingIngredient.ingredient_id);
      setCustomName(editingIngredient.custom_name || '');
      setQuantity(editingIngredient.quantity.toString());
      setUnit(editingIngredient.unit);
      setStorageLocation(editingIngredient.storage_location);
      setExpirationDate(editingIngredient.expiration_date || '');
      setUseCustomName(!editingIngredient.ingredient_id);
    } else {
      setSelectedIngredientId(null);
      setCustomName('');
      setQuantity('1');
      setUnit('pieces');
      setStorageLocation('pantry');
      setExpirationDate('');
      setUseCustomName(false);
    }
  }, [editingIngredient]);

  const filteredIngredients = masterIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedIngredient = masterIngredients.find((ing) => ing.id === selectedIngredientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!useCustomName && !selectedIngredientId) {
      alert('Please select an ingredient or use a custom name');
      return;
    }

    if (useCustomName && !customName.trim()) {
      alert('Please enter a custom ingredient name');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setSaving(true);
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, {
          quantity: quantityNum,
          unit,
          storageLocation,
          expirationDate: expirationDate || null,
        });
      } else {
        await addIngredient({
          ingredientId: useCustomName ? null : selectedIngredientId,
          customName: useCustomName ? customName : undefined,
          quantity: quantityNum,
          unit,
          storageLocation,
          expirationDate: expirationDate || undefined,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Failed to save ingredient. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleIngredientSelect = (ingredientId: string) => {
    setSelectedIngredientId(ingredientId);
    const ingredient = masterIngredients.find((ing) => ing.id === ingredientId);
    if (ingredient?.default_storage) {
      setStorageLocation(ingredient.default_storage as 'pantry' | 'fridge' | 'freezer');
    }
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!editingIngredient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!useCustomName}
                    onChange={() => setUseCustomName(false)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Select from list</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={useCustomName}
                    onChange={() => setUseCustomName(true)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Custom name</span>
                </label>
              </div>

              {!useCustomName ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Ingredients
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type to search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {selectedIngredient ? (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{selectedIngredient.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{selectedIngredient.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedIngredientId(null)}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        Change
                      </button>
                    </div>
                  ) : searchTerm && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredIngredients.length > 0 ? (
                        filteredIngredients.map((ingredient) => (
                          <button
                            key={ingredient.id}
                            type="button"
                            onClick={() => handleIngredientSelect(ingredient.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">{ingredient.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{ingredient.category}</p>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600 p-4 text-center">No ingredients found</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Ingredient Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Special Sauce, Mom's Spice Mix"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.01"
                min="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {commonUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage Location
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['pantry', 'fridge', 'freezer'] as const).map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => setStorageLocation(location)}
                  className={`px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                    storageLocation === location
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!useCustomName && !selectedIngredientId && !editingIngredient)}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : editingIngredient ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
