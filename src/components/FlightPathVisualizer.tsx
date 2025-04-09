
import React, { useRef, useEffect } from 'react';
import { Drone } from '@/types/drone';
import { AIRSPACE_STRUCTURE } from '@/utils/constants';

interface FlightPathVisualizerProps {
  drones: Drone[];
}

export const FlightPathVisualizer: React.FC<FlightPathVisualizerProps> = ({ drones }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Constants for visualization
  const gridSize = 4;
  const scale = 40;
  const offset = { x: 180, y: 120 }; // Center the grid
  const layerOffset = 5; // Visual offset for altitude layers
  
  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the altitude layers (background)
    drawAltitudeLayers(ctx);
    
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
    
    // Draw quadrant separators (thicker lines)
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    
    // Vertical middle line
    ctx.beginPath();
    ctx.moveTo(offset.x + gridSize * scale / 2, offset.y);
    ctx.lineTo(offset.x + gridSize * scale / 2, offset.y + gridSize * scale);
    ctx.stroke();
    
    // Horizontal middle line
    ctx.beginPath();
    ctx.moveTo(offset.x, offset.y + gridSize * scale / 2);
    ctx.lineTo(offset.x + gridSize * scale, offset.y + gridSize * scale / 2);
    ctx.stroke();
    
    // Reset line width
    ctx.lineWidth = 1;
    
    // Draw quadrant labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    
    // Q1
    ctx.fillText('Q1', offset.x + gridSize * scale / 4 - 8, offset.y + gridSize * scale / 4 - 8);
    // Q2
    ctx.fillText('Q2', offset.x + gridSize * scale * 3/4 - 8, offset.y + gridSize * scale / 4 - 8);
    // Q3
    ctx.fillText('Q3', offset.x + gridSize * scale / 4 - 8, offset.y + gridSize * scale * 3/4 - 8);
    // Q4
    ctx.fillText('Q4', offset.x + gridSize * scale * 3/4 - 8, offset.y + gridSize * scale * 3/4 - 8);
    
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
      
      // Draw the path with altitude representation
      ctx.strokeStyle = droneColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const start = gridToCanvas(drone.position.x, drone.position.y);
      ctx.moveTo(start.x, start.y);
      
      // Draw path segments with visual altitude representation
      drone.flightPath.forEach((point, index) => {
        const canvasPoint = gridToCanvas(point.x, point.y);
        
        // Add a visual offset based on assigned layer
        const layerVisualOffset = drone.assignedLayer ? (drone.assignedLayer - 2) * layerOffset : 0;
        
        // Adjust y position based on "altitude"
        canvasPoint.y -= layerVisualOffset;
        
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
      
      // Visual altitude representation
      const droneAltOffset = drone.assignedLayer ? (drone.assignedLayer - 2) * layerOffset : 0;
      dronePos.y -= droneAltOffset;
      
      ctx.fillStyle = droneColor;
      ctx.beginPath();
      ctx.arc(dronePos.x, dronePos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw altitude indicator
      if (drone.assignedLayer) {
        ctx.fillStyle = '#fff';
        ctx.font = '8px Arial';
        ctx.fillText(
          `L${drone.assignedLayer}`, 
          dronePos.x - 5, 
          dronePos.y + 3
        );
      }
      
      // Label the drone
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.fillText(
        drone.name, 
        dronePos.x - 8, 
        dronePos.y - 10
      );
    });
    
  }, [drones]);
  
  // Draw altitude layers visualization
  const drawAltitudeLayers = (ctx: CanvasRenderingContext2D) => {
    const layerColors = [
      'rgba(255,200,200,0.2)', // Layer 1 - Takeoff/Landing
      'rgba(200,200,255,0.2)', // Layer 2 - Transition
      'rgba(200,255,200,0.2)', // Layer 3 - Primary Transit
      'rgba(255,255,200,0.2)', // Layer 4 - Secondary Transit
      'rgba(255,200,255,0.2)'  // Layer 5 - External
    ];
    
    // Only show layers 3 and 4 in the visualization area
    const layersToShow = AIRSPACE_STRUCTURE.layers.slice(2, 4);
    
    layersToShow.forEach((layer, index) => {
      const yOffset = (layer.id - 2) * layerOffset;
      
      // Draw a filled rectangle for this layer
      ctx.fillStyle = layerColors[layer.id - 1];
      ctx.fillRect(
        offset.x - 50, 
        offset.y - yOffset - layerOffset, 
        gridSize * scale + 100, 
        layerOffset * 2
      );
      
      // Draw the layer label
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(
        `Layer ${layer.id} (${layer.minAltitude}-${layer.maxAltitude}m)`, 
        offset.x - 50, 
        offset.y - yOffset
      );
    });
  };
  
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
