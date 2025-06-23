
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Waves 
} from 'lucide-react';
import { PlotData } from '@/types/plot';

interface VibrationSimulatorProps {
  isSimulating: boolean;
  onDataGenerated: (data: PlotData[], columns: string[], filename: string) => void;
}

const VibrationSimulator: React.FC<VibrationSimulatorProps> = ({ 
  isSimulating, 
  onDataGenerated 
}) => {
  const [frequency, setFrequency] = useState([50]);
  const [amplitude, setAmplitude] = useState([1]);
  const [dampingRatio, setDampingRatio] = useState([0.05]);
  const [noiseLevel, setNoiseLevel] = useState([0.1]);

  const generateSyntheticData = () => {
    const freqPoints = 400;
    const freqRange = { min: 0, max: 200 };
    const data: PlotData[] = [];

    for (let i = 0; i < freqPoints; i++) {
      const freq = freqRange.min + (i / (freqPoints - 1)) * (freqRange.max - freqRange.min);
      
      // Generate synthetic vibration response with resonance peaks
      const omega = 2 * Math.PI * freq;
      const omega_n = 2 * Math.PI * frequency[0]; // Natural frequency
      const zeta = dampingRatio[0]; // Damping ratio
      
      // Transfer function magnitude for SDOF system
      const denominator = Math.sqrt(
        Math.pow(1 - Math.pow(omega / omega_n, 2), 2) + 
        Math.pow(2 * zeta * (omega / omega_n), 2)
      );
      
      const baseResponse = amplitude[0] / denominator;
      
      // Add some noise and additional resonances
      const noise = (Math.random() - 0.5) * noiseLevel[0] * baseResponse;
      const secondResonance = freq > 80 ? 0.3 * amplitude[0] / (1 + Math.pow((freq - 120) / 10, 2)) : 0;
      
      // Generate X, Y, Z components
      const x = baseResponse + noise;
      const y = baseResponse * 0.7 + noise * 0.8 + secondResonance;
      const z = baseResponse * 0.5 + noise * 0.6;

      data.push({
        frequency: freq,
        'Node_1_X': x,
        'Node_1_Y': y,
        'Node_1_Z': z,
        'Node_2_X': x * 0.8 + (Math.random() - 0.5) * 0.1,
        'Node_2_Y': y * 0.9 + (Math.random() - 0.5) * 0.1,
        'Node_2_Z': z * 0.7 + (Math.random() - 0.5) * 0.1,
      });
    }

    const columns = ['Node_1_X', 'Node_1_Y', 'Node_1_Z', 'Node_2_X', 'Node_2_Y', 'Node_2_Z'];
    onDataGenerated(data, columns, 'simulated_vibration_data.csv');
  };

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        generateSyntheticData();
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isSimulating, frequency, amplitude, dampingRatio, noiseLevel]);

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-green-600/80 to-blue-600/80 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="h-5 w-5" />
          Vibration Simulator
          {isSimulating && (
            <Badge className="ml-auto bg-green-400/20 text-green-400 border-green-400">
              <Waves className="h-3 w-3 mr-1 animate-pulse" />
              Running
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Simulation Parameters */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Natural Frequency: {frequency[0]} Hz
            </label>
            <Slider
              value={frequency}
              onValueChange={setFrequency}
              max={100}
              min={10}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Amplitude: {amplitude[0]}
            </label>
            <Slider
              value={amplitude}
              onValueChange={setAmplitude}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Damping Ratio: {dampingRatio[0]}
            </label>
            <Slider
              value={dampingRatio}
              onValueChange={setDampingRatio}
              max={0.2}
              min={0.01}
              step={0.01}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Noise Level: {noiseLevel[0]}
            </label>
            <Slider
              value={noiseLevel}
              onValueChange={setNoiseLevel}
              max={0.5}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={generateSyntheticData}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Generate Data
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => {
                setFrequency([50]);
                setAmplitude([1]);
                setDampingRatio([0.05]);
                setNoiseLevel([0.1]);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Parameters
            </Button>
          </motion.div>
        </div>

        {/* Simulation Info */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulates a 2-DOF vibration system with resonance peaks, 
            noise, and multi-directional responses for realistic testing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VibrationSimulator;
