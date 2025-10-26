const Item = require('../models/Item');

const importFromExcel = async (data, category) => {
  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    console.log('📊 Raw Excel data received:', data);

    for (const [index, row] of data.entries()) {
      try {
        // Debug: Log the entire row to see what's available
        console.log(`🔍 Processing row ${index + 1}:`, row);

        // More flexible column name detection
        const description = findColumnValue(row, ['Description', 'DESCRIPTION', 'description', 'Product', 'PRODUCT', 'Item', 'ITEM', 'Name', 'NAME', 'បរិយាយ', 'ឈ្មោះ']);
        const unit = findColumnValue(row, ['Unit', 'UNIT', 'unit', 'UOM', 'uom', 'Unit of Measure', 'UNIT OF MEASURE', 'ឯកតា']);
        const stockIn = findColumnValue(row, ['Stock In', 'StockIn', 'STOCK IN', 'stockin', 'Stock_In', 'Stock', 'STOCK', 'stock', 'Qty', 'QTY', 'Quantity', 'QUANTITY', 'Initial Stock', 'INITIAL STOCK', 'Stock ចូល', 'StockIn', 'Stock ទទួល']);
        const stockOut = findColumnValue(row, ['Stock Out', 'StockOut', 'STOCK OUT', 'stockout', 'Stock_Out', 'Stock Out', 'STOCK OUT', 'Stock ចេញ', 'StockOut', 'Stock ប្រើ']);

        console.log(`📝 Extracted values - Description: "${description}", Unit: "${unit}", StockIn: "${stockIn}", StockOut: "${stockOut}"`);

        if (!description || !unit) {
          results.errors.push(`Row ${index + 1}: Missing required fields (Description: "${description}", Unit: "${unit}")`);
          continue;
        }

        // Parse stock values
        const stockInValue = parseStockValue(stockIn);
        const stockOutValue = parseStockValue(stockOut);

        console.log(`🔢 Parsed values - StockIn: ${stockInValue}, StockOut: ${stockOutValue}`);

        if (isNaN(stockInValue) || isNaN(stockOutValue)) {
          results.errors.push(`Row ${index + 1}: Invalid stock values (Stock In: "${stockIn}", Stock Out: "${stockOut}")`);
          continue;
        }

        // Check if item exists (case insensitive search)
        const existingItem = await Item.findOne({ 
          description: { $regex: new RegExp(`^${description.trim()}$`, 'i') },
          category 
        });

        if (existingItem) {
          // Update existing item
          existingItem.stockIn += stockInValue;
          existingItem.stockOut += stockOutValue;
          
          if (stockInValue > 0) {
            existingItem.history.push({
              quantity: stockInValue,
              type: 'in',
              notes: 'Imported from Excel'
            });
          }
          
          if (stockOutValue > 0) {
            existingItem.history.push({
              quantity: stockOutValue,
              type: 'out',
              notes: 'Imported from Excel'
            });
          }

          await existingItem.save();
          results.updated++;
          console.log(`✅ Updated existing item: ${description}`);
        } else {
          // Create new item
          const newItem = new Item({
            description: description.trim(),
            unit: unit.trim(),
            category,
            stockIn: stockInValue,
            stockOut: stockOutValue
          });

          if (stockInValue > 0) {
            newItem.history.push({
              quantity: stockInValue,
              type: 'in',
              notes: 'Imported from Excel'
            });
          }

          await newItem.save();
          results.created++;
          console.log(`✅ Created new item: ${description}`);
        }
      } catch (error) {
        console.error(`❌ Error processing row ${index + 1}:`, error);
        results.errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    console.log('📈 Final import results:', results);
    return results;
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
};

// Helper function to find column value with multiple possible names
const findColumnValue = (row, possibleNames) => {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  
  // Also check for direct properties (case insensitive)
  for (const key in row) {
    const lowerKey = key.toLowerCase();
    for (const name of possibleNames) {
      if (lowerKey === name.toLowerCase()) {
        return row[key];
      }
    }
  }
  
  return undefined;
};

// Helper function to parse stock values from different formats
const parseStockValue = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  
  // If it's already a number, return it
  if (typeof value === 'number') return Math.max(0, value);
  
  // Convert to string and clean
  let strValue = String(value).trim();
  
  // Remove any non-numeric characters except decimal point
  strValue = strValue.replace(/[^\d.]/g, '');
  
  // Parse as float
  const numValue = parseFloat(strValue);
  
  return isNaN(numValue) ? 0 : Math.max(0, numValue); // Ensure non-negative
};

module.exports = { importFromExcel };