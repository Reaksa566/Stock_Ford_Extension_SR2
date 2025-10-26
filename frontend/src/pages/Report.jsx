import React, { useState } from 'react';
import { reportsAPI } from '../services/api';
import { Calendar, AlertTriangle, Download } from 'lucide-react';

const Report = () => {
  const [activeTab, setActiveTab] = useState('critical');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const tabs = [
    { id: 'critical', name: 'Critical Stock', icon: AlertTriangle },
    { id: 'accessory', name: 'Daily Accessory', icon: Calendar },
    { id: 'tool', name: 'Daily Tool', icon: Calendar },
    { id: 'summary', name: 'Summary', icon: Download },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

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

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'critical' && <CriticalStockReport />}
        {activeTab === 'accessory' && <DailyReport category="accessory" date={date} />}
        {activeTab === 'tool' && <DailyReport category="tool" date={date} />}
        {activeTab === 'summary' && <SummaryReport />}
      </div>
    </div>
  );
};

const CriticalStockReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Implementation for critical stock report
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Critical Stock Report</h3>
      <p>Items with stock less than 20% of initial stock</p>
      {/* Report content */}
    </div>
  );
};

const DailyReport = ({ category, date }) => {
  // Implementation for daily reports
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Daily {category.charAt(0).toUpperCase() + category.slice(1)} Report
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>
      {/* Report content */}
    </div>
  );
};

const SummaryReport = () => {
  // Implementation for summary report
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Report</h3>
      {/* Report content */}
    </div>
  );
};

export default Report; 
