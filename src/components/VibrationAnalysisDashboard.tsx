
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Activity, BarChart3 } from 'lucide-react';
import CSVUploader from './CSVUploader';
import DualPlotPanel from './DualPlotPanel';
import NodeSelector from './NodeSelector';
import { PlotData } from '@/types/plot';
import { MAGNIFICATION_OPTIONS } from '@/utils/nodeMapping';
import { calculateRSS, calculateRMSForFrequencyBands } from '@/utils/rssCalculations';

const VibrationAnalysisDashboard: React.FC = () => {
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [responseColumns, setResponseColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [magnificationFactor, setMagnificationFactor] = useState(1000);
  const [showComponents, setShowComponents] = useState(false);
  const [processedData, setProcessedData] = useState<PlotData[]>([]);
  const [rssColumns, setRssColumns] = useState<string[]>([]);

  const unitLabel = MAGNIFICATION_OPTIONS.find(opt => opt.value === magnificationFactor)?.label || "n/*2";

  const handleDataParsed = useCallback((data: PlotData[], columns: string[], filename: string) => {
    setPlotData(data);
    setResponseColumns(columns);
    setFileName(filename);
    
    // Auto-calculate RSS
    const rssResult = calculateRSS(data, columns);
    setProcessedData(rssResult.data);
    setRssColumns(rssResult.rssColumns);
    
    // Auto-select first available node
    const firstNode = getAvailableNodes(rssResult.rssColumns)[0];
    if (firstNode) {
      setSelectedNode(firstNode);
    }
  }, []);

  const getAvailableNodes = (columns: string[]): number[] => {
    return columns
      .filter(col => col.startsWith('RSS_'))
      .map(col => parseInt(col.replace('RSS_', '')))
      .filter(nodeId => !isNaN(nodeId))
      .sort((a, b) => a - b);
  };

  const availableNodes = useMemo(() => getAvailableNodes(rssColumns), [rssColumns]);

  const currentNodeData = useMemo(() => {
    if (!selectedNode || !processedData.length) return { data: [], rmsData: {} };

    const rssColumn = `RSS_${selectedNode}`;
    
    // Apply magnification factor
    const scaledData = processedData.map(row => ({
      ...row,
      [rssColumn]: (row[rssColumn] || 0) / magnificationFactor
    }));

    // Calculate RMS for frequency bands
    const rmsResult = calculateRMSForFrequencyBands(scaledData, [rssColumn]);
    const rmsData = {
      "1-100Hz": rmsResult[rssColumn]?.["1-100Hz"] || 0,
      "100-150Hz": rmsResult[rssColumn]?.["100-150Hz"] || 0,
      "150-300Hz": rmsResult[rssColumn]?.["150-300Hz"] || 0
    };

    return { data: scaledData, rmsData };
  }, [selectedNode, processedData, magnificationFactor]);

  const generateSampleData = () => {
    const sampleData: PlotData[] = [];
    for (let freq = 0; freq <= 300; freq += 1) {
      const data: PlotData = { frequency: freq };
      
      // Generate sample data for nodes 8000001-8000016
      [8000001, 8000002, 8000003, 8000004, 8000005, 8000006, 8000007, 8000008, 
       8000013, 8000014, 8000015, 8000016].forEach(nodeId => {
        const amplitude = Math.sin(freq * 0.1) * Math.exp(-freq * 0.01) + Math.random() * 0.1;
        data[`Node_${nodeId}_tm_x_file_1`] = amplitude * 0.8;
        data[`Node_${nodeId}_tm_y_file_1`] = amplitude * 0.6;
        data[`Node_${nodeId}_tm_z_file_1`] = amplitude * 0.4;
      });
      
      sampleData.push(data);
    }
    
    const columns = Object.keys(sampleData[0]).filter(key => key !== 'frequency');
    handleDataParsed(sampleData, columns, 'sample_data.csv');
  };

  const generateReport = async () => {
    // Create a comprehensive report data structure
    const reportData = {
      metadata: {
        fileName,
        selectedNode,
        magnificationFactor,
        unitLabel,
        timestamp: new Date().toISOString(),
        nodeCount: availableNodes.length,
        frequencyRange: [0, Math.max(...processedData.map(d => d.frequency))]
      },
      plotData: currentNodeData.data,
      rmsData: currentNodeData.rmsData,
      allNodesData: availableNodes.map(nodeId => ({
        nodeId,
        rssColumn: `RSS_${nodeId}`,
        rmsData: calculateRMSForFrequencyBands(
          processedData.map(row => ({
            ...row,
            [`RSS_${nodeId}`]: (row[`RSS_${nodeId}`] || 0) / magnificationFactor
          })),
          [`RSS_${nodeId}`]
        )[`RSS_${nodeId}`] || {}
      }))
    };

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `vibration_analysis_report_${timestamp}.json`;

    // Download as JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Vibration Analysis Dashboard
                </h1>
                <p className="text-gray-600">RSS Amplitude & RMS Frequency Band Analysis</p>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
            <Badge variant="outline" className="border-green-500 text-green-600">
              <BarChart3 className="h-3 w-3 mr-1" />
              {processedData.length} Samples
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              {availableNodes.length} Nodes Available
            </Badge>
            {selectedNode && (
              <Badge variant="outline" className="border-purple-500 text-purple-600">
                Current: Node {selectedNode}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Controls Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Data Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Data Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CSVUploader onDataParsed={handleDataParsed} />
              <Button 
                onClick={generateSampleData}
                variant="outline" 
                className="w-full text-xs"
              >
                Load Sample Data
              </Button>
            </CardContent>
          </Card>

          {/* Node Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Node Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <NodeSelector
                availableNodes={availableNodes}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
              />
            </CardContent>
          </Card>

          {/* Unit Conversion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Unit Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-xs">Magnification Factor</Label>
              <Select 
                value={magnificationFactor.toString()} 
                onValueChange={(value) => setMagnificationFactor(parseInt(value))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAGNIFICATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.value} → {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Options & Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Options & Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-components"
                  checked={showComponents}
                  onCheckedChange={(checked) => setShowComponents(checked as boolean)}
                />
                <Label htmlFor="show-components" className="text-xs">
                  Show X/Y/Z Components
                </Label>
              </div>
              <Button 
                onClick={generateReport}
                disabled={!selectedNode || !processedData.length}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Area */}
        {selectedNode && processedData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DualPlotPanel
              data={currentNodeData.data}
              nodeId={selectedNode}
              rssColumn={`RSS_${selectedNode}`}
              rmsData={currentNodeData.rmsData}
              unitLabel={unitLabel}
            />
          </motion.div>
        ) : (
          <Card className="h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Upload data or load sample data to begin analysis</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VibrationAnalysisDashboard;
