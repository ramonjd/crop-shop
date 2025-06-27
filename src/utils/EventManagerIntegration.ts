import { useEffect, useRef, useCallback } from 'react';
import { TouchEventManager } from './TouchEventManager';
import { KeyboardEventManager } from './KeyboardEventManager';
import { GestureData, KeyboardEventData, TouchManagerConfig, KeyboardManagerConfig } from '../types/events';

// Assuming these exist based on the CROPPER_STATE_MANAGEMENT.md
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

// Action creators - these would be imported from the existing state management
const cropperActions = {
  updatePosition: (x: number, y: number) => ({ type: 'UPDATE_POSITION', payload: { x, y } }),
  updateScale: (scale: number) => ({ type: 'UPDATE_SCALE', payload: scale }),
  updateRotation: (rotation: number) => ({ type: 'UPDATE_ROTATION', payload: rotation }),
  updateState: (updates: Partial<CropperState>) => ({ type: 'UPDATE_STATE', payload: updates }),
  undo: () => ({ type: 'UNDO' }),
  redo: () => ({ type: 'REDO' }),
  resetHistory: () => ({ type: 'RESET_HISTORY' }),
};

interface EventManagerIntegrationConfig {
  element: HTMLElement;
  touchConfig?: Partial<TouchManagerConfig>;
  keyboardConfig?: Partial<KeyboardManagerConfig>;
  moveStep?: number;
  zoomStep?: number;
  rotationStep?: number;
}

