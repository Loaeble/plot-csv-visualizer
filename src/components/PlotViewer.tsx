import React, { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Download, Calculator } from 'lucide-react';
import { calculateRSS, exportRSSToCSV } from '@/utils/rssCalculations';
import { PlotData } from '@/types/plot';

const Plot = createPlotlyComponent(Plotly);

interface PlotViewerProps {
  data: PlotData[];
  responseColumns: string[];
  fileName: string;
}

// Color palette for different response lines
const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const PlotViewer: React.FC<PlotViewerProps> = ({ data, responseColumns, fileName }) => {
  const [currentData, setCurrentData] = useState<PlotData[]>(data);
  const [currentColumns, setCurrentColumns] = useState<string[]>(responseColumns);
  const [rssColumns, setRssColumns] = useState<string[]>([]);
  const [hasRSS, setHasRSS] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(responseColumns)
  );
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    setCurrentData(data);
    setCurrentColumns(responseColumns);
    setVisibleColumns(new Set(responseColumns));
    setHasRSS(false);
    setRssColumns([]);
  }, [data, responseColumns]);

  const calculateRSSValues = () => {
    const result = calculateRSS(currentData, responseColumns);
    setCurrentData(result.data);
    setCurrentColumns(result.allColumns);
    setRssColumns(result.rssColumns);
    setHasRSS(true);
    
    // Show RSS columns by default, hide original components for cleaner view
    const newVisibleColumns = new Set([...responseColumns.slice(0, 3), ...result.rssColumns]);
    setVisibleColumns(newVisibleColumns);
  };

  const toggleColumnVisibility = (column: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column);
    } else {
      newVisibleColumns.add(column);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const toggleAllColumns = () => {
    if (visibleColumns.size === currentColumns.length) {
      setVisibleColumns(new Set());
    } else {
      setVisibleColumns(new Set(currentColumns));
    }
  };

  const exportAsCSV = () => {
    if (hasRSS) {
      exportRSSToCSV(currentData, currentColumns, fileName);
    } else {
      const csvContent = [
        ['Frequency', ...currentColumns].join(','),
        ...currentData.map(row => [
          row.frequency,
          ...currentColumns.map(col => row[col])
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName.replace('.csv', '_exported.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Prepare data for Plotly
  const plotData = currentColumns
    .filter(column => visibleColumns.has(column))
    .map((column, index) => ({
      x: currentData.map(d => d.frequency),
      y: currentData.map(d => d[column]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: column,
      line: {
        color: rssColumns.includes(column) ? COLORS[0] : COLORS[index % COLORS.length],
        width: rssColumns.includes(column) ? 3 : 2
      },
      opacity: rssColumns.includes(column) ? 1 : 0.7
    }));

  const layout = {
    title: {
      text: 'Interactive Frequency Response Plot',
      font: { size: 18, family: 'Arial, sans-serif' }
    },
    xaxis: {
      title: 'Frequency (Hz)',
      showgrid: showGrid,
      gridcolor: '#f0f0f0'
    },
    yaxis: {
      title: 'Response',
      showgrid: showGrid,
      gridcolor: '#f0f0f0'
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: true,
    legend: {
      orientation: 'h' as const,
      x: 0.5,
      xanchor: 'center' as const,
      y: -0.2
    },
    margin: {
      l: 60,
      r: 30,
      t: 60,
      b: 80
    },
    autosize: true
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png' as const,
      filename: fileName.replace('.csv', '_plot'),
      height: 600,
      width: 1000,
      scale: 2
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {!hasRSS && (
            <Button
              onClick={calculateRSSValues}
              variant="outline"
              size="sm"
              className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <Calculator className="h-3 w-3 mr-1" />
              Calculate RSS
            </Button>
          )}
          
          <Button
            onClick={toggleAllColumns}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {visibleColumns.size === currentColumns.length ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide All
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </>
            )}
          </Button>
          
          <Button
            onClick={exportAsCSV}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Export CSV{hasRSS ? ' (with RSS)' : ''}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-grid"
              checked={showGrid}
              onCheckedChange={(checked) => setShowGrid(checked as boolean)}
            />
            <label htmlFor="show-grid" className="text-sm font-medium">
              Show Grid
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentColumns.map((column, index) => (
            <Badge
              key={column}
              variant={visibleColumns.has(column) ? "default" : "secondary"}
              className={`cursor-pointer hover:opacity-80 transition-opacity ${
                rssColumns.includes(column) ? 'ring-2 ring-blue-400' : ''
              }`}
              style={{
                backgroundColor: visibleColumns.has(column) 
                  ? (rssColumns.includes(column) ? '#3b82f6' : COLORS[index % COLORS.length])
                  : undefined
              }}
              onClick={() => toggleColumnVisibility(column)}
            >
              {column} {rssColumns.includes(column) ? '(RSS)' : ''}
            </Badge>
          ))}
        </div>
      </div>

      {/* Plot Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentData.length}</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{currentColumns.length}</div>
            <div className="text-sm text-gray-600">Total Channels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{rssColumns.length}</div>
            <div className="text-sm text-gray-600">RSS Channels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...currentData.map(d => d.frequency)).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Max Freq (Hz)</div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Plotly Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="w-full" style={{ height: '500px' }}>
            <Plot
              data={plotData}
              layout={layout}
              config={config}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {hasRSS ? 'Vibration Response with RSS Calculation' : 'Interactive Frequency Response Plot'}
            </h3>
            <p className="text-sm text-gray-600">Source: {fileName}</p>
            {hasRSS && (
              <p className="text-xs text-blue-600 mt-1">
                RSS (Root Sum of Squares) calculated from X, Y, Z components
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              🔍 Zoom by selecting area • 📐 Pan by dragging • 📊 Hover for values • 📥 Download using toolbar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotViewer;
