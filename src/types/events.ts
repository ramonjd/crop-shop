// Touch event types
export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureData {
  type: 'pan' | 'pinch' | 'rotate';
  center: { x: number; y: number };
  scale?: number;
  rotation?: number;
  translation?: { x: number; y: number };
  velocity?: { x: number; y: number };
  isActive: boolean;
  timestamp: number;
}

export interface TouchEventData {
  touches: TouchPoint[];
  gestureData: GestureData[];
  preventDefault: () => void;
  stopPropagation: () => void;
}

// Keyboard event types
export interface KeyBinding {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
}

export interface KeyboardEventData {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
}

// Event manager callbacks
export type TouchEventCallback = (data: TouchEventData) => void;
export type KeyboardEventCallback = (data: KeyboardEventData) => void;
export type GestureCallback = (gesture: GestureData) => void;

// Configuration types
export interface TouchManagerConfig {
  element: HTMLElement;
  onGesture?: GestureCallback;
  minPinchDistance?: number;
  rotationThreshold?: number;
  panThreshold?: number;
  enablePan?: boolean;
  enablePinch?: boolean;
  enableRotation?: boolean;
}

export interface KeyboardManagerConfig {
  element?: HTMLElement;
  keyBindings?: KeyBinding[];
  preventDefaults?: boolean;
  onKeyPress?: KeyboardEventCallback;
}

// Default key bindings for cropper operations
export const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  { key: 'z', ctrlKey: true, action: 'undo', description: 'Undo last action' },
  { key: 'y', ctrlKey: true, action: 'redo', description: 'Redo last action' },
  { key: 'z', ctrlKey: true, shiftKey: true, action: 'redo', description: 'Redo last action (Alt)' },
  { key: 'r', ctrlKey: true, action: 'reset', description: 'Reset cropper state' },
  { key: 'Escape', action: 'cancel', description: 'Cancel current operation' },
  { key: 'Enter', action: 'confirm', description: 'Confirm current operation' },
  { key: 'ArrowUp', action: 'move-up', description: 'Move crop area up' },
  { key: 'ArrowDown', action: 'move-down', description: 'Move crop area down' },
  { key: 'ArrowLeft', action: 'move-left', description: 'Move crop area left' },
  { key: 'ArrowRight', action: 'move-right', description: 'Move crop area right' },
  { key: '=', ctrlKey: true, action: 'zoom-in', description: 'Zoom in' },
  { key: '-', ctrlKey: true, action: 'zoom-out', description: 'Zoom out' },
  { key: '0', ctrlKey: true, action: 'zoom-reset', description: 'Reset zoom' },
];