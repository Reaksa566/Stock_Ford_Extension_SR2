import React, { useState, useEffect } from 'react';
import { itemsAPI, reportsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Package, Wrench, AlertTriangle, TrendingUp, Plus, FileText } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAccessories: 0,
    totalTools: 0,
    criticalItems: 0,
    totalStockValue: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get items count by category
      const [accessoriesRes, toolsRes, criticalRes] = await Promise.all([
        itemsAPI.getAll({ category: 'accessory', limit: 1 }),
        itemsAPI.getAll({ category: 'tool', limit: 1 }),
        reportsAPI.getCriticalStock()
      ]);

      setStats({
        totalAccessories: accessoriesRes.data.total,
        totalTools: toolsRes.data.total,
        criticalItems: criticalRes.data.length,
        totalStockValue: accessoriesRes.data.total + toolsRes.data.total
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions Handlers
  const handleAddAccessory = () => {
    alert('Add New Accessory functionality will be implemented in the Accessories page.');
    navigate('/accessories');
  };

  const handleAddTool = () => {
    alert('Add New Tool functionality will be implemented in the Tools page.');
    navigate('/tools');
  };

  const handleGenerateReport = () => {
    alert('Redirecting to Reports page...');
    navigate('/reports');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accessories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAccessories}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tools</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTools}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.criticalItems}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAccessories + stats.totalTools}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleAddAccessory}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Add New Accessory</span>
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
            </button>
            <button 
              onClick={handleAddTool}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Add New Tool</span>
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
            </button>
            <button 
              onClick={handleGenerateReport}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Generate Report</span>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Connection</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Sync</span>
              <span className="text-sm text-gray-900">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;