import React, { useState } from 'react';
import { itemsAPI } from '../services/api';
import { X, Plus } from 'lucide-react';

const AddItemForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: '',
    unit: '',
    stockIn: '',
    stockOut: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const itemData = {
        description: formData.description.trim(),
        unit: formData.unit.trim(),
        category,
        stockIn: parseInt(formData.stockIn) || 0,
        stockOut: parseInt(formData.stockOut) || 0
      };

      await itemsAPI.create(itemData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error.response?.data?.message || 'Failed to create item');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Add New {category.charAt(0).toUpperCase() + category.slice(1)}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
              placeholder="Enter item description"
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
              <option value="">Select Unit</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Stock In
            </label>
            <input
              type="number"
              name="stockIn"
              min="0"
              value={formData.stockIn}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter initial stock quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Stock Out
            </label>
            <input
              type="number"
              name="stockOut"
              min="0"
              value={formData.stockOut}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter initial stock out quantity"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;