import React, { useState } from 'react';
import { itemsAPI } from '../services/api';
import { X, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';

const StockAdjustmentModal = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'in',
    quantity: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (formData.type === 'out' && quantity > item.totalStock) {
      setError(`Insufficient stock. Available: ${item.totalStock}`);
      return;
    }

    setLoading(true);

    try {
      // Use the correct API method
      await itemsAPI.stockAdjustment(item._id, {
        type: formData.type,
        quantity: quantity,
        notes: formData.notes || `${formData.type.toUpperCase()} adjustment`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Stock adjustment error:', error);
      setError(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const quickQuantities = formData.type === 'in' ? [1, 5, 10, 50, 100] : [1, 2, 5, 10, 20];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Stock Adjustment</h3>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Stock Overview */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Stock In</p>
              <p className="text-2xl font-bold text-green-600">{item.stockIn}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Stock Out</p>
              <p className="text-2xl font-bold text-red-600">{item.stockOut}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className={`text-2xl font-bold ${
                item.totalStock < (item.stockIn * 0.2) 
                  ? 'text-red-600'
                  : item.totalStock < (item.stockIn * 0.5)
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`}>
                {item.totalStock}
              </p>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'in'})}
                className={`flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
                  formData.type === 'in'
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                }`}
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-medium">Stock In</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'out'})}
                className={`flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
                  formData.type === 'out'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                }`}
              >
                <Minus className="h-5 w-5 mr-2" />
                <span className="font-medium">Stock Out</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              max={formData.type === 'out' ? item.totalStock : undefined}
              required
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder={`Enter ${formData.type} quantity`}
            />
            
            {/* Quick Quantity Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickQuantities.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setFormData({...formData, quantity: qty.toString()})}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter adjustment notes..."
            />
          </div>

          {/* Preview */}
          {formData.quantity && !isNaN(parseInt(formData.quantity)) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>After adjustment:</p>
                <p className="font-semibold">
                  Stock {formData.type === 'in' ? 'In' : 'Out'}: {item[formData.type === 'in' ? 'stockIn' : 'stockOut']} + {formData.quantity} = {item[formData.type === 'in' ? 'stockIn' : 'stockOut'] + parseInt(formData.quantity)}
                </p>
                <p className="font-semibold">
                  Total Stock: {formData.type === 'in' ? item.totalStock + parseInt(formData.quantity) : item.totalStock - parseInt(formData.quantity)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center gap-2 ${
                formData.type === 'in'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  {formData.type === 'in' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  Confirm {formData.type === 'in' ? 'Stock In' : 'Stock Out'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;