const Item = require('../models/Item');

const importFromExcel = async (data, category) => {
  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const row of data) {
      try {
        const { Description, description, Unit, unit, StockIn, stockIn, StockOut, stockOut } = row;
        
        const finalDescription = Description || description;
        const finalUnit = Unit || unit;
        const finalStockIn = StockIn || stockIn || 0;
        const finalStockOut = StockOut || stockOut || 0;

        if (!finalDescription || !finalUnit) {
          results.errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
          continue;
        }

        // Check if item exists
        const existingItem = await Item.findOne({ 
          description: finalDescription.trim(),
          category 
        });

        if (existingItem) {
          // Update existing item
          existingItem.stockIn += parseInt(finalStockIn) || 0;
          existingItem.stockOut += parseInt(finalStockOut) || 0;
          
          if (finalStockIn > 0) {
            existingItem.history.push({
              quantity: parseInt(finalStockIn),
              type: 'in',
              notes: 'Imported from Excel'
            });
          }
          
          if (finalStockOut > 0) {
            existingItem.history.push({
              quantity: parseInt(finalStockOut),
              type: 'out',
              notes: 'Imported from Excel'
            });
          }

          await existingItem.save();
          results.updated++;
        } else {
          // Create new item
          const newItem = new Item({
            description: finalDescription.trim(),
            unit: finalUnit.trim(),
            category,
            stockIn: parseInt(finalStockIn) || 0,
            stockOut: parseInt(finalStockOut) || 0
          });

          if (finalStockIn > 0) {
            newItem.history.push({
              quantity: parseInt(finalStockIn),
              type: 'in',
              notes: 'Imported from Excel'
            });
          }

          await newItem.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error processing row ${JSON.stringify(row)}: ${error.message}`);
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`);
  }
};

module.exports = { importFromExcel };