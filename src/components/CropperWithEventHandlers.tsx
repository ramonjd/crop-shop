import React, { useRef, useEffect } from 'react';
import { useCropperEventManagers } from '../utils/EventManagerIntegration';

// These would typically be imported from your existing state management
interface CropperState {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  cropBoundaries: { x: number; y: number; width: number; height: number };
}

interface CropperStateHook {
  state: CropperState;
  dispatch: (action: any) => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface CropperWithEventHandlersProps {
  cropperStateHook: CropperStateHook;
  imageUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  enableTouch?: boolean;
  enableKeyboard?: boolean;
  moveStep?: number;
  zoomStep?: number;
  rotationStep?: number;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
}

export const CropperWithEventHandlers: React.FC<CropperWithEventHandlersProps> = ({
  cropperStateHook,
  imageUrl,
  width = 400,
  height = 400,
  className = '',
  enableTouch = true,
  enableKeyboard = true,
  moveStep = 10,
  zoomStep = 0.1,
  rotationStep = 15,
  onGestureStart,
  onGestureEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { state } = cropperStateHook;

  const {
    touchManager,
    keyboardManager,
    updateTouchConfig,
    updateKeyboardConfig,
    getActiveTouches,
    isGestureActive,
    getKeyBindings,
    isReady,
  } = useCropperEventManagers(containerRef.current, cropperStateHook, {
    moveStep,
    zoomStep,
    rotationStep,
    touchConfig: {
      enablePan: enableTouch,
      enablePinch: enableTouch,
      enableRotation: enableTouch,
    },
    keyboardConfig: {
      preventDefaults: enableKeyboard,
    },
  });

  // Handle gesture start/end callbacks
  useEffect(() => {
    let wasActive = false;
    
    const checkGestureState = () => {
      const isActive = isGestureActive();
      
      if (isActive && !wasActive && onGestureStart) {
        onGestureStart();
      } else if (!isActive && wasActive && onGestureEnd) {
        onGestureEnd();
      }
      
      wasActive = isActive;
    };

    const interval = setInterval(checkGestureState, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [isGestureActive, onGestureStart, onGestureEnd]);

  // Update manager configs when props change
  useEffect(() => {
    if (enableTouch) {
      updateTouchConfig({
        enablePan: enableTouch,
        enablePinch: enableTouch,
        enableRotation: enableTouch,
      });
    }
  }, [enableTouch, updateTouchConfig]);

  useEffect(() => {
    updateKeyboardConfig({
      preventDefaults: enableKeyboard,
    });
  }, [enableKeyboard, updateKeyboardConfig]);

  const getImageTransform = () => {
    const { position, scale, rotation } = state;
    return `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`;
  };

  const getCropOverlayStyle = () => {
    const { cropBoundaries } = state;
    return {
      position: 'absolute' as const,
      left: cropBoundaries.x,
      top: cropBoundaries.y,
      width: cropBoundaries.width,
      height: cropBoundaries.height,
      border: '2px solid #fff',
      borderRadius: '4px',
      pointerEvents: 'none' as const,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    };
  };

  const keyBindings = getKeyBindings();
  const activeTouches = getActiveTouches();

  return (
    <div className={`cropper-container ${className}`}>
      <div
        ref={containerRef}
        className="cropper-viewport"
        style={{
          position: 'relative',
          width,
          height,
          overflow: 'hidden',
          border: '1px solid #ccc',
          borderRadius: '8px',
          cursor: isGestureActive() ? 'grabbing' : 'grab',
          touchAction: 'none', // Prevent default browser touch behaviors
        }}
        tabIndex={0} // Make focusable for keyboard events
      >
        {imageUrl && (
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Cropper"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) ${getImageTransform()}`,
              transformOrigin: 'center',
              maxWidth: 'none',
              maxHeight: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        )}

        {/* Crop overlay */}
        <div style={getCropOverlayStyle()} />

        {/* Touch indicators (for debugging) */}
        {activeTouches.map(touch => (
          <div
            key={touch.id}
            style={{
              position: 'absolute',
              left: touch.x - 10,
              top: touch.y - 10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        ))}
      </div>

      {/* Status and controls */}
      <div className="cropper-status" style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
        <div>Position: ({state.position.x.toFixed(1)}, {state.position.y.toFixed(1)})</div>
        <div>Scale: {state.scale.toFixed(2)}</div>
        <div>Rotation: {state.rotation.toFixed(1)}°</div>
        <div>Active Touches: {activeTouches.length}</div>
        <div>Gesture Active: {isGestureActive() ? 'Yes' : 'No'}</div>
        <div>Managers Ready: {isReady ? 'Yes' : 'No'}</div>
      </div>

      {/* Keyboard shortcuts help */}
      {enableKeyboard && keyBindings.length > 0 && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Keyboard Shortcuts ({keyBindings.length})
          </summary>
          <div style={{ marginTop: '8px' }}>
            {keyBindings.map((binding, index) => {
              const keyCombo = [
                binding.ctrlKey && 'Ctrl',
                binding.shiftKey && 'Shift',
                binding.altKey && 'Alt',
                binding.metaKey && 'Meta',
                binding.key.length === 1 ? binding.key.toUpperCase() : binding.key,
              ].filter(Boolean).join(' + ');

              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '2px 0',
                  fontSize: '11px' 
                }}>
                  <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>
                    {keyCombo}
                  </code>
                  <span>{binding.description}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
};