import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../services/auth';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  LogIn, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import ImportExcel from './ImportExcel';
import AddItemForm from './AddItemForm';
import ViewItemModal from './ViewItemModal';
import EditItemForm from './EditItemForm';
import StockAdjustmentModal from './StockAdjustmentModal';
import * as XLSX from 'xlsx';

const ItemList = ({ category, title }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [showImport, setShowImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [adjustingStock, setAdjustingStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
  }, [category, search, filters, currentPage]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await itemsAPI.getAll({
        category,
        search,
        page: currentPage,
        limit: 50,
        ...filters
      });
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
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

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadItems();
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
    loadItems();
  };

  const handleStockAdjustSuccess = () => {
    setAdjustingStock(null);
    loadItems();
  };

  // Export to Excel function - Get ALL data
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Fetch ALL items without pagination
      const response = await itemsAPI.getAll({
        category,
        search,
        limit: 10000, // Very high limit to get all items
        ...filters
      });

      const allItems = response.data.items;
      
      const exportData = allItems.map((item, index) => ({
        'N°': index + 1,
        'Description': item.description,
        'Unit': item.unit,
        'Stock In': item.stockIn,
        'Stock Out': item.stockOut,
        'Total Stock': item.totalStock,
        'Status': item.totalStock < (item.stockIn * 0.2) ? 'Critical' : 
                  item.totalStock < (item.stockIn * 0.5) ? 'Low' : 'Good',
        'Category': item.category,
        'Last Updated': new Date(item.updatedAt).toLocaleDateString()
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths for better Excel display
      const colWidths = [
        { wch: 8 },  // N°
        { wch: 40 }, // Description
        { wch: 10 }, // Unit
        { wch: 12 }, // Stock In
        { wch: 12 }, // Stock Out
        { wch: 12 }, // Total Stock
        { wch: 12 }, // Status
        { wch: 12 }, // Category
        { wch: 15 }  // Last Updated
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, `${title}`);
      XLSX.writeFile(wb, `${title}_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      console.log('✅ Export successful - Total items:', allItems.length);
      alert(`✅ Export successful! ${allItems.length} items exported.`);
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle delete item
  const handleDelete = async (itemId, itemDescription) => {
    if (window.confirm(`Are you sure you want to delete "${itemDescription}"?`)) {
      try {
        await itemsAPI.delete(itemId);
        loadItems();
        alert('Item deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Delete failed: ' + error.response?.data?.message);
      }
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[filterType];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [filterType]: value });
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4" />
                Import Excel
              </button>
            </>
          )}
          <button 
            onClick={handleExport}
            disabled={exportLoading}
            className="btn-secondary flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Items
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select 
                className="input-field w-full"
                value={filters.stockStatus || ''}
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="critical">Critical (&lt;20%)</option>
                <option value="low">Low (20-50%)</option>
                <option value="good">Good (&gt;50%)</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Type
              </label>
              <select 
                className="input-field w-full"
                value={filters.unit || ''}
                onChange={(e) => handleFilterChange('unit', e.target.value)}
              >
                <option value="">All Units</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select 
                className="input-field w-full"
                value={filters.sortBy || ''}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="">Default</option>
                <option value="description">Description A-Z</option>
                <option value="-description">Description Z-A</option>
                <option value="-totalStock">Stock (High to Low)</option>
                <option value="totalStock">Stock (Low to High)</option>
                <option value="-updatedAt">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table Section */}
      <div className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[600px] relative">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Beautiful Fixed Header */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    N°
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Unit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Stock In
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Stock Out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Total Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => {
                  const stockPercentage = item.stockIn > 0 ? (item.totalStock / item.stockIn) * 100 : 0;
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(currentPage - 1) * 50 + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          {item.stockIn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        <div className="flex items-center">
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          {item.stockOut}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${
                            stockPercentage < 20 
                              ? 'text-red-600'
                              : stockPercentage < 50
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {item.totalStock}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                stockPercentage < 20 
                                  ? 'bg-red-500'
                                  : stockPercentage < 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => setViewingItem(item)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {user?.role === 'admin' && (
                            <>
                              <button 
                                onClick={() => setEditingItem(item)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Edit Item"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              <button 
                                onClick={() => setAdjustingStock(item)}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                title="Adjust Stock"
                              >
                                <LogIn className="h-4 w-4" />
                              </button>
                              
                              <button 
                                onClick={() => handleDelete(item._id, item.description)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete Item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">No items found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first item'
              }
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading items...</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showImport && (
        <ImportExcel
          category={category}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {showAddForm && (
        <AddItemForm
          category={category}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {viewingItem && (
        <ViewItemModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}

      {editingItem && (
        <EditItemForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {adjustingStock && (
        <StockAdjustmentModal
          item={adjustingStock}
          onClose={() => setAdjustingStock(null)}
          onSuccess={handleStockAdjustSuccess}
        />
      )}
    </div>
  );
};

export default ItemList;