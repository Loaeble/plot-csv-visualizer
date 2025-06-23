
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Activity, 
  BarChart3, 
  Upload,
  Settings,
  Zap,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import CSVUploader from './CSVUploader';
import DualPlotPanel from './DualPlotPanel';
import NodeSelector from './NodeSelector';
import ParticleBackground from './ParticleBackground';
import { PlotData } from '@/types/plot';
import { MAGNIFICATION_OPTIONS } from '@/utils/nodeMapping';
import { calculateRSS, calculateRMSForFrequencyBands } from '@/utils/rssCalculations';

const EnhancedVibrationDashboard: React.FC = () => {
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [responseColumns, setResponseColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [magnificationFactor, setMagnificationFactor] = useState(1000);
  const [showComponents, setShowComponents] = useState(false);
  const [processedData, setProcessedData] = useState<PlotData[]>([]);
  const [rssColumns, setRssColumns] = useState<string[]>([]);
  
  // Enhanced UI states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'time' | 'frequency'>('frequency');
  const [frequencyRange, setFrequencyRange] = useState([0, 300]);
  const [amplitudeRange, setAmplitudeRange] = useState([0, 100]);
  const [alerts, setAlerts] = useState<Array<{id: number, type: 'warning' | 'error' | 'info', message: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const unitLabel = MAGNIFICATION_OPTIONS.find(opt => opt.value === magnificationFactor)?.label || "n/*2";

  const handleDataParsed = useCallback((data: PlotData[], columns: string[], filename: string) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay with animation
    setTimeout(() => {
      setPlotData(data);
      setResponseColumns(columns);
      setFileName(filename);
      
      const rssResult = calculateRSS(data, columns);
      setProcessedData(rssResult.data);
      setRssColumns(rssResult.rssColumns);
      
      const firstNode = getAvailableNodes(rssResult.rssColumns)[0];
      if (firstNode) {
        setSelectedNode(firstNode);
      }
      
      // Simulate fault detection
      const maxAmplitude = Math.max(...rssResult.data.map(d => 
        Object.values(d).filter(v => typeof v === 'number' && v > 0) as number[]
      ).flat());
      
      if (maxAmplitude > 0.5) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'warning',
          message: 'High vibration amplitude detected - potential imbalance!'
        }]);
      }
      
      setIsAnalyzing(false);
    }, 2000);
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
    if (!selectedNode || !processedData.length) {
      return { 
        data: [], 
        rmsData: {
          "1-100Hz": 0,
          "100-150Hz": 0,
          "150-300Hz": 0
        }
      };
    }

    const rssColumn = `RSS_${selectedNode}`;
    const scaledData = processedData.map(row => ({
      ...row,
      [rssColumn]: (row[rssColumn] || 0) / magnificationFactor
    }));

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

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      {/* Particle Background */}
      <ParticleBackground />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Activity className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className={`text-3xl font-bold gradient-text ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Advanced Vibration Analysis
                  </h1>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Real-time RSS Amplitude & Frequency Domain Analysis
                  </p>
                </div>
              </div>
              
              {/* Theme Toggle */}
              <div className="flex items-center gap-4">
                <Label className={isDarkMode ? 'text-white' : 'text-gray-900'}>Dark Mode</Label>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
            </div>

            {/* Enhanced Status Bar */}
            <div className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-2"
                    animate={isAnalyzing ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: isAnalyzing ? Infinity : 0, duration: 1 }}
                  >
                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {processedData.length} Samples
                    </Badge>
                  </motion.div>
                  
                  <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
                    {availableNodes.length} Nodes Available
                  </Badge>
                  
                  {selectedNode && (
                    <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">
                      Current: Node {selectedNode}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                    className={`${isRealTimeMode ? 'bg-green-100 border-green-500' : ''}`}
                  >
                    {isRealTimeMode ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isRealTimeMode ? 'Live' : 'Static'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alert System */}
          <AnimatePresence>
            {alerts.map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="mb-4"
              >
                <Alert className={`border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    {alert.message}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => dismissAlert(alert.id)}
                      className="ml-2"
                    >
                      ×
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Enhanced Controls Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Data Input with Drag & Drop Enhancement */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} border-0 shadow-xl`}>
                <CardHeader>
                  <CardTitle className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                    <Upload className="h-4 w-4" />
                    Data Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CSVUploader onDataParsed={handleDataParsed} />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={generateSampleData}
                      variant="outline" 
                      className="w-full text-xs hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {isAnalyzing ? 'Analyzing...' : 'Simulate Data'}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Node Selection */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} border-0 shadow-xl`}>
                <CardHeader>
                  <CardTitle className={`text-sm font-bold ${isDarkMode ? 'text-white' : ''}`}>Node Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <NodeSelector
                    availableNodes={availableNodes}
                    selectedNode={selectedNode}
                    onNodeSelect={setSelectedNode}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Unit Conversion */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} border-0 shadow-xl`}>
                <CardHeader>
                  <CardTitle className={`text-sm font-bold ${isDarkMode ? 'text-white' : ''}`}>Unit Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label className={`text-xs ${isDarkMode ? 'text-gray-300' : ''}`}>Magnification Factor</Label>
                  <Select 
                    value={magnificationFactor.toString()} 
                    onValueChange={(value) => setMagnificationFactor(parseInt(value))}
                  >
                    <SelectTrigger className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white'}`}>
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
            </motion.div>

            {/* Analysis Controls */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} border-0 shadow-xl`}>
                <CardHeader>
                  <CardTitle className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                    <Settings className="h-4 w-4" />
                    Analysis Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className={`text-xs ${isDarkMode ? 'text-gray-300' : ''}`}>Domain</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={analysisMode === 'frequency' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAnalysisMode('frequency')}
                        className="flex-1 text-xs"
                      >
                        Frequency
                      </Button>
                      <Button
                        variant={analysisMode === 'time' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAnalysisMode('time')}
                        className="flex-1 text-xs"
                      >
                        Time
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className={`text-xs ${isDarkMode ? 'text-gray-300' : ''}`}>
                      Frequency Range: {frequencyRange[0]}-{frequencyRange[1]} Hz
                    </Label>
                    <Slider
                      value={frequencyRange}
                      onValueChange={setFrequencyRange}
                      min={0}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Export */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} border-0 shadow-xl`}>
                <CardHeader>
                  <CardTitle className={`text-sm font-bold ${isDarkMode ? 'text-white' : ''}`}>Export & Share</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-components"
                      checked={showComponents}
                      onCheckedChange={(checked) => setShowComponents(checked as boolean)}
                    />
                    <Label htmlFor="show-components" className={`text-xs ${isDarkMode ? 'text-gray-300' : ''}`}>
                      Show X/Y/Z Components
                    </Label>
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Button 
                      disabled={!selectedNode || !processedData.length}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Visualization Area */}
          {selectedNode && processedData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`glass-card ${isDarkMode ? 'glass-card-dark' : ''} h-96 flex items-center justify-center border-0 shadow-xl`}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: isAnalyzing ? 360 : 0,
                    scale: isAnalyzing ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: isAnalyzing ? Infinity : 0 },
                    scale: { duration: 1, repeat: isAnalyzing ? Infinity : 0 }
                  }}
                >
                  <Activity className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} opacity-50`} />
                </motion.div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isAnalyzing ? 'Analyzing vibration data...' : 'Upload data or load sample data to begin analysis'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVibrationDashboard;
