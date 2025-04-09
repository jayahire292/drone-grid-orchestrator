
export interface Drone {
  id: number;
  name: string;
  status: DroneStatus;
  position: GridPosition;
  targetPosition?: TargetPosition;
  flightPath?: GridPosition[];
  altitude?: number;
  batteryLevel: number;
  queuedMission?: Mission;
}

export interface Mission {
  id: string;
  targetPosition: TargetPosition;
  priority: 'low' | 'medium' | 'high';
  status: 'queued' | 'in-progress' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
}

export type DroneStatus = 'idle' | 'preparing' | 'taking-off' | 'flying' | 'returning' | 'landing' | 'maintenance';

export interface GridPosition {
  x: number;
  y: number;
}

export interface TargetPosition {
  x: number;
  y: number;
  description?: string;
}

export interface Conflict {
  id: string;
  droneIds: number[];
  conflictPosition: GridPosition;
  severity: 'low' | 'medium' | 'high';
  timeToConflict: number; // in seconds
}

export interface Metrics {
  activeFlights: number;
  queuedFlights: number;
  completedFlights: number;
  averageFlightTime: number;
  conflictsResolved: number;
  flightEfficiencyScore: number;
  safetyScore: number;
}
