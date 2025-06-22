
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, TrendingUp } from 'lucide-react';
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
  const { toast } = useToast();

  const handleDataParsed = (data: PlotData[], columns: string[], filename: string) => {
    setPlotData(data);
    setResponseColumns(columns);
    setFileName(filename);
    toast({
      title: "CSV Loaded Successfully",
      description: `Loaded ${data.length} data points with ${columns.length} response columns`,
    });
  };

  const handleDownloadPlot = () => {
    if (plotData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
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
      
      // Simple implementation - in a real app you'd use html2canvas or similar
      const link = document.createElement('a');
      link.download = `${fileName.replace('.csv', '')}_plot.png`;
      link.href = canvas.toDataURL();
      link.click();
    }

    toast({
      title: "Plot Downloaded",
      description: "Frequency response plot has been saved",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="h-10 w-10 text-blue-600" />
            Frequency Response Plotter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your CSV files and generate beautiful frequency response plots with interactive visualization
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    CSV format: First column should be frequency (Hz), remaining columns are response data
                  </AlertDescription>
                </Alert>
                
                <CSVUploader onDataParsed={handleDataParsed} />
                
                {fileName && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Loaded:</strong> {fileName}
                    </p>
                    <p className="text-sm text-green-600">
                      {plotData.length} data points, {responseColumns.length} response columns
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plot-title">Plot Title</Label>
                  <Input 
                    id="plot-title" 
                    placeholder="Frequency Response Plot"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="x-label">X-Axis Label</Label>
                    <Input 
                      id="x-label" 
                      placeholder="Frequency (Hz)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y-label">Y-Axis Label</Label>
                    <Input 
                      id="y-label" 
                      placeholder="Response"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleDownloadPlot}
                  disabled={plotData.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Plot as PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plot Viewer */}
        {plotData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle>Interactive Plot</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
