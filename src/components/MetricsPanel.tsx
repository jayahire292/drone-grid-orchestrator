
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Metrics } from '@/types/drone';

interface MetricsPanelProps {
  metrics: Metrics;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  const {
    activeFlights,
    queuedFlights,
    completedFlights,
    averageFlightTime,
    conflictsResolved,
    flightEfficiencyScore,
    safetyScore
  } = metrics;
  
  // Calculate the total flights
  const totalFlights = activeFlights + queuedFlights + completedFlights;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-xs text-gray-500">Active Flights</div>
          <div className="text-xl font-semibold">{activeFlights}</div>
        </div>
        
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-xs text-gray-500">Queued Flights</div>
          <div className="text-xl font-semibold">{queuedFlights}</div>
        </div>
        
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-xs text-gray-500">Completed Flights</div>
          <div className="text-xl font-semibold">{completedFlights}</div>
        </div>
        
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-xs text-gray-500">Avg. Flight Time</div>
          <div className="text-xl font-semibold">{averageFlightTime.toFixed(1)}s</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Safety Score</span>
            <span className={`text-sm font-medium ${
              safetyScore > 80 ? 'text-green-600' : 
              safetyScore > 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {safetyScore}%
            </span>
          </div>
          <Progress value={safetyScore} className={`
            ${safetyScore > 80 ? 'bg-green-100' : 
            safetyScore > 60 ? 'bg-yellow-100' : 'bg-red-100'}
          `} />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Efficiency Score</span>
            <span className={`text-sm font-medium ${
              flightEfficiencyScore > 80 ? 'text-green-600' : 
              flightEfficiencyScore > 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {flightEfficiencyScore}%
            </span>
          </div>
          <Progress value={flightEfficiencyScore} className={`
            ${flightEfficiencyScore > 80 ? 'bg-green-100' : 
            flightEfficiencyScore > 60 ? 'bg-yellow-100' : 'bg-red-100'}
          `} />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        <div>Total Flights: {totalFlights}</div>
        <div>Conflicts Resolved: {conflictsResolved}</div>
        <div className="mt-1">Updated in real-time</div>
      </div>
    </div>
  );
};
