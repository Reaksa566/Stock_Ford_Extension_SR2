import React, { useState } from 'react';
import { itemsAPI } from '../services/api';
import { X, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const ImportExcel = ({ category, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importResults, setImportResults] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFile(file);
    setImportResults(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('📊 Excel file parsed:', jsonData);
        console.log('🔍 First row keys:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'No data');
        
        setPreview(jsonData.slice(0, 5)); // Show first 5 rows
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error reading Excel file: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setImportResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          console.log('🚀 Sending data to import:', jsonData);
          
          const response = await itemsAPI.import({ category, data: jsonData });
          setImportResults(response.data);
          console.log('✅ Import completed:', response.data);
          
          onSuccess();
        } catch (error) {
          console.error('Import error:', error);
          alert('Import failed: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File reading error:', error);
      alert('Error reading file: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Import from Excel - {category.toUpperCase()}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-file"
              />
              <label htmlFor="excel-file" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  .xlsx, .xls, .csv files only
                </p>
              </label>
            </div>
            {file && (
              <p className="text-sm text-green-600 mt-2">
                ✅ File selected: {file.name}
              </p>
            )}
          </div>

          {/* Preview Section */}
          {preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Data Preview (First 5 rows)
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 whitespace-nowrap border-b">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className={`p-4 rounded-lg ${
              importResults.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center mb-2">
                <AlertCircle className={`h-5 w-5 ${
                  importResults.errors.length > 0 ? 'text-yellow-600' : 'text-green-600'
                } mr-2`} />
                <h4 className="font-medium">Import Results</h4>
              </div>
              <div className="text-sm">
                <p>✅ Created: {importResults.created}</p>
                <p>🔄 Updated: {importResults.updated}</p>
                {importResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">❌ Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-xs">{error}</li>
                      ))}
                      {importResults.errors.length > 5 && (
                        <li className="text-xs">... and {importResults.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Required Column Names</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Description:</strong> Description, DESCRIPTION, description, Product, Item, Name</p>
              <p><strong>Unit:</strong> Unit, UNIT, unit, UOM, Unit of Measure</p>
              <p><strong>Stock In:</strong> Stock In, StockIn, STOCK IN, Stock, Qty, Quantity</p>
              <p><strong>Stock Out:</strong> Stock Out, StockOut, STOCK OUT (optional, defaults to 0)</p>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              <p><strong>Note:</strong> The system will automatically detect your column names. If items with the same description exist, quantities will be added to existing items.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExcel;