
import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';

interface PlotData {
  frequency: number;
  [key: string]: number;
}

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
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(responseColumns)
  );
  const [showGrid, setShowGrid] = useState(true);

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
    if (visibleColumns.size === responseColumns.length) {
      setVisibleColumns(new Set());
    } else {
      setVisibleColumns(new Set(responseColumns));
    }
  };

  // Prepare data for Plotly
  const plotData = responseColumns
    .filter(column => visibleColumns.has(column))
    .map((column, index) => ({
      x: data.map(d => d.frequency),
      y: data.map(d => d[column]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: column,
      line: {
        color: COLORS[index % COLORS.length],
        width: 2
      }
    }));

  const layout = {
    title: {
      text: 'Frequency Response Plot',
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
          <Button
            onClick={toggleAllColumns}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {visibleColumns.size === responseColumns.length ? (
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
          {responseColumns.map((column, index) => (
            <Badge
              key={column}
              variant={visibleColumns.has(column) ? "default" : "secondary"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: visibleColumns.has(column) ? COLORS[index % COLORS.length] : undefined
              }}
              onClick={() => toggleColumnVisibility(column)}
            >
              {column}
            </Badge>
          ))}
        </div>
      </div>

      {/* Plot Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{responseColumns.length}</div>
            <div className="text-sm text-gray-600">Response Channels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.min(...data.map(d => d.frequency)).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Min Freq (Hz)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...data.map(d => d.frequency)).toFixed(1)}
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
            <h3 className="text-lg font-semibold text-gray-900">Frequency Response Plot</h3>
            <p className="text-sm text-gray-600">Source: {fileName}</p>
            <p className="text-xs text-gray-500 mt-2">
              Use the toolbar above the plot to zoom, pan, download, or interact with the data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotViewer;
