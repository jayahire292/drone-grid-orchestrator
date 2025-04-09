
import React from 'react';
import { DroneGrid } from '@/components/DroneGrid';
import { ControlPanel } from '@/components/ControlPanel';
import { FlightPathVisualizer } from '@/components/FlightPathVisualizer';
import { MetricsPanel } from '@/components/MetricsPanel';
import { SimulationControls } from '@/components/SimulationControls';
import { useDroneSystem } from '@/hooks/useDroneSystem';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AIRSPACE_STRUCTURE } from '@/utils/constants';

const Index = () => {
  const { 
    drones, 
    activeDrones, 
    metrics, 
    conflicts, 
    startFlight, 
    endFlight, 
    queueFlight,
    resetSystem,
    isSimulationRunning,
    startSimulation,
    pauseSimulation,
    simulationSpeed,
    setSimulationSpeed
  } = useDroneSystem();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">FlytBase Drone Coordination System</h1>
          <p className="text-sm opacity-80">Multi-Drone Testing Site - 4×4 Grid Dock Layout</p>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main visualization area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 h-[500px]">
              <h2 className="text-lg font-bold mb-4">Drone Grid Visualization</h2>
              <DroneGrid drones={drones} conflicts={conflicts} />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4">Flight Path Visualization</h2>
              <FlightPathVisualizer drones={activeDrones} />
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Airspace Structure
                </CardTitle>
                <CardDescription>
                  Vertical layering system for safe drone operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">Altitude Layers:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {AIRSPACE_STRUCTURE.layers.map(layer => (
                          <li key={layer.id}>
                            <strong>Layer {layer.id}:</strong> {layer.minAltitude}-{layer.maxAltitude}m - {layer.purpose}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Quadrants:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {AIRSPACE_STRUCTURE.quadrants.map(quadrant => (
                          <li key={quadrant.id}>
                            <strong>{quadrant.name}:</strong> Docks {quadrant.docks.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Even-numbered drones use Layer 3, odd-numbered drones use Layer 4 for horizontal transit.
                      Traffic follows one-way patterns within each quadrant with staggered takeoff/landing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Control and metrics panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4">Control Panel</h2>
              <ControlPanel 
                drones={drones} 
                startFlight={startFlight} 
                endFlight={endFlight}
                queueFlight={queueFlight}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4">Operational Metrics</h2>
              <MetricsPanel metrics={metrics} />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4">Simulation Controls</h2>
              <SimulationControls 
                resetSystem={resetSystem} 
                startSimulation={startSimulation}
                pauseSimulation={pauseSimulation}
                isSimulationRunning={isSimulationRunning}
                simulationSpeed={simulationSpeed}
                setSimulationSpeed={setSimulationSpeed}
              />
            </div>
            
            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning: Flight Path Conflicts</AlertTitle>
                <AlertDescription>
                  {conflicts.length} potential flight path conflicts detected. 
                  Automatic resolution in progress using:
                  <ul className="list-disc pl-5 mt-1">
                    {conflicts.map(conflict => (
                      <li key={conflict.id} className="text-sm">
                        Drones {conflict.droneIds.join(' & ')} - {conflict.resolution}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-800 text-white p-4 mt-6">
        <div className="container mx-auto text-sm opacity-80">
          &copy; 2025 FlytBase Testing Site Coordination System
        </div>
      </footer>
    </div>
  );
};

export default Index;
