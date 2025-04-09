
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, 
  Play,
  Pause,
  FastForward,
  Clock,
  Settings
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SimulationControlsProps {
  resetSystem: () => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  isSimulationRunning: boolean;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  resetSystem,
  startSimulation,
  pauseSimulation,
  isSimulationRunning,
  simulationSpeed,
  setSimulationSpeed
}) => {
  const [airspaceModel, setAirspaceModel] = useState<'layered' | 'timeSlot'>('layered');
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={startSimulation}
          disabled={isSimulationRunning}
        >
          <Play className="h-4 w-4 mr-1" />
          Start Sim
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={pauseSimulation}
          disabled={!isSimulationRunning}
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
        
        <Button 
          variant="outline"
          className="flex-1"
          onClick={() => setSimulationSpeed(Math.min(simulationSpeed * 2, 8))}
          disabled={!isSimulationRunning || simulationSpeed >= 8}
        >
          <FastForward className="h-4 w-4 mr-1" />
          Speed Up
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Simulation Speed</span>
          <span className="text-xs font-medium">{simulationSpeed}x</span>
        </div>
        <Slider 
          value={[simulationSpeed]} 
          min={1} 
          max={8} 
          step={1} 
          onValueChange={(value) => setSimulationSpeed(value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-gray-500">Airspace Model</label>
        <Select 
          value={airspaceModel} 
          onValueChange={(value) => setAirspaceModel(value as 'layered' | 'timeSlot')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select airspace model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="layered">Layered Altitude Model</SelectItem>
            <SelectItem value="timeSlot">Time-Slot Separation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={resetSystem}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset System
        </Button>
      </div>
      
      <div className="bg-slate-50 p-2 rounded flex items-center space-x-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>Simulation Mode</span>
      </div>
      
      <div className="text-xs text-gray-500">
        This is a simulation of the FlytBase drone coordination system. 
        In a production environment, it would connect to real drones via an API.
      </div>
    </div>
  );
};
