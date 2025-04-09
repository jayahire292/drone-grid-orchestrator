
import { v4 as uuidv4 } from 'uuid';
import { Drone, Conflict, GridPosition, TargetPosition } from '@/types/drone';
import { ALTITUDE_LEVELS, AIRSPACE_STRUCTURE } from './constants';
import { calculateOptimalPath } from './pathfinding';

// Check for potential flight path conflicts
export function detectConflicts(drones: Drone[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // We need at least 2 drones with paths to have conflicts
  if (drones.length < 2) return conflicts;
  
  // Check each pair of drones
  for (let i = 0; i < drones.length; i++) {
    const droneA = drones[i];
    if (!droneA.flightPath) continue;
    
    for (let j = i + 1; j < drones.length; j++) {
      const droneB = drones[j];
      if (!droneB.flightPath) continue;
      
      // Skip if drones are at different altitude layers and following the rules
      if (droneA.assignedLayer !== droneB.assignedLayer) continue;
      
      // Check each point in drone A's path against each point in drone B's path
      for (let a = 0; a < droneA.flightPath.length; a++) {
        const pointA = droneA.flightPath[a];
        
        for (let b = 0; b < droneB.flightPath.length; b++) {
          const pointB = droneB.flightPath[b];
          
          // Check if points are close enough to be a conflict
          const distance = Math.sqrt(
            Math.pow(pointA.x - pointB.x, 2) + 
            Math.pow(pointA.y - pointB.y, 2)
          );
          
          // If distance is small enough, we have a potential conflict
          if (distance < 1.5) {
            // Calculate time to conflict (simplified)
            const timeToConflict = Math.min(a, b) * 2; // 2 seconds per waypoint
            
            // Determine severity
            let severity: 'low' | 'medium' | 'high' = 'low';
            if (distance < 0.5) severity = 'high';
            else if (distance < 1) severity = 'medium';
            
            // Determine resolution strategy
            let resolution: 'altitude-change' | 'path-reroute' | 'time-delay' | 'emergency-stop';
            
            if (timeToConflict < 2) {
              resolution = 'emergency-stop';
            } else if (timeToConflict < 5) {
              resolution = 'altitude-change';
            } else if (timeToConflict < 10) {
              resolution = 'path-reroute';
            } else {
              resolution = 'time-delay';
            }
            
            conflicts.push({
              id: uuidv4(),
              droneIds: [droneA.id, droneB.id],
              conflictPosition: { ...pointA },
              severity,
              timeToConflict,
              resolution
            });
            
            // Break once we find a conflict between these drones
            break;
          }
        }
      }
    }
  }
  
  return conflicts;
}

// Resolve conflicts by adjusting drone flight parameters
export function resolveConflicts(drones: Drone[], conflicts: Conflict[]): Drone[] {
  if (!conflicts.length) return drones;
  
  const updatedDrones = [...drones];
  
  conflicts.forEach(conflict => {
    const { droneIds, resolution } = conflict;
    
    // Get drone indexes
    const droneIndexA = updatedDrones.findIndex(d => d.id === droneIds[0]);
    const droneIndexB = updatedDrones.findIndex(d => d.id === droneIds[1]);
    
    if (droneIndexA === -1 || droneIndexB === -1) return;
    
    const droneA = updatedDrones[droneIndexA];
    const droneB = updatedDrones[droneIndexB];
    
    // Apply resolution strategy
    switch (resolution) {
      case 'altitude-change':
        // Assign different altitude layers
        updatedDrones[droneIndexA] = {
          ...droneA,
          assignedLayer: ALTITUDE_LEVELS.SECONDARY_TRANSIT
        };
        
        updatedDrones[droneIndexB] = {
          ...droneB,
          assignedLayer: ALTITUDE_LEVELS.PRIMARY_TRANSIT
        };
        break;
        
      case 'path-reroute':
        // Recalculate path for drone with higher ID (lower priority)
        if (droneA.id > droneB.id) {
          updatedDrones[droneIndexA] = recalculateDronePath(droneA);
        } else {
          updatedDrones[droneIndexB] = recalculateDronePath(droneB);
        }
        break;
        
      case 'time-delay':
        // Delay the drone with higher ID (lower priority)
        if (droneA.id > droneB.id) {
          updatedDrones[droneIndexA] = {
            ...droneA,
            status: 'preparing', // Hold the drone temporarily
          };
        } else {
          updatedDrones[droneIndexB] = {
            ...droneB,
            status: 'preparing',
          };
        }
        break;
        
      case 'emergency-stop':
        // Stop both drones and mark as emergency
        updatedDrones[droneIndexA] = {
          ...droneA,
          status: 'emergency',
        };
        
        updatedDrones[droneIndexB] = {
          ...droneB,
          status: 'emergency',
        };
        break;
    }
  });
  
  return updatedDrones;
}

// Create a safer path for a drone
function recalculateDronePath(drone: Drone): Drone {
  if (!drone.position || !drone.targetPosition) return drone;
  
  // Create a slightly different path
  const originalPath = calculateOptimalPath(drone.position, drone.targetPosition);
  
  // Add some randomness to avoid the conflict
  const modifiedPath = originalPath.map((point, index) => {
    if (index > 0 && index < originalPath.length - 1) {
      // Add a small offset to the middle points
      return {
        x: point.x + (Math.random() > 0.5 ? 0.5 : -0.5),
        y: point.y + (Math.random() > 0.5 ? 0.5 : -0.5)
      };
    }
    return point;
  });
  
  return {
    ...drone,
    flightPath: modifiedPath
  };
}

// Assign the correct altitude layer based on drone ID and flight rules
export function assignAltitudeLayer(drone: Drone): number {
  // Even-numbered drones use Layer 3, odd-numbered drones use Layer 4
  return drone.id % 2 === 0 ? ALTITUDE_LEVELS.PRIMARY_TRANSIT : ALTITUDE_LEVELS.SECONDARY_TRANSIT;
}

// Determine quadrant based on dock position
export function determineQuadrant(x: number, y: number): number {
  if (x < 2) {
    return y < 2 ? 1 : 3; // Upper left or lower left
  } else {
    return y < 2 ? 2 : 4; // Upper right or lower right
  }
}

// Create a complete flight plan with proper altitude changes
export function createFlightPlan(drone: Drone, target: TargetPosition): GridPosition[] {
  if (!drone.position) return [];
  
  // Create base horizontal path
  const horizontalPath = calculateOptimalPath(drone.position, target);
  
  // Add altitude changes to the path
  // This is just a simple simulation - in reality altitude would be a third dimension
  
  // Create complete flight sequence:
  // 1. Takeoff (vertical, Layer 1)
  // 2. Transition up (Layer 2)
  // 3. Horizontal transit (Layer 3 or 4 based on drone ID)
  // 4. Transition down (Layer 2)
  // 5. Landing (vertical, Layer 1)
  
  return horizontalPath;
}
