import React, { useState, useEffect } from 'react';
import { reportsAPI, itemsAPI } from '../services/api';
import { Calendar, AlertTriangle, Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const Report = () => {
  const [activeTab, setActiveTab] = useState('critical');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'critical', name: 'Critical Stock', icon: AlertTriangle },
    { id: 'accessory', name: 'Daily Accessory', icon: Calendar },
    { id: 'tool', name: 'Daily Tool', icon: Calendar },
    { id: 'summary', name: 'Summary', icon: FileText },
  ];

  useEffect(() => {
    loadReportData();
  }, [activeTab, date]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      let data = [];
      switch (activeTab) {
        case 'critical':
          const criticalRes = await reportsAPI.getCriticalStock();
          data = criticalRes.data;
          break;
        case 'accessory':
          data = await loadDailyMovements('accessory');
          break;
        case 'tool':
          data = await loadDailyMovements('tool');
          break;
        case 'summary':
          const summaryRes = await reportsAPI.getSummary();
          data = summaryRes.data;
          break;
        default:
          data = [];
      }
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load daily stock movements for both IN and OUT
  const loadDailyMovements = async (category) => {
    try {
      // Get all items for the category
      const response = await itemsAPI.getAll({ 
        category, 
        limit: 10000 
      });
      
      const items = response.data.items;
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Process each item to find daily movements
      const dailyData = items.map(item => {
        if (!item.history || item.history.length === 0) {
          return null;
        }

        // Filter movements for the selected date
        const dailyMovements = item.history.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= selectedDate && recordDate < nextDate;
        });

        if (dailyMovements.length === 0) {
          return null;
        }

        // Calculate daily totals for both IN and OUT
        const dailyIn = dailyMovements
          .filter(record => record.type === 'in')
          .reduce((sum, record) => sum + record.quantity, 0);

        const dailyOut = dailyMovements
          .filter(record => record.type === 'out')
          .reduce((sum, record) => sum + record.quantity, 0);

        // Get movement details
        const movementDetails = dailyMovements.map(movement => ({
          type: movement.type,
          quantity: movement.quantity,
          notes: movement.notes,
          time: new Date(movement.date).toLocaleTimeString()
        }));

        return {
          ...item,
          dailyIn,
          dailyOut,
          totalMovements: dailyMovements.length,
          movementDetails,
          hasMovements: dailyIn > 0 || dailyOut > 0
        };
      }).filter(item => item !== null && item.hasMovements);

      return dailyData;
    } catch (error) {
      console.error('Error loading daily movements:', error);
      return [];
    }
  };

  const handleExportReport = () => {
    try {
      let exportData = [];
      let fileName = '';

      switch (activeTab) {
        case 'critical':
          exportData = reportData.map(item => ({
            'Description': item.description,
            'Unit': item.unit,
            'Stock In': item.stockIn,
            'Stock Out': item.stockOut,
            'Total Stock': item.totalStock,
            'Stock Level': `${Math.round((item.totalStock / item.stockIn) * 100)}%`,
            'Status': item.totalStock < (item.stockIn * 0.2) ? 'Critical' : 'Low'
          }));
          fileName = `Critical_Stock_Report_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'accessory':
        case 'tool':
          exportData = reportData.map(item => ({
            'Description': item.description,
            'Unit': item.unit,
            'Daily Stock In': item.dailyIn,
            'Daily Stock Out': item.dailyOut,
            'Total Movements': item.totalMovements,
            'Current Stock': item.totalStock,
            'Date': date
          }));
          fileName = `Daily_${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}_Movements_${date}`;
          break;

        case 'summary':
          exportData = reportData.map(category => ({
            'Category': category._id.toUpperCase(),
            'Total Items': category.totalItems,
            'Total Stock In': category.totalStockIn,
            'Total Stock Out': category.totalStockOut,
            'Current Stock': category.totalCurrentStock
          }));
          fileName = `Stock_Summary_Report_${new Date().toISOString().split('T')[0]}`;
          break;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${fileName}.xlsx`);

      console.log('✅ Report exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const handleGenerateReport = () => {
    loadReportData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateReport}
            className="btn-primary flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
          <button
            onClick={handleExportReport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Date Filter for Daily Reports */}
      {(activeTab === 'accessory' || activeTab === 'tool') && (
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
            <span className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="card p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading report data...</p>
          </div>
        ) : (
          <ReportContent activeTab={activeTab} data={reportData} date={date} />
        )}
      </div>
    </div>
  );
};

const ReportContent = ({ activeTab, data, date }) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p>No data available for this report.</p>
        {(activeTab === 'accessory' || activeTab === 'tool') && (
          <p className="text-sm mt-1">No stock movements found for {new Date(date).toLocaleDateString()}</p>
        )}
      </div>
    );
  }

  switch (activeTab) {
    case 'critical':
      return <CriticalStockReport data={data} />;
    case 'accessory':
    case 'tool':
      return <DailyMovementsReport data={data} category={activeTab} date={date} />;
    case 'summary':
      return <SummaryReport data={data} />;
    default:
      return null;
  }
};

const CriticalStockReport = ({ data }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-4">Critical Stock Report</h3>
    <p className="text-sm text-gray-600 mb-4">Items with stock less than 20% of initial stock</p>
    <div className="overflow-x-auto">
      <div className="overflow-y-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
            <tr>
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
                Current Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Stock Level
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => {
              const stockLevel = (item.totalStock / item.stockIn) * 100;
              return (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      {item.stockIn}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      {item.stockOut}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {item.totalStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stockLevel < 20 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {Math.round(stockLevel)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DailyMovementsReport = ({ data, category, date }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-4">
      Daily {category.charAt(0).toUpperCase() + category.slice(1)} Movements - {new Date(date).toLocaleDateString()}
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      Stock movements (both IN and OUT) for selected date
    </p>
    
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Total Movements</p>
          <p className="text-2xl font-bold text-purple-600">
            {data.reduce((sum, item) => sum + (item.totalMovements || 0), 0)}
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Total Stock In</p>
          <p className="text-2xl font-bold text-green-600">
            {data.reduce((sum, item) => sum + (item.dailyIn || 0), 0)}
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Total Stock Out</p>
          <p className="text-2xl font-bold text-red-600">
            {data.reduce((sum, item) => sum + (item.dailyOut || 0), 0)}
          </p>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <div className="overflow-y-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Unit
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Daily Stock In
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Daily Stock Out
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Current Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Total Movements
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {item.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.unit}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(item.dailyIn || 0) > 0 ? (
                    <div className="flex items-center text-green-600 font-semibold">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{item.dailyIn}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(item.dailyOut || 0) > 0 ? (
                    <div className="flex items-center text-red-600 font-semibold">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      -{item.dailyOut}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {item.totalStock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {item.totalMovements || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-xs">
                    {/* Safe check for movementDetails */}
                    {(item.movementDetails && Array.isArray(item.movementDetails)) ? (
                      item.movementDetails.map((movement, index) => (
                        <div key={index} className="text-xs mb-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            movement.type === 'in' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity || 0}
                          </span>
                          <span className="text-gray-500 ml-1">{movement.time || 'Unknown time'}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No movement details</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const SummaryReport = ({ data }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Report</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((category) => (
        <div key={category._id} className="card p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {category._id.toUpperCase()} SUMMARY
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold">{category.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Stock In:</span>
              <span className="font-semibold text-green-600">{category.totalStockIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Stock Out:</span>
              <span className="font-semibold text-red-600">{category.totalStockOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Stock:</span>
              <span className="font-semibold text-blue-600">{category.totalCurrentStock}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Report;