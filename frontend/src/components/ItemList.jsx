import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../services/auth';
import { Search, Filter, Download, Upload, Eye, Edit, Trash2 } from 'lucide-react';
import ImportExcel from './ImportExcel';

const ItemList = ({ category, title }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [showImport, setShowImport] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
  }, [category, search, filters]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await itemsAPI.getAll({
        category,
        search,
        ...filters
      });
      setItems(response.data.items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    loadItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        
        <div className="flex flex-wrap gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowImport(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Excel
            </button>
          )}
          <button className="btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select className="input-field">
              <option>Filter by Stock</option>
              <option>High Stock</option>
              <option>Low Stock</option>
              <option>Critical Stock</option>
            </select>
            
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">N°</th>
                <th className="table-header">Description</th>
                <th className="table-header">Unit</th>
                <th className="table-header">Stock In</th>
                <th className="table-header">Stock Out</th>
                <th className="table-header">Total Stock</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell font-medium">{item.description}</td>
                  <td className="table-cell">{item.unit}</td>
                  <td className="table-cell">{item.stockIn}</td>
                  <td className="table-cell">{item.stockOut}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.totalStock < (item.stockIn * 0.2) 
                        ? 'bg-red-100 text-red-800'
                        : item.totalStock < (item.stockIn * 0.5)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.totalStock}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      {user?.role === 'admin' && (
                        <>
                          <button className="p-1 text-green-600 hover:text-green-800">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No items found
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <ImportExcel
          category={category}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};

export default ItemList;