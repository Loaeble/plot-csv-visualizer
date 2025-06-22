
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, TrendingUp, Sparkles, BarChart3, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CSVUploader from '@/components/CSVUploader';
import PlotViewer from '@/components/PlotViewer';

interface PlotData {
  frequency: number;
  [key: string]: number;
}

const Index = () => {
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [responseColumns, setResponseColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [plotTitle, setPlotTitle] = useState<string>('Frequency Response Plot');
  const [xLabel, setXLabel] = useState<string>('Frequency (Hz)');
  const [yLabel, setYLabel] = useState<string>('Response');
  const { toast } = useToast();

  const handleDataParsed = (data: PlotData[], columns: string[], filename: string) => {
    setPlotData(data);
    setResponseColumns(columns);
    setFileName(filename);
    toast({
      title: "🎉 CSV Loaded Successfully",
      description: `Loaded ${data.length} data points with ${columns.length} response columns`,
    });
  };

  const handleDownloadPlot = () => {
    if (plotData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please upload a CSV file first to generate plots",
        variant: "destructive",
      });
      return;
    }

    // Create a canvas element to export the chart
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 1200;
      canvas.height = 800;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `${fileName.replace('.csv', '')}_plot.png`;
      link.href = canvas.toDataURL();
      link.click();
    }

    toast({
      title: "✨ Plot Downloaded",
      description: "Your frequency response plot has been saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center py-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg animate-bounce">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-600 to-red-600 rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Zap className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-scale-in">
            Frequency Response Plotter
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Transform your CSV data into stunning frequency response visualizations with our 
            <span className="font-semibold text-purple-600"> interactive plotting tool</span>
          </p>
          
          <div className="flex justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-md">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Interactive Charts</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-md">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">CSV Import</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-md">
              <Download className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Export Ready</span>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 animate-slide-in-right">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="h-6 w-6" />
                </div>
                Upload Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50/50 animate-fade-in">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>CSV Format:</strong> First column should be frequency (Hz), remaining columns are response data
                  </AlertDescription>
                </Alert>
                
                <CSVUploader onDataParsed={handleDataParsed} />
                
                {fileName && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-inner animate-scale-in">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">Successfully Loaded!</p>
                        <p className="text-sm text-green-700">{fileName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-white/70 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{plotData.length}</div>
                        <div className="text-xs text-gray-600">Data Points</div>
                      </div>
                      <div className="text-center p-3 bg-white/70 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{responseColumns.length}</div>
                        <div className="text-xs text-gray-600">Channels</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Controls Section */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Download className="h-6 w-6" />
                </div>
                Customize & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="animate-fade-in">
                  <Label htmlFor="plot-title" className="text-gray-700 font-medium">Plot Title</Label>
                  <Input 
                    id="plot-title" 
                    value={plotTitle}
                    onChange={(e) => setPlotTitle(e.target.value)}
                    className="mt-2 border-2 focus:border-purple-400 transition-colors"
                    placeholder="Enter your plot title"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <Label htmlFor="x-label" className="text-gray-700 font-medium">X-Axis Label</Label>
                    <Input 
                      id="x-label" 
                      value={xLabel}
                      onChange={(e) => setXLabel(e.target.value)}
                      className="mt-2 border-2 focus:border-blue-400 transition-colors"
                      placeholder="X-axis label"
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Label htmlFor="y-label" className="text-gray-700 font-medium">Y-Axis Label</Label>
                    <Input 
                      id="y-label" 
                      value={yLabel}
                      onChange={(e) => setYLabel(e.target.value)}
                      className="mt-2 border-2 focus:border-pink-400 transition-colors"
                      placeholder="Y-axis label"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleDownloadPlot}
                  disabled={plotData.length === 0}
                  className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                  style={{ animationDelay: '0.3s' }}
                >
                  <Download className="h-5 w-5 mr-3" />
                  Download High-Quality Plot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Plot Viewer */}
        {plotData.length > 0 && (
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-scale-in">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                Interactive Frequency Response Plot
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  Live Preview
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <PlotViewer 
                data={plotData} 
                responseColumns={responseColumns}
                fileName={fileName}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