export function useEventManagerIntegration(
  cropperStateHook: CropperStateHook,
  config: EventManagerIntegrationConfig
) {
  const touchManagerRef = useRef<TouchEventManager | null>(null);
  const keyboardManagerRef = useRef<KeyboardEventManager | null>(null);
  const lastGestureStateRef = useRef<{
    scale: number;
    rotation: number;
    position: { x: number; y: number };
  } | null>(null);

  const { state, dispatch, canUndo, canRedo } = cropperStateHook;

  const handleGesture = useCallback((gesture: GestureData) => {
    const currentState = state;
    
    switch (gesture.type) {
      case 'pan':
        if (gesture.translation) {
          const newPosition = {
            x: currentState.position.x + gesture.translation.x,
            y: currentState.position.y + gesture.translation.y,
          };
          dispatch(cropperActions.updatePosition(newPosition.x, newPosition.y));
        }
        break;

      case 'pinch':
        if (gesture.scale && gesture.scale !== 1) {
          const newScale = Math.max(0.1, Math.min(10, currentState.scale * gesture.scale));
          dispatch(cropperActions.updateScale(newScale));
        }
        break;

      case 'rotate':
        if (gesture.rotation !== undefined) {
          const newRotation = (currentState.rotation + gesture.rotation) % 360;
          dispatch(cropperActions.updateRotation(newRotation < 0 ? newRotation + 360 : newRotation));
        }
        break;
    }
  }, [state, dispatch]);

  const handleKeyboardEvent = useCallback((eventData: KeyboardEventData) => {
    // The action is determined by the KeyboardEventManager based on key bindings
    // We need to extract the action from the registered callbacks
  }, []);

  const registerKeyboardActions = useCallback(() => {
    if (!keyboardManagerRef.current) return;

    const manager = keyboardManagerRef.current;
    const moveStep = config.moveStep || 10;
    const zoomStep = config.zoomStep || 0.1;
    const rotationStep = config.rotationStep || 15;

    manager.registerAction('undo', () => {
      if (canUndo) dispatch(cropperActions.undo());
    });

    manager.registerAction('redo', () => {
      if (canRedo) dispatch(cropperActions.redo());
    });

    manager.registerAction('reset', () => {
      dispatch(cropperActions.updateState({
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
      }));
    });

    manager.registerAction('move-up', () => {
      dispatch(cropperActions.updatePosition(
        state.position.x,
        state.position.y - moveStep
      ));
    });

    manager.registerAction('move-down', () => {
      dispatch(cropperActions.updatePosition(
        state.position.x,
        state.position.y + moveStep
      ));
    });

    manager.registerAction('move-left', () => {
      dispatch(cropperActions.updatePosition(
        state.position.x - moveStep,
        state.position.y
      ));
    });

    manager.registerAction('move-right', () => {
      dispatch(cropperActions.updatePosition(
        state.position.x + moveStep,
        state.position.y
      ));
    });

    manager.registerAction('zoom-in', () => {
      const newScale = Math.min(10, state.scale + zoomStep);
      dispatch(cropperActions.updateScale(newScale));
    });

    manager.registerAction('zoom-out', () => {
      const newScale = Math.max(0.1, state.scale - zoomStep);
      dispatch(cropperActions.updateScale(newScale));
    });

    manager.registerAction('zoom-reset', () => {
      dispatch(cropperActions.updateScale(1));
    });

    manager.registerAction('cancel', () => {
      // Implementation depends on what cancel should do
      // Could be escape current drag operation, reset to last state, etc.
    });

    manager.registerAction('confirm', () => {
      // Implementation depends on what confirm should do
      // Could be finalize crop, save state, etc.
    });
  }, [state, dispatch, canUndo, canRedo, config]);

  useEffect(() => {
    if (!config.element) return;

    // Initialize Touch Event Manager
    const touchConfig: TouchManagerConfig = {
      element: config.element,
      onGesture: handleGesture,
      ...config.touchConfig,
    };
    touchManagerRef.current = new TouchEventManager(touchConfig);

    // Initialize Keyboard Event Manager
    const keyboardConfig: KeyboardManagerConfig = {
      element: config.element,
      onKeyPress: handleKeyboardEvent,
      ...config.keyboardConfig,
    };
    keyboardManagerRef.current = new KeyboardEventManager(keyboardConfig);

    // Register keyboard actions
    registerKeyboardActions();

    return () => {
      touchManagerRef.current?.destroy();
      keyboardManagerRef.current?.destroy();
      touchManagerRef.current = null;
      keyboardManagerRef.current = null;
    };
  }, [config.element, handleGesture, handleKeyboardEvent, registerKeyboardActions]);

  // Update keyboard actions when state changes
  useEffect(() => {
    registerKeyboardActions();
  }, [registerKeyboardActions]);

  const updateTouchConfig = useCallback((newConfig: Partial<TouchManagerConfig>) => {
    touchManagerRef.current?.updateConfig(newConfig);
  }, []);

  const updateKeyboardConfig = useCallback((newConfig: Partial<KeyboardManagerConfig>) => {
    keyboardManagerRef.current?.updateConfig(newConfig);
  }, []);

  const getActiveTouches = useCallback(() => {
    return touchManagerRef.current?.getActiveTouches() || [];
  }, []);

  const isGestureActive = useCallback(() => {
    return touchManagerRef.current?.isGestureActive() || false;
  }, []);

  const getKeyBindings = useCallback(() => {
    return keyboardManagerRef.current?.getKeyBindings() || [];
  }, []);

  const addKeyBinding = useCallback((binding: any) => {
    keyboardManagerRef.current?.addKeyBinding(binding);
  }, []);

  const removeKeyBinding = useCallback((binding: any) => {
    keyboardManagerRef.current?.removeKeyBinding(binding);
  }, []);

  return {
    touchManager: touchManagerRef.current,
    keyboardManager: keyboardManagerRef.current,
    updateTouchConfig,
    updateKeyboardConfig,
    getActiveTouches,
    isGestureActive,
    getKeyBindings,
    addKeyBinding,
    removeKeyBinding,
  };
}

// Hook for easier integration with existing cropper components
export function useCropperEventManagers(
  element: HTMLElement | null,
  cropperStateHook: CropperStateHook,
  options: Partial<EventManagerIntegrationConfig> = {}
) {
  const config = {
    element: element!,
    moveStep: 10,
    zoomStep: 0.1,
    rotationStep: 15,
    ...options,
  };

  const eventManagers = useEventManagerIntegration(cropperStateHook, config);

  return {
    ...eventManagers,
    isReady: !!element && !!eventManagers.touchManager && !!eventManagers.keyboardManager,
  };
}