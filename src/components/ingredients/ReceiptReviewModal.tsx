import { useState, useMemo } from 'react';
import { X, Check, AlertTriangle, ShoppingCart } from 'lucide-react';
import { ParsedReceiptItem, ParsedReceipt } from '../../utils/receiptParser';
import { IngredientMatch } from '../../utils/ingredientMatcher';

interface ReviewItem extends ParsedReceiptItem {
  selected: boolean;
  matchedIngredient: IngredientMatch | null;
  storageLocation: 'pantry' | 'fridge' | 'freezer';
  expirationDays: number | null;
}

interface ReceiptReviewModalProps {
  parsedReceipt: ParsedReceipt;
  ingredientMatches: Map<string, IngredientMatch[]>;
  onClose: () => void;
  onConfirm: (items: ReviewItem[]) => void;
}

export default function ReceiptReviewModal({
  parsedReceipt,
  ingredientMatches,
  onClose,
  onConfirm,
}: ReceiptReviewModalProps) {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() =>
    parsedReceipt.items.map((item) => {
      const matches = ingredientMatches.get(item.itemName) || [];
      const bestMatch = matches[0] || null;

      return {
        ...item,
        selected: item.confidence !== 'low',
        matchedIngredient: bestMatch,
        storageLocation: (bestMatch?.defaultStorage as 'pantry' | 'fridge' | 'freezer') || 'pantry',
        expirationDays: null,
      };
    })
  );

  const selectedCount = useMemo(
    () => reviewItems.filter((item) => item.selected).length,
    [reviewItems]
  );

  const totalPrice = useMemo(
    () =>
      reviewItems
        .filter((item) => item.selected && item.price)
        .reduce((sum, item) => sum + (item.price || 0), 0),
    [reviewItems]
  );

  const toggleItem = (index: number) => {
    setReviewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateItem = (index: number, updates: Partial<ReviewItem>) => {
    setReviewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleSelectMatch = (index: number, match: IngredientMatch | null) => {
    updateItem(index, {
      matchedIngredient: match,
      storageLocation: (match?.defaultStorage as 'pantry' | 'fridge' | 'freezer') || 'pantry',
    });
  };

  const handleConfirm = () => {
    const selectedItems = reviewItems.filter((item) => item.selected);
    onConfirm(selectedItems);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review Receipt Items</h2>
            <p className="text-sm text-gray-600 mt-1">
              {parsedReceipt.storeName && <span className="font-medium">{parsedReceipt.storeName}</span>}
              {parsedReceipt.purchaseDate && <span className="ml-2">• {parsedReceipt.purchaseDate}</span>}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Review and edit the items below. Uncheck any items you don't want to add to your inventory.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedCount === reviewItems.length}
                      onChange={() => {
                        const allSelected = selectedCount === reviewItems.length;
                        setReviewItems((prev) =>
                          prev.map((item) => ({ ...item, selected: !allSelected }))
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                    Storage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewItems.map((item, index) => {
                  const matches = ingredientMatches.get(item.itemName) || [];
                  return (
                    <tr
                      key={index}
                      className={`${item.selected ? 'bg-white' : 'bg-gray-50 opacity-60'} hover:bg-gray-50`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(index)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateItem(index, { itemName: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!item.selected}
                        />
                        {item.matchedIngredient && (
                          <div className="text-xs text-gray-500 mt-1">
                            → {item.matchedIngredient.ingredientName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, { quantity: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!item.selected}
                          step="0.1"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(index, { unit: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!item.selected}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${item.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.storageLocation}
                          onChange={(e) =>
                            updateItem(index, {
                              storageLocation: e.target.value as 'pantry' | 'fridge' | 'freezer',
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!item.selected}
                        >
                          <option value="pantry">Pantry</option>
                          <option value="fridge">Fridge</option>
                          <option value="freezer">Freezer</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.matchedIngredient ? (
                          <div className="flex items-center justify-center">
                            {item.matchedIngredient.matchConfidence === 'high' && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                            {item.matchedIngredient.matchConfidence === 'medium' && (
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            )}
                            {item.matchedIngredient.matchConfidence === 'low' && (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {reviewItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No items detected on the receipt</p>
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{selectedCount}</span> of{' '}
              {reviewItems.length} items selected
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Total: ${totalPrice.toFixed(2)}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
