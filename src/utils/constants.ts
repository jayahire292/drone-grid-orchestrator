
import { Drone, AirspaceStructure } from '@/types/drone';

// Define the initial drones in the 4x4 grid
export const DEFAULT_DRONES: Drone[] = [
  // Row 1
  { id: 1, name: 'D1', status: 'idle', position: { x: 0, y: 0 }, batteryLevel: 100, quadrant: 1, assignedLayer: 4 },
  { id: 2, name: 'D2', status: 'idle', position: { x: 1, y: 0 }, batteryLevel: 100, quadrant: 1, assignedLayer: 3 },
  { id: 3, name: 'D3', status: 'idle', position: { x: 2, y: 0 }, batteryLevel: 100, quadrant: 2, assignedLayer: 4 },
  { id: 4, name: 'D4', status: 'idle', position: { x: 3, y: 0 }, batteryLevel: 100, quadrant: 2, assignedLayer: 3 },
  
  // Row 2
  { id: 5, name: 'D5', status: 'idle', position: { x: 0, y: 1 }, batteryLevel: 100, quadrant: 1, assignedLayer: 4 },
  { id: 6, name: 'D6', status: 'idle', position: { x: 1, y: 1 }, batteryLevel: 100, quadrant: 1, assignedLayer: 3 },
  { id: 7, name: 'D7', status: 'idle', position: { x: 2, y: 1 }, batteryLevel: 100, quadrant: 2, assignedLayer: 4 },
  { id: 8, name: 'D8', status: 'idle', position: { x: 3, y: 1 }, batteryLevel: 100, quadrant: 2, assignedLayer: 3 },
  
  // Row 3
  { id: 9, name: 'D9', status: 'idle', position: { x: 0, y: 2 }, batteryLevel: 100, quadrant: 3, assignedLayer: 4 },
  { id: 10, name: 'D10', status: 'idle', position: { x: 1, y: 2 }, batteryLevel: 100, quadrant: 3, assignedLayer: 3 },
  { id: 11, name: 'D11', status: 'idle', position: { x: 2, y: 2 }, batteryLevel: 100, quadrant: 4, assignedLayer: 4 },
  { id: 12, name: 'D12', status: 'idle', position: { x: 3, y: 2 }, batteryLevel: 100, quadrant: 4, assignedLayer: 3 },
  
  // Row 4
  { id: 13, name: 'D13', status: 'idle', position: { x: 0, y: 3 }, batteryLevel: 100, quadrant: 3, assignedLayer: 4 },
  { id: 14, name: 'D14', status: 'idle', position: { x: 1, y: 3 }, batteryLevel: 100, quadrant: 3, assignedLayer: 3 },
  { id: 15, name: 'D15', status: 'idle', position: { x: 2, y: 3 }, batteryLevel: 100, quadrant: 4, assignedLayer: 4 },
  { id: 16, name: 'D16', status: 'idle', position: { x: 3, y: 3 }, batteryLevel: 100, quadrant: 4, assignedLayer: 3 },
];

export const ALTITUDE_LEVELS = {
  TAKEOFF_LANDING: 1, // 0-2m: Reserved for takeoff/landing operations only
  TRANSITION: 2,      // 2-4m: Transition layer for ascending/descending
  PRIMARY_TRANSIT: 3, // 4-6m: Primary horizontal transit layer
  SECONDARY_TRANSIT: 4, // 6-8m: Secondary horizontal transit layer
  EXTERNAL: 5         // 8m+: External operations layer
};

export const AIRSPACE_STRUCTURE: AirspaceStructure = {
  layers: [
    { id: 1, name: "Takeoff/Landing", minAltitude: 0, maxAltitude: 2, purpose: "Vertical operations only" },
    { id: 2, name: "Transition", minAltitude: 2, maxAltitude: 4, purpose: "Ascending/descending" },
    { id: 3, name: "Primary Transit", minAltitude: 4, maxAltitude: 6, purpose: "Even-numbered drones" },
    { id: 4, name: "Secondary Transit", minAltitude: 6, maxAltitude: 8, purpose: "Odd-numbered drones" },
    { id: 5, name: "External Ops", minAltitude: 8, maxAltitude: 20, purpose: "Beyond grid operations" }
  ],
  quadrants: [
    { id: 1, name: "Q1", docks: [1, 2, 5, 6] },
    { id: 2, name: "Q2", docks: [3, 4, 7, 8] },
    { id: 3, name: "Q3", docks: [9, 10, 13, 14] },
    { id: 4, name: "Q4", docks: [11, 12, 15, 16] }
  ]
};

export const GRID_SIZE = 4;

export const POTENTIAL_TARGETS = [
  { x: -2, y: -2, description: "North West Zone" },
  { x: 1, y: -3, description: "North Zone" },
  { x: 5, y: -1, description: "North East Zone" },
  { x: -3, y: 2, description: "West Zone" },
  { x: 6, y: 2, description: "East Zone" },
  { x: -2, y: 5, description: "South West Zone" },
  { x: 2, y: 6, description: "South Zone" },
  { x: 5, y: 5, description: "South East Zone" }
];

export const DRONE_STATUS_COLORS = {
  'idle': 'bg-gray-200',
  'preparing': 'bg-blue-200',
  'taking-off': 'bg-yellow-200',
  'transition-up': 'bg-orange-200',
  'flying': 'bg-green-400',
  'transition-down': 'bg-teal-200',
  'returning': 'bg-teal-400',
  'landing': 'bg-purple-200',
  'emergency': 'bg-red-400',
  'maintenance': 'bg-red-200'
};
