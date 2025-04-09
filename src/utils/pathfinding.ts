
import { v4 as uuidv4 } from 'uuid';
import { Drone, GridPosition, Conflict } from '@/types/drone';
import { ALTITUDE_LEVELS } from './constants';

// Simple path calculation (direct line)
export function calculateOptimalPath(
  start: GridPosition,
  end: GridPosition
): GridPosition[] {
  // Create a path with 5 points including start and end
  const path: GridPosition[] = [];
  
  // Add start point
  path.push({ ...start });
  
  // Add 3 intermediate points
  for (let i = 1; i <= 3; i++) {
    const t = i / 4; // Fraction of the way from start to end
    path.push({
      x: start.x + Math.round((end.x - start.x) * t),
      y: start.y + Math.round((end.y - start.y) * t)
    });
  }
  
  // Add end point
  path.push({ ...end });
  
  return path;
}

// Check if two paths have any intersecting points
export function checkPathConflicts(drones: Drone[]): Conflict[] {
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
          // This threshold could be adjusted based on drone size and safety margins
          if (distance < 0.5) {
            // Calculate time to conflict (simplified)
            const timeToConflict = Math.min(a, b) * 2; // 2 seconds per waypoint
            
            conflicts.push({
              id: uuidv4(),
              droneIds: [droneA.id, droneB.id],
              conflictPosition: { ...pointA },
              severity: distance < 0.2 ? 'high' : distance < 0.35 ? 'medium' : 'low',
              timeToConflict
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

// Assign altitudes to avoid conflicts
export function assignAltitudes(drones: Drone[], conflicts: Conflict[]): Drone[] {
  // Copy the drones to avoid mutations
  const updatedDrones = [...drones];
  
  // Default altitude for all drones
  updatedDrones.forEach(drone => {
    if (drone.status === 'flying' && !drone.altitude) {
      drone.altitude = ALTITUDE_LEVELS.MEDIUM;
    }
  });
  
  // If there are conflicts, adjust altitudes
  if (conflicts.length > 0) {
    conflicts.forEach(conflict => {
      // Get the drones involved in this conflict
      const droneIndexA = updatedDrones.findIndex(d => d.id === conflict.droneIds[0]);
      const droneIndexB = updatedDrones.findIndex(d => d.id === conflict.droneIds[1]);
      
      if (droneIndexA !== -1 && droneIndexB !== -1) {
        // Assign different altitudes based on drone ID or priority
        updatedDrones[droneIndexA].altitude = ALTITUDE_LEVELS.LOW;
        updatedDrones[droneIndexB].altitude = ALTITUDE_LEVELS.HIGH;
      }
    });
  }
  
  return updatedDrones;
}

// Calculate more complex paths with altitude to avoid conflicts
export function calculateSafeFlightPath(
  drone: Drone,
  allDrones: Drone[],
  conflicts: Conflict[]
): { path: GridPosition[], altitude: number } {
  // Check if this drone is involved in any conflicts
  const droneConflicts = conflicts.filter(c => c.droneIds.includes(drone.id));
  
  if (droneConflicts.length === 0) {
    // No conflicts, use direct path at medium altitude
    return {
      path: calculateOptimalPath(drone.position, drone.targetPosition!),
      altitude: ALTITUDE_LEVELS.MEDIUM
    };
  }
  
  // With conflicts, choose an altitude based on conflict severity
  const maxSeverity = droneConflicts.reduce((max, conflict) => {
    if (conflict.severity === 'high') return 'high';
    if (conflict.severity === 'medium' && max !== 'high') return 'medium';
    return max;
  }, 'low' as 'low' | 'medium' | 'high');
  
  // More severe conflicts get higher altitudes
  let altitude = ALTITUDE_LEVELS.MEDIUM;
  if (maxSeverity === 'high') {
    altitude = drone.id % 2 === 0 ? ALTITUDE_LEVELS.VERY_HIGH : ALTITUDE_LEVELS.LOW;
  } else if (maxSeverity === 'medium') {
    altitude = drone.id % 2 === 0 ? ALTITUDE_LEVELS.HIGH : ALTITUDE_LEVELS.LOW;
  }
  
  return {
    path: calculateOptimalPath(drone.position, drone.targetPosition!),
    altitude
  };
}
