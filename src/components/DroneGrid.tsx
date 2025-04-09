
import React from 'react';
import { Drone, Conflict } from '@/types/drone';
import { GRID_SIZE, DRONE_STATUS_COLORS } from '@/utils/constants';
import { cn } from '@/lib/utils';

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
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
        {grid.map((row, y) => 
          row.map((drone, x) => {
            const isConflict = hasConflict(x, y);
            const droneStatusColor = drone ? DRONE_STATUS_COLORS[drone.status] : 'bg-gray-100';
            
            return (
              <div 
                key={`${x}-${y}`} 
                className={cn(
                  "aspect-square flex items-center justify-center border-2 rounded-lg p-2 relative",
                  drone ? droneStatusColor : "bg-gray-100",
                  isConflict ? "border-red-500 animate-pulse" : "border-gray-300"
                )}
              >
                {drone && (
                  <>
                    <span className="text-sm font-semibold">{drone.name}</span>
                    {drone.status !== 'idle' && (
                      <span className="absolute bottom-1 text-xs opacity-70">
                        {drone.status}
                      </span>
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
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="flex justify-between w-full max-w-lg mt-4">
        <div className="flex items-center space-x-4">
          {Object.entries(DRONE_STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-xs">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
