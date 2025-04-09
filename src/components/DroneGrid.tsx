
import React from 'react';
import { Drone, Conflict } from '@/types/drone';
import { GRID_SIZE, DRONE_STATUS_COLORS, AIRSPACE_STRUCTURE } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { ArrowUp, AlertTriangle, Layers } from 'lucide-react';

interface DroneGridProps {
  drones: Drone[];
  conflicts: Conflict[];
}

export const DroneGrid: React.FC<DroneGridProps> = ({ drones, conflicts }) => {
  // Create a grid array of size 4x4
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  
  // Place drones in the grid
  drones.forEach(drone => {
    const { x, y } = drone.position;
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      grid[y][x] = drone;
    }
  });
  
  // Check if a position has a conflict
  const hasConflict = (x: number, y: number) => {
    return conflicts.some(conflict => {
      const { conflictPosition } = conflict;
      return conflictPosition.x === x && conflictPosition.y === y;
    });
  };
  
  // Get conflict for a specific drone
  const getDroneConflict = (droneId: number) => {
    return conflicts.find(conflict => conflict.droneIds.includes(droneId));
  };
  
  // Get the quadrant for a grid position
  const getQuadrant = (x: number, y: number) => {
    if (x < 2) {
      return y < 2 ? 1 : 3;
    } else {
      return y < 2 ? 2 : 4;
    }
  };
  
  // Get border color for quadrant
  const getQuadrantBorderColor = (x: number, y: number) => {
    const quadrant = getQuadrant(x, y);
    switch (quadrant) {
      case 1: return 'border-blue-200';
      case 2: return 'border-green-200';
      case 3: return 'border-yellow-200';
      case 4: return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
        {grid.map((row, y) => 
          row.map((drone, x) => {
            const isConflict = hasConflict(x, y);
            const droneConflict = drone ? getDroneConflict(drone.id) : null;
            const droneStatusColor = drone ? DRONE_STATUS_COLORS[drone.status] : 'bg-gray-100';
            const quadrantBorder = getQuadrantBorderColor(x, y);
            
            return (
              <div 
                key={`${x}-${y}`} 
                className={cn(
                  "aspect-square flex flex-col items-center justify-center border-2 rounded-lg p-2 relative",
                  drone ? droneStatusColor : "bg-gray-100",
                  isConflict ? "border-red-500 animate-pulse" : quadrantBorder,
                  "overflow-hidden"
                )}
              >
                {/* Dock label */}
                <div className="absolute top-1 left-1 text-xs opacity-70">
                  D{y * GRID_SIZE + x + 1}
                </div>
                
                {drone && (
                  <>
                    <span className="text-sm font-semibold">{drone.name}</span>
                    
                    {drone.status !== 'idle' && (
                      <span className="text-xs opacity-70">
                        {drone.status}
                      </span>
                    )}
                    
                    {/* Altitude layer indicator */}
                    {drone.assignedLayer && (
                      <div className="absolute bottom-1 left-1 flex items-center">
                        <Layers className="h-3 w-3 mr-0.5" />
                        <span className="text-xs">{drone.assignedLayer}</span>
                      </div>
                    )}
                    
                    {/* Battery indicator */}
                    <div className="absolute top-1 right-1 w-3 h-3">
                      <div 
                        className={`w-full h-full rounded-full ${
                          drone.batteryLevel > 80 ? 'bg-green-500' : 
                          drone.batteryLevel > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    
                    {/* Conflict indicator */}
                    {droneConflict && (
                      <div className="absolute bottom-1 right-1 text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                    )}
                    
                    {/* Direction indicator for flying drones */}
                    {drone.flightPath && drone.flightPath.length > 0 && drone.status === 'flying' && (
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ArrowUp 
                          className="h-4 w-4 text-black opacity-60"
                          style={{ 
                            transform: `rotate(${Math.atan2(
                              drone.flightPath[0].y - drone.position.y,
                              drone.flightPath[0].x - drone.position.x
                            ) * (180 / Math.PI)}deg)` 
                          }} 
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="flex justify-between w-full max-w-lg mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs w-full">
          {Object.entries(DRONE_STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-xs capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-lg mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span>Red borders indicate potential conflict zones</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          <Layers className="h-3 w-3" />
          <span>Numbers show assigned altitude layers</span>
        </div>
      </div>
    </div>
  );
};
