# Cropper State Management System

This document describes the centralized state management system for the image cropper using React's `useReducer` hook with undo/redo functionality.

## Overview

The state management system maintains:
- Current cropper state (position, scale, rotation, crop boundaries)
- History stack for undo operations
- Future stack for redo operations

## Key Components

### Types (`src/types/index.ts`)

```typescript
interface CropperState {
  position: Position;          // Current position of the image
  scale: number;              // Current scale/zoom level
  rotation: number;           // Current rotation angle in degrees
  cropBoundaries: CropArea;   // Current crop boundaries
}

interface StateWithHistory {
  current: CropperState;      // Current active state
  history: CropperState[];    // History stack for undo operations
  future: CropperState[];     // Future stack for redo operations
}
```

### Actions

- `UPDATE_POSITION` - Updates image position
- `UPDATE_SCALE` - Updates scale/zoom level (clamped between 0.1 and 10)
- `UPDATE_ROTATION` - Updates rotation angle (normalized to 0-359 degrees)
- `UPDATE_CROP_BOUNDARIES` - Updates crop area boundaries
- `UPDATE_STATE` - Updates multiple state properties at once
- `UNDO` - Reverts to previous state
- `REDO` - Applies next state from future stack
- `RESET_HISTORY` - Clears undo/redo history

### Reducer (`src/utils/cropperReducer.ts`)

The reducer handles all state transitions and maintains the history stacks:

```typescript
export const cropperReducer = (
  state: StateWithHistory,
  action: CropperAction
): StateWithHistory
```

Key features:
- Automatically adds current state to history before changes
- Clears future stack when new changes are made
- Validates scale values (0.1 to 10 range)
- Normalizes rotation values (0-359 degrees)

### Custom Hook (`src/utils/useCropperState.ts`)

The main hook that provides the state management interface:

```typescript
export const useCropperState = (
  initialState?: Partial<CropperState>
): CropperStateHook
```

Returns:
- `state`: Current cropper state
- `dispatch`: Function to dispatch actions
- `canUndo`: Boolean indicating if undo is available
- `canRedo`: Boolean indicating if redo is available

### Action Creators

Helper functions for creating actions:

```typescript
cropperActions.updatePosition(x, y)
cropperActions.updateScale(scale)
cropperActions.updateRotation(rotation)
cropperActions.updateCropBoundaries(boundaries)
cropperActions.updateState(updates)
cropperActions.undo()
cropperActions.redo()
cropperActions.resetHistory()
```

## Usage Example

```typescript
import { useCropperState, cropperActions } from './utils';

const MyCropperComponent = () => {
  const { state, dispatch, canUndo, canRedo } = useCropperState({
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
    cropBoundaries: { x: 0, y: 0, width: 100, height: 100 }
  });

  const handleMove = (x: number, y: number) => {
    dispatch(cropperActions.updatePosition(x, y));
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

  return (
    <div>
      <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
      <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
      {/* Your cropper UI */}
    </div>
  );
};
```

## Example Component

See `src/components/CropperStateExample.tsx` for a complete interactive example demonstrating all features of the state management system.

## Features

- **Undo/Redo**: Full history management with separate stacks
- **Type Safety**: Complete TypeScript support with proper typing
- **Action Validation**: Scale clamping and rotation normalization
- **History Management**: Automatic history tracking with manual reset option
- **Flexibility**: Partial state updates and multiple property changes
- **Performance**: Efficient state updates using useReducer