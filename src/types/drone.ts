
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
  assignedLayer?: number;  // Altitude layer assignment (1-5)
  quadrant?: number;       // Grid quadrant (1-4)
}

export interface Mission {
  id: string;
  targetPosition: TargetPosition;
  priority: 'low' | 'medium' | 'high';
  status: 'queued' | 'in-progress' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
}

export type DroneStatus = 
  'idle' | 
  'preparing' | 
  'taking-off' | 
  'transition-up' | 
  'flying' | 
  'transition-down' | 
  'returning' | 
  'landing' | 
  'emergency' | 
  'maintenance';

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
  resolution?: 'altitude-change' | 'path-reroute' | 'time-delay' | 'emergency-stop';
}

export interface Metrics {
  activeFlights: number;
  queuedFlights: number;
  completedFlights: number;
  averageFlightTime: number;
  conflictsResolved: number;
  conflictsDetected: number;
  flightEfficiencyScore: number;
  safetyScore: number;
  throughputRate: number; // flights per hour
  waitTimeAverage: number; // seconds
}

export interface AirspaceStructure {
  layers: {
    id: number;
    name: string;
    minAltitude: number;
    maxAltitude: number;
    purpose: string;
  }[];
  quadrants: {
    id: number;
    name: string;
    docks: number[];
  }[];
}
