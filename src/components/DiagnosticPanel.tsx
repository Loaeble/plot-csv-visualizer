
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  TrendingUp,
  TrendingDown 
} from 'lucide-react';
import { PlotData } from '@/types/plot';

interface DiagnosticPanelProps {
  data: PlotData[];
}

interface DiagnosticResult {
  severity: 'good' | 'warning' | 'critical';
  message: string;
  value?: number;
  threshold?: number;
}

const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ data }) => {
  const diagnostics = useMemo(() => {
    if (data.length === 0) return [];

    const results: DiagnosticResult[] = [];
    
    // Get all response columns (excluding frequency)
    const responseColumns = Object.keys(data[0]).filter(key => key !== 'frequency');
    
    if (responseColumns.length === 0) return results;

    // Calculate RMS values for each channel
    responseColumns.forEach(column => {
      const values = data.map(d => d[column] || 0);
      const rms = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0) / values.length);
      
      // Diagnostic thresholds
      if (rms > 2.0) {
        results.push({
          severity: 'critical',
          message: `High vibration detected in ${column}`,
          value: rms,
          threshold: 2.0
        });
      } else if (rms > 1.0) {
        results.push({
          severity: 'warning',
          message: `Elevated vibration in ${column}`,
          value: rms,
          threshold: 1.0
        });
      }
    });

    // Peak frequency analysis
    if (responseColumns.length > 0) {
      const firstColumn = responseColumns[0];
      const maxValue = Math.max(...data.map(d => d[firstColumn] || 0));
      const maxIndex = data.findIndex(d => (d[firstColumn] || 0) === maxValue);
      const peakFreq = data[maxIndex]?.frequency || 0;

      if (peakFreq > 0) {
        if (peakFreq < 10) {
          results.push({
            severity: 'warning',
            message: `Low frequency resonance at ${peakFreq.toFixed(1)} Hz`,
            value: peakFreq
          });
        } else if (peakFreq > 150) {
          results.push({
            severity: 'warning',
            message: `High frequency content at ${peakFreq.toFixed(1)} Hz`,
            value: peakFreq
          });
        }
      }
    }

    // If no issues found
    if (results.length === 0) {
      results.push({
        severity: 'good',
        message: 'All vibration levels within normal range'
      });
    }

    return results;
  }, [data]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'good':
        return 'border-green-400 bg-green-400/10 text-green-400';
      case 'warning':
        return 'border-yellow-400 bg-yellow-400/10 text-yellow-400';
      case 'critical':
        return 'border-red-400 bg-red-400/10 text-red-400';
      default:
        return 'border-blue-400 bg-blue-400/10 text-blue-400';
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5" />
          AI Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {diagnostics.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Upload data to see diagnostic insights</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Alert className={`${getSeverityColor(diagnostic.severity)} border`}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(diagnostic.severity)}
                    <div className="flex-1">
                      <AlertDescription className="text-sm">
                        {diagnostic.message}
                        {diagnostic.value && (
                          <div className="mt-1 text-xs opacity-80">
                            Value: {diagnostic.value.toFixed(3)}
                            {diagnostic.threshold && ` (Threshold: ${diagnostic.threshold})`}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {data.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-700">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-blue-400">{data.length}</div>
              <div className="text-xs text-slate-400">Data Points</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-purple-400">
                {diagnostics.filter(d => d.severity === 'critical').length}
              </div>
              <div className="text-xs text-slate-400">Critical Issues</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
