
import { PlotData } from '@/types/plot';

interface RSSResult {
  data: PlotData[];
  rssColumns: string[];
  allColumns: string[];
}

export const calculateRSS = (data: PlotData[], responseColumns: string[]): RSSResult => {
  // Auto-detect node columns (assuming format: Node_<ID>_<Direction>)
  const xCols = responseColumns.filter(col => col.includes('_X') || col.includes('_x'));
  const yCols = responseColumns.filter(col => col.includes('_Y') || col.includes('_y'));
  const zCols = responseColumns.filter(col => col.includes('_Z') || col.includes('_z'));
  
  console.log('Detected direction columns:', { xCols, yCols, zCols });
  
  // Create new data with RSS calculations
  const newData = data.map(row => {
    const newRow = { ...row };
    
    // Calculate RSS for each detected node
    xCols.forEach(xCol => {
      // Handle different naming conventions
      let baseName = '';
      if (xCol.includes('_X')) {
        baseName = xCol.split('_X')[0];
      } else if (xCol.includes('_x')) {
        baseName = xCol.split('_x')[0];
      }
      
      const yCol = yCols.find(col => col.startsWith(baseName));
      const zCol = zCols.find(col => col.startsWith(baseName));
      
      if (yCol && zCol) {
        const x = row[xCol] || 0;
        const y = row[yCol] || 0;
        const z = row[zCol] || 0;
        
        // Calculate RSS: sqrt(x² + y² + z²)
        newRow[`RSS_${baseName.split('_').pop()}`] = Math.sqrt(x*x + y*y + z*z);
      }
    });
    
    return newRow;
  });
  
  // Get RSS column names
  const rssColumns = xCols.map(xCol => {
    let baseName = '';
    if (xCol.includes('_X')) {
      baseName = xCol.split('_X')[0];
    } else if (xCol.includes('_x')) {
      baseName = xCol.split('_x')[0];
    }
    return `RSS_${baseName.split('_').pop()}`;
  });
  
  const allColumns = [...responseColumns, ...rssColumns];
  
  console.log('Generated RSS columns:', rssColumns);
  
  return {
    data: newData,
    rssColumns,
    allColumns
  };
};

export const exportRSSToCSV = (data: PlotData[], columns: string[], fileName: string) => {
  const csvContent = [
    ['Frequency', ...columns].join(','),
    ...data.map(row => [
      row.frequency,
      ...columns.map(col => row[col] || 0)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.replace('.csv', '_with_RSS.csv'));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const calculateRMSForFrequencyBands = (
  data: PlotData[], 
  columns: string[]
): Record<string, Record<string, number>> => {
  const bands = {
    "1-100Hz": data.filter(row => row.frequency > 0 && row.frequency < 100),
    "100-150Hz": data.filter(row => row.frequency >= 100 && row.frequency < 150),
    "150-300Hz": data.filter(row => row.frequency >= 150 && row.frequency < 300)
  };

  const results: Record<string, Record<string, number>> = {};

  columns.forEach(column => {
    results[column] = {};
    Object.entries(bands).forEach(([bandName, bandData]) => {
      if (bandData.length > 0) {
        const sumOfSquares = bandData.reduce((sum, row) => sum + (row[column] || 0) ** 2, 0);
        results[column][bandName] = Math.sqrt(sumOfSquares / bandData.length);
      } else {
        results[column][bandName] = 0;
      }
    });
  });

  return results;
};
