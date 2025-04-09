
import { Drone } from '@/types/drone';

// Define the initial drones in the 4x4 grid
export const DEFAULT_DRONES: Drone[] = [
  // Row 1
  { id: 1, name: 'D1', status: 'idle', position: { x: 0, y: 0 }, batteryLevel: 100 },
  { id: 2, name: 'D2', status: 'idle', position: { x: 1, y: 0 }, batteryLevel: 100 },
  { id: 3, name: 'D3', status: 'idle', position: { x: 2, y: 0 }, batteryLevel: 100 },
  { id: 4, name: 'D4', status: 'idle', position: { x: 3, y: 0 }, batteryLevel: 100 },
  
  // Row 2
  { id: 5, name: 'D5', status: 'idle', position: { x: 0, y: 1 }, batteryLevel: 100 },
  { id: 6, name: 'D6', status: 'idle', position: { x: 1, y: 1 }, batteryLevel: 100 },
  { id: 7, name: 'D7', status: 'idle', position: { x: 2, y: 1 }, batteryLevel: 100 },
  { id: 8, name: 'D8', status: 'idle', position: { x: 3, y: 1 }, batteryLevel: 100 },
  
  // Row 3
  { id: 9, name: 'D9', status: 'idle', position: { x: 0, y: 2 }, batteryLevel: 100 },
  { id: 10, name: 'D10', status: 'idle', position: { x: 1, y: 2 }, batteryLevel: 100 },
  { id: 11, name: 'D11', status: 'idle', position: { x: 2, y: 2 }, batteryLevel: 100 },
  { id: 12, name: 'D12', status: 'idle', position: { x: 3, y: 2 }, batteryLevel: 100 },
  
  // Row 4
  { id: 13, name: 'D13', status: 'idle', position: { x: 0, y: 3 }, batteryLevel: 100 },
  { id: 14, name: 'D14', status: 'idle', position: { x: 1, y: 3 }, batteryLevel: 100 },
  { id: 15, name: 'D15', status: 'idle', position: { x: 2, y: 3 }, batteryLevel: 100 },
  { id: 16, name: 'D16', status: 'idle', position: { x: 3, y: 3 }, batteryLevel: 100 },
];

export const ALTITUDE_LEVELS = {
  LOW: 10,
  MEDIUM: 15,
  HIGH: 20,
  VERY_HIGH: 25
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
  'flying': 'bg-green-400',
  'returning': 'bg-teal-400',
  'landing': 'bg-purple-200',
  'maintenance': 'bg-red-200'
};
