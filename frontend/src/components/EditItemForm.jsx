import React, { useState } from 'react';
import { itemsAPI } from '../services/api';
import { X, Save, Plus, Minus } from 'lucide-react';

const EditItemForm = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: item?.description || '',
    unit: item?.unit || '',
    stockIn: item?.stockIn || 0,
    stockOut: item?.stockOut || 0,
    totalStock: item?.totalStock || 0
  });
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'in',
    quantity: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'adjust'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        description: formData.description.trim(),
        unit: formData.unit,
        stockIn: parseInt(formData.stockIn),
        stockOut: parseInt(formData.stockOut),
        totalStock: parseInt(formData.totalStock)
      };

      await itemsAPI.update(item._id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const quantity = parseInt(stockAdjustment.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      const updateData = {
        stockIn: stockAdjustment.type === 'in' ? item.stockIn + quantity : item.stockIn,
        stockOut: stockAdjustment.type === 'out' ? item.stockOut + quantity : item.stockOut
      };

      // Add to history
      const historyUpdate = {
        quantity: quantity,
        type: stockAdjustment.type,
        notes: stockAdjustment.notes || `${stockAdjustment.type.toUpperCase()} adjustment`
      };

      await itemsAPI.update(item._id, {
        ...updateData,
        $push: { history: historyUpdate }
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adjusting stock:', error);
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

  const handleAdjustmentChange = (e) => {
    setStockAdjustment({
      ...stockAdjustment,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Edit Item - {item?.description}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'edit'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Edit Details
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'adjust'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Adjustment
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {activeTab === 'edit' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="PCS">PCS</option>
                    <option value="ROLL">ROLL</option>
                    <option value="SET">SET</option>
                    <option value="BOX">BOX</option>
                    <option value="METER">METER</option>
                    <option value="KG">KG</option>
                    <option value="LITER">LITER</option>
                    <option value="UNIT">UNIT</option>
                    <option value="PAIR">PAIR</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock In
                  </label>
                  <input
                    type="number"
                    name="stockIn"
                    min="0"
                    value={formData.stockIn}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Out
                  </label>
                  <input
                    type="number"
                    name="stockOut"
                    min="0"
                    value={formData.stockOut}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    name="totalStock"
                    min="0"
                    value={formData.totalStock}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="in"
                        checked={stockAdjustment.type === 'in'}
                        onChange={handleAdjustmentChange}
                        className="mr-2"
                      />
                      <span className="flex items-center text-green-600">
                        <Plus className="h-4 w-4 mr-1" />
                        Stock In
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="out"
                        checked={stockAdjustment.type === 'out'}
                        onChange={handleAdjustmentChange}
                        className="mr-2"
                      />
                      <span className="flex items-center text-red-600">
                        <Minus className="h-4 w-4 mr-1" />
                        Stock Out
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={stockAdjustment.quantity}
                    onChange={handleAdjustmentChange}
                    className="input-field"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  value={stockAdjustment.notes}
                  onChange={handleAdjustmentChange}
                  className="input-field"
                  placeholder="Enter adjustment notes (optional)"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Stock Status</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Stock In:</span>
                    <p className="font-semibold">{item.stockIn}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock Out:</span>
                    <p className="font-semibold">{item.stockOut}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Stock:</span>
                    <p className="font-semibold">{item.totalStock}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditItemForm;