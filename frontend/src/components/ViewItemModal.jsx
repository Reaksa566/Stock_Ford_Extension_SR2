import React from 'react';
import { X, Calendar } from 'lucide-react';

const ViewItemModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Item Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-lg font-semibold text-gray-900">{item.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <p className="text-gray-900">{item.unit}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.category.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock In</label>
                <p className="text-2xl font-bold text-green-600">{item.stockIn}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Out</label>
                <p className="text-2xl font-bold text-red-600">{item.stockOut}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock</label>
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
          </div>

          {/* Stock History */}
          {item.history && item.history.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stock History
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {item.history
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.type === 'in' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {record.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Created/Updated Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
              <p className="text-sm text-gray-600">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-sm text-gray-600">
                {new Date(item.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewItemModal;