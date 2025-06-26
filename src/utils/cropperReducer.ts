import { 
  StateWithHistory, 
  CropperState, 
  CropperAction, 
  CropperActionType 
} from '../types';

/**
 * Creates the initial cropper state
 */
export const createInitialCropperState = (): CropperState => ({
  position: { x: 0, y: 0 },
  scale: 1,
  rotation: 0,
  cropBoundaries: { x: 0, y: 0, width: 100, height: 100 }
});

/**
 * Creates the initial state with history
 */
export const createInitialStateWithHistory = (
  initialState?: Partial<CropperState>
): StateWithHistory => {
  const defaultState = createInitialCropperState();
  const current = initialState ? { ...defaultState, ...initialState } : defaultState;
  
  return {
    current,
    history: [],
    future: []
  };
};

/**
 * Adds the current state to history before making changes
 */
const addToHistory = (state: StateWithHistory): StateWithHistory => ({
  ...state,
  history: [...state.history, state.current],
  future: [] // Clear future when making new changes
});

/**
 * Reducer for managing cropper state with undo/redo functionality
 */
export const cropperReducer = (
  state: StateWithHistory,
  action: CropperAction
): StateWithHistory => {
  switch (action.type) {
    case CropperActionType.UPDATE_POSITION: {
      const newState = addToHistory(state);
      return {
        ...newState,
        current: {
          ...newState.current,
          position: action.payload
        }
      };
    }

    case CropperActionType.UPDATE_SCALE: {
      const newState = addToHistory(state);
      return {
        ...newState,
        current: {
          ...newState.current,
          scale: Math.max(0.1, Math.min(10, action.payload)) // Clamp scale between 0.1 and 10
        }
      };
    }

    case CropperActionType.UPDATE_ROTATION: {
      const newState = addToHistory(state);
      return {
        ...newState,
        current: {
          ...newState.current,
          rotation: action.payload % 360 // Normalize rotation to 0-359 degrees
        }
      };
    }

    case CropperActionType.UPDATE_CROP_BOUNDARIES: {
      const newState = addToHistory(state);
      return {
        ...newState,
        current: {
          ...newState.current,
          cropBoundaries: action.payload
        }
      };
    }

    case CropperActionType.UPDATE_STATE: {
      const newState = addToHistory(state);
      return {
        ...newState,
        current: {
          ...newState.current,
          ...action.payload
        }
      };
    }

    case CropperActionType.UNDO: {
      if (state.history.length === 0) {
        return state;
      }

      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);

      return {
        current: previous,
        history: newHistory,
        future: [state.current, ...state.future]
      };
    }

    case CropperActionType.REDO: {
      if (state.future.length === 0) {
        return state;
      }

      const next = state.future[0];
      const newFuture = state.future.slice(1);

      return {
        current: next,
        history: [...state.history, state.current],
        future: newFuture
      };
    }

    case CropperActionType.RESET_HISTORY: {
      return {
        ...state,
        history: [],
        future: []
      };
    }

    default:
      return state;
  }
};