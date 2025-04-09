
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Metrics } from '@/types/drone';
import { 
  Shield, 
  BarChart, 
  Clock, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';

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
    conflictsDetected,
    flightEfficiencyScore,
    safetyScore,
    throughputRate,
    waitTimeAverage
  } = metrics;
  
  // Calculate the total flights
  const totalFlights = activeFlights + queuedFlights + completedFlights;
  
  // Calculate conflict resolution rate
  const conflictResolutionRate = conflictsDetected > 0 
    ? Math.round((conflictsResolved / conflictsDetected) * 100) 
    : 100;
  
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
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1 items-center">
            <span className="text-sm flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Safety Score
            </span>
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
          <div className="flex justify-between mb-1 items-center">
            <span className="text-sm flex items-center">
              <BarChart className="h-4 w-4 mr-1" />
              Efficiency Score
            </span>
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
        
        <div>
          <div className="flex justify-between mb-1 items-center">
            <span className="text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Conflict Resolution
            </span>
            <span className={`text-sm font-medium ${
              conflictResolutionRate > 90 ? 'text-green-600' : 
              conflictResolutionRate > 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {conflictResolutionRate}%
            </span>
          </div>
          <Progress value={conflictResolutionRate} className={`
            ${conflictResolutionRate > 90 ? 'bg-green-100' : 
            conflictResolutionRate > 70 ? 'bg-yellow-100' : 'bg-red-100'}
          `} />
        </div>
      </div>
      
      <div className="border-t pt-3 mt-2">
        <h3 className="text-sm font-semibold mb-2 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Operational KPIs
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-gray-500">Throughput Rate:</span>
            <span className="float-right font-medium">{throughputRate.toFixed(1)}/hr</span>
          </div>
          <div>
            <span className="text-gray-500">Wait Time Avg:</span>
            <span className="float-right font-medium">{waitTimeAverage.toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-gray-500">Total Flights:</span>
            <span className="float-right font-medium">{totalFlights}</span>
          </div>
          <div>
            <span className="text-gray-500">Conflicts:</span>
            <span className="float-right font-medium">
              {conflictsDetected} <span className="text-gray-400">({conflictsResolved} resolved)</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center">
        <AlertTriangle className="h-3 w-3 mr-1" />
        <span>Metrics updated in real-time during simulation</span>
      </div>
    </div>
  );
};
