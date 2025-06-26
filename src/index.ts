import './index.scss';

// Main component export
export { ImageCropper, default as ImageCropper } from './components/ImageCropper';

// Type exports
export type {
  CropArea,
  CropConstraints,
  CropEventHandlers,
  ImageCropperProps,
  CropResult,
  Position,
  CropperState,
  StateWithHistory,
  CropperActionType,
  CropperAction,
  CropperStateHook,
} from './types';

// Utility exports
export {
  constrainCropToImage,
  applyCropConstraints,
  getRelativePosition,
  isPointInArea,
  cropperReducer,
  createInitialCropperState,
  createInitialStateWithHistory,
  useCropperState,
  cropperActions,
} from './utils';