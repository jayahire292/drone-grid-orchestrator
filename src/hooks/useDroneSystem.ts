
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Drone, Conflict, Mission, GridPosition, Metrics, TargetPosition } from '@/types/drone';
import { checkPathConflicts, calculateOptimalPath } from '@/utils/pathfinding';
import { DEFAULT_DRONES } from '@/utils/constants';
import { toast } from "@/components/ui/use-toast";

export function useDroneSystem() {
  const [drones, setDrones] = useState<Drone[]>(DEFAULT_DRONES);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    activeFlights: 0,
    queuedFlights: 0,
    completedFlights: 0,
    averageFlightTime: 0,
    conflictsResolved: 0,
    flightEfficiencyScore: 90,
    safetyScore: 100
  });

  // Calculate active drones (those that are flying)
  const activeDrones = drones.filter(
    drone => ['taking-off', 'flying', 'returning'].includes(drone.status)
  );

  // Update metrics based on drone statuses
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      activeFlights: activeDrones.length,
      queuedFlights: drones.filter(d => d.queuedMission).length,
    }));
  }, [drones, activeDrones.length]);

  // Check for conflicts every time drone positions change
  useEffect(() => {
    if (activeDrones.length > 1) {
      const detectedConflicts = checkPathConflicts(activeDrones);
      setConflicts(detectedConflicts);
      
      // Update safety score based on conflicts
      setMetrics(prev => ({
        ...prev,
        safetyScore: Math.max(50, 100 - detectedConflicts.length * 10)
      }));
    } else {
      setConflicts([]);
    }
  }, [activeDrones]);

  // Start a flight for a specific drone
  const startFlight = useCallback((droneId: number, target: TargetPosition, priority: 'low' | 'medium' | 'high' = 'medium') => {
    setDrones(prevDrones => {
      // Find the drone
      const droneIndex = prevDrones.findIndex(d => d.id === droneId);
      if (droneIndex === -1) return prevDrones;
      
      const drone = prevDrones[droneIndex];
      
      // Check if drone is available
      if (drone.status !== 'idle') {
        toast({
          title: "Drone unavailable",
          description: `Drone ${drone.name} is currently ${drone.status}`,
          variant: "destructive"
        });
        return prevDrones;
      }

      // Calculate flight path
      const flightPath = calculateOptimalPath(drone.position, target);
      
      // Create a new mission
      const mission: Mission = {
        id: uuidv4(),
        targetPosition: target,
        priority,
        status: 'in-progress',
        startTime: Date.now()
      };

      // Update the drone
      const updatedDrone: Drone = {
        ...drone,
        status: 'taking-off',
        targetPosition: target,
        flightPath,
        queuedMission: undefined
      };

      // Update drones array
      const newDrones = [...prevDrones];
      newDrones[droneIndex] = updatedDrone;
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        activeFlights: prev.activeFlights + 1,
        flightEfficiencyScore: Math.max(50, prev.flightEfficiencyScore - 2)
      }));

      toast({
        title: "Flight started",
        description: `Drone ${drone.name} is taking off to target location`
      });
      
      return newDrones;
    });
  }, []);

  // Queue a flight for later execution
  const queueFlight = useCallback((droneId: number, target: TargetPosition, priority: 'low' | 'medium' | 'high' = 'medium') => {
    setDrones(prevDrones => {
      const droneIndex = prevDrones.findIndex(d => d.id === droneId);
      if (droneIndex === -1) return prevDrones;
      
      const drone = prevDrones[droneIndex];
      
      // Create a new mission
      const mission: Mission = {
        id: uuidv4(),
        targetPosition: target,
        priority,
        status: 'queued'
      };

      // Update the drone
      const updatedDrone: Drone = {
        ...drone,
        queuedMission: mission
      };

      // Update drones array
      const newDrones = [...prevDrones];
      newDrones[droneIndex] = updatedDrone;
      
      toast({
        title: "Flight queued",
        description: `Mission for drone ${drone.name} has been queued`
      });
      
      return newDrones;
    });
    
    setMetrics(prev => ({
      ...prev,
      queuedFlights: prev.queuedFlights + 1
    }));
  }, []);

  // End a flight for a specific drone
  const endFlight = useCallback((droneId: number) => {
    setDrones(prevDrones => {
      // Find the drone
      const droneIndex = prevDrones.findIndex(d => d.id === droneId);
      if (droneIndex === -1) return prevDrones;
      
      const drone = prevDrones[droneIndex];
      
      // Check if drone is flying
      if (!['taking-off', 'flying', 'returning'].includes(drone.status)) {
        return prevDrones;
      }

      // Update the drone
      const updatedDrone: Drone = {
        ...drone,
        status: 'landing',
        targetPosition: undefined,
        flightPath: undefined
      };

      // Update drones array
      const newDrones = [...prevDrones];
      newDrones[droneIndex] = updatedDrone;
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        activeFlights: prev.activeFlights - 1,
        completedFlights: prev.completedFlights + 1,
        averageFlightTime: prev.completedFlights === 0 
          ? 60 
          : (prev.averageFlightTime * prev.completedFlights + 60) / (prev.completedFlights + 1)
      }));
      
      toast({
        title: "Flight completed",
        description: `Drone ${drone.name} has landed safely`
      });
      
      return newDrones;
    });
  }, []);

  // Reset the entire system
  const resetSystem = useCallback(() => {
    setDrones(DEFAULT_DRONES);
    setConflicts([]);
    setMetrics({
      activeFlights: 0,
      queuedFlights: 0,
      completedFlights: 0,
      averageFlightTime: 0,
      conflictsResolved: 0,
      flightEfficiencyScore: 90,
      safetyScore: 100
    });
    
    toast({
      title: "System reset",
      description: "All drones and metrics have been reset to default values"
    });
  }, []);

  return {
    drones,
    activeDrones,
    conflicts,
    metrics,
    startFlight,
    endFlight,
    queueFlight,
    resetSystem
  };
}
