/**
 * Represents a rectangular crop area with position and dimensions
 */
export interface CropArea {
  /** X coordinate of the crop area's top-left corner */
  x: number;
  /** Y coordinate of the crop area's top-left corner */
  y: number;
  /** Width of the crop area */
  width: number;
  /** Height of the crop area */
  height: number;
}

/**
 * Dimensions for constraining crop area
 */
export interface CropConstraints {
  /** Minimum width of the crop area */
  minWidth?: number;
  /** Minimum height of the crop area */
  minHeight?: number;
  /** Maximum width of the crop area */
  maxWidth?: number;
  /** Maximum height of the crop area */
  maxHeight?: number;
  /** Aspect ratio to maintain (width/height) */
  aspectRatio?: number;
}

/**
 * Event handler callbacks for the ImageCropper component
 */
export interface CropEventHandlers {
  /** Called when the crop area changes */
  onCropChange: (crop: CropArea) => void;
  /** Called when cropping starts */
  onCropStart?: (crop: CropArea) => void;
  /** Called when cropping ends */
  onCropEnd?: (crop: CropArea) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Props for the ImageCropper component
 */
export interface ImageCropperProps extends CropEventHandlers {
  /** Source URL or path to the image to be cropped */
  src: string;
  /** Alternative text for the image */
  alt?: string;
  /** Current crop area state */
  crop: CropArea;
  /** Constraints for the crop area */
  constraints?: CropConstraints;
  /** Whether the cropper is disabled */
  disabled?: boolean;
  /** CSS class name for styling */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Result of a crop operation
 */
export interface CropResult {
  /** The cropped image data as a data URL */
  dataUrl: string;
  /** The crop area that was applied */
  crop: CropArea;
  /** Original image dimensions */
  originalDimensions: {
    width: number;
    height: number;
  };
}