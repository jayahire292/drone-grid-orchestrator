
import React, { useState, useEffect } from 'react';
import { DroneGrid } from '@/components/DroneGrid';
import { ControlPanel } from '@/components/ControlPanel';
import { FlightPathVisualizer } from '@/components/FlightPathVisualizer';
import { MetricsPanel } from '@/components/MetricsPanel';
import { SimulationControls } from '@/components/SimulationControls';
import { useDroneSystem } from '@/hooks/useDroneSystem';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const { 
    drones, 
    activeDrones, 
    metrics, 
    conflicts, 
    startFlight, 
    endFlight, 
    queueFlight,
    resetSystem 
  } = useDroneSystem();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Drone Grid Orchestrator</h1>
          <p className="text-sm opacity-80">FlytBase Testing Site Coordination System</p>
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
              <SimulationControls resetSystem={resetSystem} />
            </div>
            
            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  {conflicts.length} potential flight path conflicts detected. 
                  Check the visualization for details.
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
