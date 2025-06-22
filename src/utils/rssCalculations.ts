
import { PlotData } from '@/types/plot';

interface RSSResult {
  data: PlotData[];
  rssColumns: string[];
  allColumns: string[];
}

export const calculateRSS = (data: PlotData[], responseColumns: string[]): RSSResult => {
  // Auto-detect node columns (assuming format: Node_<ID>_<Direction>)
  const xCols = responseColumns.filter(col => col.includes('_X'));
  const yCols = responseColumns.filter(col => col.includes('_Y'));
  const zCols = responseColumns.filter(col => col.includes('_Z'));
  
  console.log('Detected direction columns:', { xCols, yCols, zCols });
  
  // Create new data with RSS calculations
  const newData = data.map(row => {
    const newRow = { ...row };
    
    // Calculate RSS for each detected node
    xCols.forEach(xCol => {
      const baseName = xCol.split('_X')[0];
      const yCol = `${baseName}_Y`;
      const zCol = `${baseName}_Z`;
      
      if (yCols.includes(yCol) && zCols.includes(zCol)) {
        const x = row[xCol] || 0;
        const y = row[yCol] || 0;
        const z = row[zCol] || 0;
        
        // Calculate RSS: sqrt(x² + y² + z²)
        newRow[`${baseName}_RSS`] = Math.sqrt(x*x + y*y + z*z);
      }
    });
    
    return newRow;
  });
  
  // Get RSS column names
  const rssColumns = xCols.map(xCol => `${xCol.split('_X')[0]}_RSS`);
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
