
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, 
  Play,
  Pause,
  FastForward,
  Clock
} from "lucide-react";

interface SimulationControlsProps {
  resetSystem: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  resetSystem 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          className="flex-1"
          disabled={true}
        >
          <Play className="h-4 w-4 mr-1" />
          Start Sim
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          disabled={true}
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
        
        <Button 
          variant="outline"
          className="flex-1"
          disabled={true}
        >
          <FastForward className="h-4 w-4 mr-1" />
          Speed Up
        </Button>
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
        This is a simulation of the drone coordination system. 
        In a production environment, it would connect to real drones via an API.
      </div>
    </div>
  );
};
