
import React, { useRef, useEffect } from 'react';
import { Drone } from '@/types/drone';

interface FlightPathVisualizerProps {
  drones: Drone[];
}

export const FlightPathVisualizer: React.FC<FlightPathVisualizerProps> = ({ drones }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Constants for visualization
  const gridSize = 4;
  const scale = 40;
  const offset = { x: 180, y: 120 }; // Center the grid
  
  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the grid border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      offset.x, 
      offset.y, 
      gridSize * scale, 
      gridSize * scale
    );
    
    // Draw grid lines
    for (let i = 1; i < gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(offset.x + i * scale, offset.y);
      ctx.lineTo(offset.x + i * scale, offset.y + gridSize * scale);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(offset.x, offset.y + i * scale);
      ctx.lineTo(offset.x + gridSize * scale, offset.y + i * scale);
      ctx.stroke();
    }
    
    // Draw dock labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const dockId = y * gridSize + x + 1;
        ctx.fillText(
          `D${dockId}`, 
          offset.x + x * scale + scale/2 - 8, 
          offset.y + y * scale + scale/2 + 4
        );
      }
    }
    
    // Convert grid coordinates to canvas coordinates
    const gridToCanvas = (x: number, y: number) => ({
      x: offset.x + x * scale + scale/2,
      y: offset.y + y * scale + scale/2
    });
    
    // Draw the flight paths
    drones.forEach(drone => {
      if (!drone.flightPath || !drone.targetPosition) return;
      
      const droneColor = getColorForDrone(drone.id);
      
      // Draw the path
      ctx.strokeStyle = droneColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const start = gridToCanvas(drone.position.x, drone.position.y);
      ctx.moveTo(start.x, start.y);
      
      // Draw path segments
      drone.flightPath.forEach(point => {
        const canvasPoint = gridToCanvas(point.x, point.y);
        ctx.lineTo(canvasPoint.x, canvasPoint.y);
      });
      
      // Connect to target
      const targetX = offset.x + drone.targetPosition.x * scale + scale/2;
      const targetY = offset.y + drone.targetPosition.y * scale + scale/2;
      ctx.lineTo(targetX, targetY);
      
      ctx.stroke();
      
      // Draw the target
      ctx.fillStyle = droneColor;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Label the target
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.fillText(
        `Target ${drone.name}`, 
        targetX + 8, 
        targetY + 4
      );
      
      // Draw the drone
      const dronePos = gridToCanvas(drone.position.x, drone.position.y);
      ctx.fillStyle = droneColor;
      ctx.beginPath();
      ctx.arc(dronePos.x, dronePos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Label the drone
      ctx.fillStyle = '#fff';
      ctx.font = '8px Arial';
      ctx.fillText(
        drone.name, 
        dronePos.x - 5, 
        dronePos.y + 3
      );
    });
    
  }, [drones]);
  
  // Generate a color based on drone ID
  const getColorForDrone = (id: number) => {
    const colors = [
      '#3498db', // Blue
      '#e74c3c', // Red
      '#2ecc71', // Green
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#34495e', // Dark Blue
      '#d35400'  // Dark Orange
    ];
    
    return colors[(id - 1) % colors.length];
  };
  
  return (
    <div className="w-full h-[250px] flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        width={400}
        height={250}
        className="border border-gray-200 rounded"
      />
    </div>
  );
};
