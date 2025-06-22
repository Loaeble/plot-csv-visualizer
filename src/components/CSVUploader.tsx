import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlotData } from '@/types/plot';

interface CSVUploaderProps {
  onDataParsed: (data: PlotData[], columns: string[], filename: string) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataParsed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseCSV = (csvContent: string): { data: PlotData[], columns: string[] } => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least 2 rows (header + data)');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    if (headers.length < 2) {
      throw new Error('CSV must have at least 2 columns (frequency + responses)');
    }

    // Response columns are all columns except the first (frequency)
    const responseColumns = headers.slice(1);
    
    // Parse data rows
    const data: PlotData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}, skipping`);
        continue;
      }

      const frequency = parseFloat(values[0]);
      if (isNaN(frequency)) {
        console.warn(`Invalid frequency value in row ${i + 1}: ${values[0]}, skipping`);
        continue;
      }

      const dataPoint: PlotData = { frequency };
      let validRow = true;

      for (let j = 1; j < values.length; j++) {
        const response = parseFloat(values[j]);
        if (isNaN(response)) {
          console.warn(`Invalid response value in row ${i + 1}, column ${headers[j]}: ${values[j]}`);
          validRow = false;
          break;
        }
        dataPoint[headers[j]] = response;
      }

      if (validRow) {
        data.push(dataPoint);
      }
    }

    if (data.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    return { data, columns: responseColumns };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const content = await file.text();
      const { data, columns } = parseCSV(content);
      
      console.log(`Parsed CSV: ${data.length} rows, ${columns.length} response columns`);
      console.log('Sample data:', data.slice(0, 3));
      
      onDataParsed(data, columns, file.name);
    } catch (error) {
      console.error('CSV parsing error:', error);
      toast({
        title: "CSV Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200"
        variant="outline"
      >
        <div className="flex flex-col items-center gap-2">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span>Click to upload CSV file</span>
            </>
          )}
        </div>
      </Button>

      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">CSV Format for RSS Analysis:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>First column: Frequency values (Hz)</li>
              <li>Response columns: Node_ID_X, Node_ID_Y, Node_ID_Z</li>
              <li>RSS will be calculated automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
