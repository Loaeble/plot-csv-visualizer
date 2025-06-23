
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Play, 
  Pause, 
  Download, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Settings,
  Zap,
  Cpu,
  Radio
} from 'lucide-react';
import CSVUploader from './CSVUploader';
import PlotViewer from './PlotViewer';
import ParticleBackground from './ParticleBackground';
import VibrationSimulator from './VibrationSimulator';
import DiagnosticPanel from './DiagnosticPanel';
import PowerPointExport from './PowerPointExport';
import { PlotData } from '@/types/plot';

const Dashboard: React.FC = () => {
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [responseColumns, setResponseColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'time' | 'frequency'>('frequency');
  const [frequencyRange, setFrequencyRange] = useState([0, 1000]);
  const [amplitudeScale, setAmplitudeScale] = useState([1]);

  const handleDataParsed = useCallback((data: PlotData[], columns: string[], filename: string) => {
    setPlotData(data);
    setResponseColumns(columns);
    setFileName(filename);
  }, []);

  const startSimulation = () => {
    setIsSimulating(true);
    // This would trigger the vibration simulator
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <ParticleBackground />
      
      {/* Main Dashboard */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Activity className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Vibration Analysis Dashboard
                </h1>
                <p className="text-slate-300 mt-1">Advanced real-time vibration monitoring & diagnostics with PowerPoint export</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={isSimulating ? stopSimulation : startSimulation}
                  className={`${isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {isSimulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isSimulating ? 'Stop' : 'Simulate'}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
            <Badge variant="outline" className="border-green-400 text-green-400 bg-green-400/10">
              <Radio className="h-3 w-3 mr-1" />
              Online
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-400 bg-blue-400/10">
              <Cpu className="h-3 w-3 mr-1" />
              {plotData.length} Samples
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-400 bg-purple-400/10">
              <Zap className="h-3 w-3 mr-1" />
              {responseColumns.length} Channels
            </Badge>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Controls */}
          <motion.div 
            className="col-span-12 lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Upload Panel */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="h-5 w-5" />
                  Data Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CSVUploader onDataParsed={handleDataParsed} />
              </CardContent>
            </Card>

            {/* Analysis Controls */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5" />
                  Analysis Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Mode Toggle */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">Analysis Mode</label>
                  <div className="flex gap-2">
                    <motion.button
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        analysisMode === 'time' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                      onClick={() => setAnalysisMode('time')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Time Domain
                    </motion.button>
                    <motion.button
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        analysisMode === 'frequency' 
                          ? 'bg-purple-500 text-white shadow-lg' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                      onClick={() => setAnalysisMode('frequency')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Frequency Domain
                    </motion.button>
                  </div>
                </div>

                {/* Frequency Range */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">
                    Frequency Range: {frequencyRange[0]} - {frequencyRange[1]} Hz
                  </label>
                  <Slider
                    value={frequencyRange}
                    onValueChange={setFrequencyRange}
                    max={2000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Amplitude Scale */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">
                    Amplitude Scale: {amplitudeScale[0]}x
                  </label>
                  <Slider
                    value={amplitudeScale}
                    onValueChange={setAmplitudeScale}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Diagnostic Panel */}
            <DiagnosticPanel data={plotData} />
          </motion.div>

          {/* Center Panel - Main Visualization */}
          <motion.div 
            className="col-span-12 lg:col-span-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Vibration Analysis Plot
                  <Badge className="ml-auto bg-white/20 text-white">
                    {analysisMode === 'frequency' ? 'FFT' : 'Time Series'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {plotData.length > 0 ? (
                    <motion.div
                      key="plot"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PlotViewer 
                        data={plotData} 
                        responseColumns={responseColumns}
                        fileName={fileName}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-96 flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg"
                    >
                      <div className="text-center text-slate-400">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Upload data or start simulation to begin analysis</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - Simulation & Export */}
          <motion.div 
            className="col-span-12 lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Vibration Simulator */}
            <VibrationSimulator 
              isSimulating={isSimulating}
              onDataGenerated={handleDataParsed}
            />

            {/* PowerPoint Export Panel */}
            <PowerPointExport 
              data={plotData}
              responseColumns={responseColumns}
              fileName={fileName}
            />

            {/* Export Panel */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Download className="h-5 w-5" />
                  Quick Export
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    disabled={plotData.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    disabled={plotData.length === 0}
                  >
                    Generate Report
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
