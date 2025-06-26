import { useReducer } from 'react';
import { 
  CropperStateHook, 
  CropperState,
  CropperAction
} from '../types';
import { 
  cropperReducer, 
  createInitialStateWithHistory 
} from './cropperReducer';

/**
 * Custom hook for managing cropper state with undo/redo functionality
 * 
 * @param initialState - Optional initial state for the cropper
 * @returns Object containing current state, dispatch function, and undo/redo availability
 */
export const useCropperState = (
  initialState?: Partial<CropperState>
): CropperStateHook => {
  const [stateWithHistory, dispatch] = useReducer(
    cropperReducer,
    createInitialStateWithHistory(initialState)
  );

  const canUndo = stateWithHistory.history.length > 0;
  const canRedo = stateWithHistory.future.length > 0;

  return {
    state: stateWithHistory.current,
    dispatch,
    canUndo,
    canRedo
  };
};

/**
 * Helper functions for creating actions
 */
export const cropperActions = {
  updatePosition: (x: number, y: number): CropperAction => ({
    type: 'UPDATE_POSITION' as const,
    payload: { x, y }
  }),

  updateScale: (scale: number): CropperAction => ({
    type: 'UPDATE_SCALE' as const,
    payload: scale
  }),

  updateRotation: (rotation: number): CropperAction => ({
    type: 'UPDATE_ROTATION' as const,
    payload: rotation
  }),

  updateCropBoundaries: (boundaries: { x: number; y: number; width: number; height: number }): CropperAction => ({
    type: 'UPDATE_CROP_BOUNDARIES' as const,
    payload: boundaries
  }),

  updateState: (updates: Partial<CropperState>): CropperAction => ({
    type: 'UPDATE_STATE' as const,
    payload: updates
  }),

  undo: (): CropperAction => ({
    type: 'UNDO' as const
  }),

  redo: (): CropperAction => ({
    type: 'REDO' as const
  }),

  resetHistory: (): CropperAction => ({
    type: 'RESET_HISTORY' as const
  })
};