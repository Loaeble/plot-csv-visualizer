
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Settings } from 'lucide-react';
import { PlotData, PPTExportOptions } from '@/types/plot';
import { NODE_TITLE_MAP, MAGNIFICATION_OPTIONS } from '@/utils/nodeMapping';
import { calculateRSS } from '@/utils/rssCalculations';

interface PowerPointExportProps {
  data: PlotData[];
  responseColumns: string[];
  fileName: string;
}

const PowerPointExport: React.FC<PowerPointExportProps> = ({ 
  data, 
  responseColumns, 
  fileName 
}) => {
  const [exportOptions, setExportOptions] = useState<PPTExportOptions>({
    startNode: 8000001,
    endNode: 8000045,
    magnificationFactor: 1000,
    unitLabel: "n/*2"
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleMagnificationChange = (value: string) => {
    const factor = parseInt(value);
    const option = MAGNIFICATION_OPTIONS.find(opt => opt.value === factor);
    
    setExportOptions(prev => ({
      ...prev,
      magnificationFactor: factor,
      unitLabel: option?.label || "n/*2"
    }));
  };

  const generatePowerPointData = async () => {
    setIsExporting(true);
    
    try {
      // Calculate RSS values
      const rssResult = calculateRSS(data, responseColumns);
      
      // Apply magnification factor
      const processedData = rssResult.data.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
          if (key !== 'frequency') {
            newRow[key] = newRow[key] / exportOptions.magnificationFactor;
          }
        });
        return newRow;
      });

      // Calculate RMS values for frequency bands
      const rmsData = calculateRMSByBands(processedData, rssResult.rssColumns);

      // Generate export data structure
      const exportData = {
        metadata: {
          fileName,
          startNode: exportOptions.startNode,
          endNode: exportOptions.endNode,
          magnificationFactor: exportOptions.magnificationFactor,
          unitLabel: exportOptions.unitLabel,
          nodeCount: rssResult.rssColumns.length,
          frequencyRange: [Math.min(...data.map(d => d.frequency)), Math.max(...data.map(d => d.frequency))]
        },
        plotData: processedData,
        rssColumns: rssResult.rssColumns,
        rmsData,
        nodeTitles: NODE_TITLE_MAP
      };

      // Create downloadable JSON file for backend processing
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace('.csv', '')}_ppt_data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('PowerPoint data exported successfully');
      
    } catch (error) {
      console.error('Error generating PowerPoint data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const calculateRMSByBands = (data: PlotData[], rssColumns: string[]) => {
    const bands = {
      "DNS_1_100": data.filter(row => row.frequency > 0 && row.frequency < 100),
      "DNS_100_150": data.filter(row => row.frequency >= 100 && row.frequency < 150),
      "DNS_150_300": data.filter(row => row.frequency >= 150 && row.frequency < 300)
    };

    const rmsResults: any = {};

    rssColumns.forEach(column => {
      rmsResults[column] = {};
      Object.entries(bands).forEach(([bandName, bandData]) => {
        if (bandData.length > 0) {
          const sumOfSquares = bandData.reduce((sum, row) => sum + (row[column] || 0) ** 2, 0);
          rmsResults[column][bandName] = Math.sqrt(sumOfSquares / bandData.length);
        } else {
          rmsResults[column][bandName] = 0;
        }
      });
    });

    return rmsResults;
  };

  const availableNodes = responseColumns
    .filter(col => col.includes('Node_'))
    .map(col => {
      const match = col.match(/Node_(\d+)_/);
      return match ? parseInt(match[1]) : null;
    })
    .filter((node): node is number => node !== null)
    .filter((node, index, self) => self.indexOf(node) === index)
    .sort((a, b) => a - b);

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-green-600/80 to-teal-600/80 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          PowerPoint Export
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-node" className="text-sm font-medium text-slate-300">
              Start Node
            </Label>
            <Input
              id="start-node"
              type="number"
              value={exportOptions.startNode}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                startNode: parseInt(e.target.value) || 8000001
              }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="end-node" className="text-sm font-medium text-slate-300">
              End Node
            </Label>
            <Input
              id="end-node"
              type="number"
              value={exportOptions.endNode}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                endNode: parseInt(e.target.value) || 8000045
              }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="magnification" className="text-sm font-medium text-slate-300 mb-2 block">
            Unit Conversion Factor
          </Label>
          <Select value={exportOptions.magnificationFactor.toString()} onValueChange={handleMagnificationChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Available Nodes</Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {availableNodes.map(node => (
              <Badge 
                key={node}
                variant="outline" 
                className="border-blue-400 text-blue-400 bg-blue-400/10"
              >
                {node}: {NODE_TITLE_MAP[node] || `Node ${node}`}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-600 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <span className="font-medium">Data Points:</span> {data.length}
            </div>
            <div>
              <span className="font-medium">Channels:</span> {responseColumns.length}
            </div>
            <div>
              <span className="font-medium">Unit Label:</span> {exportOptions.unitLabel}
            </div>
            <div>
              <span className="font-medium">Node Range:</span> {exportOptions.startNode} - {exportOptions.endNode}
            </div>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={generatePowerPointData}
            disabled={data.length === 0 || isExporting}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white"
          >
            {isExporting ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Generating Export Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PowerPoint Data
              </>
            )}
          </Button>
        </motion.div>

        <div className="text-xs text-slate-400 space-y-1">
          <p>• This will generate a JSON file with processed data for PowerPoint creation</p>
          <p>• RSS values will be calculated automatically</p>
          <p>• RMS values will be computed for frequency bands: 1-100Hz, 100-150Hz, 150-300Hz</p>
          <p>• Use the generated JSON file with the Python backend to create the PowerPoint</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerPointExport;
