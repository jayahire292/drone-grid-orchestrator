
import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Drone, Conflict, Mission, TargetPosition, Metrics } from '@/types/drone';
import { checkPathConflicts, calculateOptimalPath } from '@/utils/pathfinding';
import { 
  detectConflicts, 
  resolveConflicts, 
  assignAltitudeLayer, 
  determineQuadrant,
  createFlightPlan
} from '@/utils/flightCoordination';
import { DEFAULT_DRONES, ALTITUDE_LEVELS } from '@/utils/constants';
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
    conflictsDetected: 0,
    flightEfficiencyScore: 90,
    safetyScore: 100,
    throughputRate: 0,
    waitTimeAverage: 0
  });
  
  // Simulation state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const simulationInterval = useRef<number | null>(null);
  const startTime = useRef<number>(Date.now());
  const flightsStarted = useRef<number>(0);

  // Calculate active drones (those that are flying)
  const activeDrones = drones.filter(
    drone => ['taking-off', 'transition-up', 'flying', 'transition-down', 'returning', 'landing'].includes(drone.status)
  );

  // Update metrics based on drone statuses
  useEffect(() => {
    const currentTime = Date.now();
    const elapsedHours = (currentTime - startTime.current) / (1000 * 60 * 60);
    
    setMetrics(prev => ({
      ...prev,
      activeFlights: activeDrones.length,
      queuedFlights: drones.filter(d => d.queuedMission).length,
      throughputRate: elapsedHours > 0 ? flightsStarted.current / elapsedHours : 0
    }));
  }, [drones, activeDrones.length]);

  // Check for conflicts every time drone positions change
  useEffect(() => {
    if (activeDrones.length > 1) {
      const detectedConflicts = detectConflicts(activeDrones);
      setConflicts(detectedConflicts);
      
      // Update conflict metrics
      if (detectedConflicts.length > 0) {
        setMetrics(prev => ({
          ...prev,
          conflictsDetected: prev.conflictsDetected + detectedConflicts.length,
          safetyScore: Math.max(50, 100 - detectedConflicts.length * 10)
        }));
        
        // Resolve the conflicts
        const updatedDrones = resolveConflicts(drones, detectedConflicts);
        setDrones(updatedDrones);
        
        // Update resolution metrics
        setMetrics(prev => ({
          ...prev,
          conflictsResolved: prev.conflictsResolved + detectedConflicts.length
        }));
      }
    } else {
      setConflicts([]);
    }
  }, [activeDrones, drones]);

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

      // Assign appropriate altitude layer based on drone ID
      const assignedLayer = assignAltitudeLayer(drone);
      
      // Calculate flight path
      const flightPath = createFlightPlan(drone, target);
      
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
        assignedLayer,
        queuedMission: undefined
      };

      // Update drones array
      const newDrones = [...prevDrones];
      newDrones[droneIndex] = updatedDrone;
      
      // Update metrics
      flightsStarted.current += 1;
      
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
      if (!['taking-off', 'transition-up', 'flying', 'transition-down', 'returning', 'landing'].includes(drone.status)) {
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
      const flightDuration = drone.queuedMission?.startTime 
        ? (Date.now() - drone.queuedMission.startTime) / 1000 
        : 60;
      
      setMetrics(prev => ({
        ...prev,
        activeFlights: prev.activeFlights - 1,
        completedFlights: prev.completedFlights + 1,
        averageFlightTime: prev.completedFlights === 0 
          ? flightDuration
          : (prev.averageFlightTime * prev.completedFlights + flightDuration) / (prev.completedFlights + 1)
      }));
      
      toast({
        title: "Flight completed",
        description: `Drone ${drone.name} has landed safely`
      });
      
      return newDrones;
    });
  }, []);

  // Start the simulation
  const startSimulation = useCallback(() => {
    if (isSimulationRunning) return;
    
    setIsSimulationRunning(true);
    startTime.current = Date.now();
    
    // Run simulation at the appropriate speed
    const interval = window.setInterval(() => {
      // This would include logic to update drone positions along their paths
      // For now we'll just make random flight changes to demonstrate the system
      
      // Probability to trigger a new flight
      if (Math.random() < 0.1 * simulationSpeed) {
        // Find an idle drone
        const idleDrones = drones.filter(d => d.status === 'idle');
        if (idleDrones.length > 0) {
          const randomDroneIndex = Math.floor(Math.random() * idleDrones.length);
          const drone = idleDrones[randomDroneIndex];
          
          // Select a random target
          const randomTargetIndex = Math.floor(Math.random() * 8);
          const target = {
            x: Math.floor(Math.random() * 10) - 5,
            y: Math.floor(Math.random() * 10) - 5,
            description: `Random Target ${randomTargetIndex}`
          };
          
          // Start flight
          startFlight(drone.id, target);
        }
      }
      
      // Probability to end a flight
      if (Math.random() < 0.05 * simulationSpeed) {
        const flyingDrones = drones.filter(d => d.status === 'flying');
        if (flyingDrones.length > 0) {
          const randomDroneIndex = Math.floor(Math.random() * flyingDrones.length);
          const drone = flyingDrones[randomDroneIndex];
          
          // End flight
          endFlight(drone.id);
        }
      }
      
    }, 1000 / simulationSpeed);
    
    simulationInterval.current = interval;
    
    toast({
      title: "Simulation started",
      description: `Running at ${simulationSpeed}x speed`
    });
    
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [drones, endFlight, isSimulationRunning, simulationSpeed, startFlight]);

  // Pause the simulation
  const pauseSimulation = useCallback(() => {
    if (!isSimulationRunning) return;
    
    setIsSimulationRunning(false);
    
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    
    toast({
      title: "Simulation paused",
      description: "Resume to continue flight operations"
    });
  }, [isSimulationRunning]);

  // Reset the entire system
  const resetSystem = useCallback(() => {
    pauseSimulation();
    
    setDrones(DEFAULT_DRONES);
    setConflicts([]);
    setMetrics({
      activeFlights: 0,
      queuedFlights: 0,
      completedFlights: 0,
      averageFlightTime: 0,
      conflictsResolved: 0,
      conflictsDetected: 0,
      flightEfficiencyScore: 90,
      safetyScore: 100,
      throughputRate: 0,
      waitTimeAverage: 0
    });
    
    flightsStarted.current = 0;
    startTime.current = Date.now();
    
    toast({
      title: "System reset",
      description: "All drones and metrics have been reset to default values"
    });
  }, [pauseSimulation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  return {
    drones,
    activeDrones,
    conflicts,
    metrics,
    startFlight,
    endFlight,
    queueFlight,
    resetSystem,
    isSimulationRunning,
    startSimulation,
    pauseSimulation,
    simulationSpeed,
    setSimulationSpeed
  };
}
