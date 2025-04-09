
import React, { useState } from 'react';
import { Drone, TargetPosition } from '@/types/drone';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { POTENTIAL_TARGETS } from '@/utils/constants';

interface ControlPanelProps {
  drones: Drone[];
  startFlight: (droneId: number, target: TargetPosition, priority?: 'low' | 'medium' | 'high') => void;
  endFlight: (droneId: number) => void;
  queueFlight: (droneId: number, target: TargetPosition, priority?: 'low' | 'medium' | 'high') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  drones, 
  startFlight, 
  endFlight,
  queueFlight
}) => {
  const [selectedDroneId, setSelectedDroneId] = useState<string>('');
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const handleStartFlight = () => {
    if (selectedDroneId && selectedTargetIndex) {
      const droneId = parseInt(selectedDroneId, 10);
      const targetIndex = parseInt(selectedTargetIndex, 10);
      const target = POTENTIAL_TARGETS[targetIndex];
      
      startFlight(droneId, target, selectedPriority);
    }
  };

  const handleQueueFlight = () => {
    if (selectedDroneId && selectedTargetIndex) {
      const droneId = parseInt(selectedDroneId, 10);
      const targetIndex = parseInt(selectedTargetIndex, 10);
      const target = POTENTIAL_TARGETS[targetIndex];
      
      queueFlight(droneId, target, selectedPriority);
    }
  };
  
  const handleEndFlight = () => {
    if (selectedDroneId) {
      const droneId = parseInt(selectedDroneId, 10);
      endFlight(droneId);
    }
  };

  // Get the selected drone
  const selectedDrone = selectedDroneId 
    ? drones.find(d => d.id === parseInt(selectedDroneId, 10)) 
    : undefined;
  
  const canStartFlight = selectedDrone?.status === 'idle' && selectedTargetIndex;
  const canEndFlight = selectedDrone && ['taking-off', 'flying', 'returning'].includes(selectedDrone.status);
  
  return (
    <Card className="w-full">
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Drone:</label>
          <Select 
            value={selectedDroneId} 
            onValueChange={setSelectedDroneId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a drone" />
            </SelectTrigger>
            <SelectContent>
              {drones.map(drone => (
                <SelectItem key={drone.id} value={drone.id.toString()}>
                  {drone.name} - {drone.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedDrone && (
          <div className="p-2 rounded bg-slate-50 text-sm">
            <p><strong>Drone:</strong> {selectedDrone.name}</p>
            <p><strong>Status:</strong> {selectedDrone.status}</p>
            <p><strong>Battery:</strong> {selectedDrone.batteryLevel}%</p>
            {selectedDrone.targetPosition && (
              <p>
                <strong>Target:</strong> ({selectedDrone.targetPosition.x}, {selectedDrone.targetPosition.y})
                {selectedDrone.targetPosition.description && ` - ${selectedDrone.targetPosition.description}`}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Location:</label>
          <Select 
            value={selectedTargetIndex} 
            onValueChange={setSelectedTargetIndex}
            disabled={!selectedDrone || selectedDrone.status !== 'idle'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target location" />
            </SelectTrigger>
            <SelectContent>
              {POTENTIAL_TARGETS.map((target, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {target.description || `(${target.x}, ${target.y})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Mission Priority:</label>
          <Select 
            value={selectedPriority} 
            onValueChange={(value) => setSelectedPriority(value as 'low' | 'medium' | 'high')}
            disabled={!selectedDrone || selectedDrone.status !== 'idle'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleStartFlight} 
            disabled={!canStartFlight}
            className="flex-1"
          >
            Start Flight
          </Button>
          
          <Button 
            onClick={handleQueueFlight} 
            disabled={!selectedDrone || !selectedTargetIndex}
            variant="outline"
            className="flex-1"
          >
            Queue Flight
          </Button>
          
          <Button 
            onClick={handleEndFlight} 
            disabled={!canEndFlight}
            variant="secondary"
            className="flex-1"
          >
            End Flight
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
