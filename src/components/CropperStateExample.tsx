import React from 'react';
import { useCropperState, cropperActions } from '../utils';

/**
 * Example component demonstrating the cropper state management system
 */
export const CropperStateExample: React.FC = () => {
  const { state, dispatch, canUndo, canRedo } = useCropperState({
    position: { x: 50, y: 50 },
    scale: 1.5,
    rotation: 0,
    cropBoundaries: { x: 10, y: 10, width: 200, height: 150 }
  });

  const handlePositionChange = (x: number, y: number) => {
    dispatch(cropperActions.updatePosition(x, y));
  };

  const handleScaleChange = (scale: number) => {
    dispatch(cropperActions.updateScale(scale));
  };

  const handleRotationChange = (rotation: number) => {
    dispatch(cropperActions.updateRotation(rotation));
  };

  const handleCropBoundariesChange = (width: number, height: number) => {
    dispatch(cropperActions.updateCropBoundaries({
      ...state.cropBoundaries,
      width,
      height
    }));
  };

  const handleUndo = () => {
    if (canUndo) {
      dispatch(cropperActions.undo());
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      dispatch(cropperActions.redo());
    }
  };

  const handleResetHistory = () => {
    dispatch(cropperActions.resetHistory());
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Cropper State Management Example</h2>
      
      {/* Current State Display */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Current State</h3>
        <p><strong>Position:</strong> x: {state.position.x}, y: {state.position.y}</p>
        <p><strong>Scale:</strong> {state.scale.toFixed(2)}</p>
        <p><strong>Rotation:</strong> {state.rotation}°</p>
        <p><strong>Crop Boundaries:</strong> x: {state.cropBoundaries.x}, y: {state.cropBoundaries.y}, w: {state.cropBoundaries.width}, h: {state.cropBoundaries.height}</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        
        {/* Position Controls */}
        <div>
          <h4>Position</h4>
          <label>
            X: 
            <input
              type="range"
              min="0"
              max="200"
              value={state.position.x}
              onChange={(e) => handlePositionChange(Number(e.target.value), state.position.y)}
              style={{ width: '100%' }}
            />
            <span>{state.position.x}</span>
          </label>
          <label>
            Y: 
            <input
              type="range"
              min="0"
              max="200"
              value={state.position.y}
              onChange={(e) => handlePositionChange(state.position.x, Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{state.position.y}</span>
          </label>
        </div>

        {/* Scale Control */}
        <div>
          <h4>Scale</h4>
          <label>
            Scale: 
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={state.scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{state.scale.toFixed(1)}</span>
          </label>
        </div>

        {/* Rotation Control */}
        <div>
          <h4>Rotation</h4>
          <label>
            Rotation: 
            <input
              type="range"
              min="0"
              max="360"
              value={state.rotation}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{state.rotation}°</span>
          </label>
        </div>

        {/* Crop Boundaries Controls */}
        <div>
          <h4>Crop Size</h4>
          <label>
            Width: 
            <input
              type="range"
              min="50"
              max="400"
              value={state.cropBoundaries.width}
              onChange={(e) => handleCropBoundariesChange(Number(e.target.value), state.cropBoundaries.height)}
              style={{ width: '100%' }}
            />
            <span>{state.cropBoundaries.width}</span>
          </label>
          <label>
            Height: 
            <input
              type="range"
              min="50"
              max="300"
              value={state.cropBoundaries.height}
              onChange={(e) => handleCropBoundariesChange(state.cropBoundaries.width, Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{state.cropBoundaries.height}</span>
          </label>
        </div>
      </div>

      {/* Undo/Redo Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h4>History Controls</h4>
        <button 
          onClick={handleUndo} 
          disabled={!canUndo}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Undo {!canUndo && '(disabled)'}
        </button>
        <button 
          onClick={handleRedo} 
          disabled={!canRedo}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Redo {!canRedo && '(disabled)'}
        </button>
        <button 
          onClick={handleResetHistory}
          style={{ padding: '8px 16px' }}
        >
          Reset History
        </button>
      </div>

      {/* Visual Representation */}
      <div style={{ marginTop: '20px' }}>
        <h4>Visual Representation</h4>
        <svg 
          width="400" 
          height="300" 
          style={{ border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}
        >
          {/* Crop boundaries */}
          <rect
            x={state.cropBoundaries.x}
            y={state.cropBoundaries.y}
            width={state.cropBoundaries.width}
            height={state.cropBoundaries.height}
            fill="rgba(0, 100, 200, 0.3)"
            stroke="rgba(0, 100, 200, 0.8)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Position indicator */}
          <circle
            cx={state.position.x}
            cy={state.position.y}
            r={5 * state.scale}
            fill="red"
            opacity="0.8"
          />
          
          {/* Rotation indicator line */}
          <line
            x1={state.position.x}
            y1={state.position.y}
            x2={state.position.x + Math.cos(state.rotation * Math.PI / 180) * 30 * state.scale}
            y2={state.position.y + Math.sin(state.rotation * Math.PI / 180) * 30 * state.scale}
            stroke="red"
            strokeWidth="2"
          />
          
          {/* Labels */}
          <text x="10" y="20" fontSize="12" fill="#666">
            Red circle: Position (scale affects size)
          </text>
          <text x="10" y="35" fontSize="12" fill="#666">
            Red line: Rotation direction
          </text>
          <text x="10" y="50" fontSize="12" fill="#666">
            Blue area: Crop boundaries
          </text>
        </svg>
      </div>
    </div>
  );
};