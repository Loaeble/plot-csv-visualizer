
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlotData } from '@/types/plot';
import { NODE_TITLE_MAP } from '@/utils/nodeMapping';

interface DualPlotPanelProps {
  data: PlotData[];
  nodeId: number;
  rssColumn: string;
  rmsData: {
    "1-100Hz": number;
    "100-150Hz": number;
    "150-300Hz": number;
  };
  unitLabel: string;
}

const DualPlotPanel: React.FC<DualPlotPanelProps> = ({ 
  data, 
  nodeId, 
  rssColumn, 
  rmsData, 
  unitLabel 
}) => {
  const nodeTitle = NODE_TITLE_MAP[nodeId] || `Node ${nodeId}`;
  const maxRSSValue = Math.max(...data.map(d => d[rssColumn] || 0));
  const maxFreq = Math.max(...data.map(d => d.frequency));

  // Color scheme matching backend
  const lineColor = '#3b82f6'; // Blue
  const barColors = ['#6b7280', '#ef4444', '#10b981']; // Gray, Red, Lime

  // Prepare line chart data
  const lineData = data.map(row => ({
    frequency: row.frequency,
    rss: row[rssColumn] || 0
  }));

  // Prepare bar chart data
  const barData = [
    { name: '1-100Hz', value: rmsData["1-100Hz"], fill: barColors[0] },
    { name: '100-150Hz', value: rmsData["100-150Hz"], fill: barColors[1] },
    { name: '150-300Hz', value: rmsData["150-300Hz"], fill: barColors[2] }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value.toFixed(4)}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{`${payload[0].payload.name}: ${payload[0].value.toFixed(4)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Line Chart - RSS Amplitude vs Frequency */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-center">{nodeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 40, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis 
                dataKey="frequency" 
                domain={[0, maxFreq]}
                type="number"
                scale="linear"
                ticks={Array.from({length: 6}, (_, i) => Math.round(maxFreq * i / 5))}
                label={{ value: 'Frequency [Hz]', position: 'insideBottom', offset: -10, style: { fontWeight: 'bold', fontSize: '12px' } }}
                fontSize={10}
              />
              <YAxis 
                domain={[0, maxRSSValue * 1.1]}
                ticks={Array.from({length: 6}, (_, i) => Math.round(maxRSSValue * 1.1 * i / 5))}
                label={{ value: `RSS Accel. ${unitLabel}`, angle: -90, position: 'insideLeft', style: { fontWeight: 'bold', fontSize: '12px' } }}
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rss" 
                stroke={lineColor} 
                strokeWidth={2}
                dot={false}
                name="RSS Amplitude"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - RMS Values */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-center">{nodeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 40, bottom: 40 }}>
              <XAxis 
                dataKey="name" 
                fontSize={10}
                angle={0}
              />
              <YAxis 
                domain={[0, Math.max(...barData.map(d => d.value)) * 1.2]}
                label={{ value: `RMS Accel ${unitLabel}`, angle: -90, position: 'insideLeft', style: { fontWeight: 'bold', fontSize: '12px' } }}
                fontSize={10}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DualPlotPanel;
