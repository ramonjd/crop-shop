import { CropArea, CropConstraints } from '../types';

/**
 * Constrains crop area to stay within image boundaries
 */
export const constrainCropToImage = (
  crop: CropArea,
  imageWidth: number,
  imageHeight: number
): CropArea => {
  const constrainedCrop = { ...crop };

  // Ensure crop doesn't exceed image boundaries
  if (constrainedCrop.x < 0) {
    constrainedCrop.width += constrainedCrop.x;
    constrainedCrop.x = 0;
  }
  if (constrainedCrop.y < 0) {
    constrainedCrop.height += constrainedCrop.y;
    constrainedCrop.y = 0;
  }
  if (constrainedCrop.x + constrainedCrop.width > imageWidth) {
    constrainedCrop.width = imageWidth - constrainedCrop.x;
  }
  if (constrainedCrop.y + constrainedCrop.height > imageHeight) {
    constrainedCrop.height = imageHeight - constrainedCrop.y;
  }

  // Ensure minimum dimensions
  constrainedCrop.width = Math.max(constrainedCrop.width, 1);
  constrainedCrop.height = Math.max(constrainedCrop.height, 1);

  return constrainedCrop;
};

/**
 * Applies crop constraints to a crop area
 */
export const applyCropConstraints = (
  crop: CropArea,
  constraints: CropConstraints = {},
  imageWidth: number,
  imageHeight: number
): CropArea => {
  let constrainedCrop = { ...crop };

  // Apply dimension constraints
  if (constraints.minWidth !== undefined) {
    constrainedCrop.width = Math.max(constrainedCrop.width, constraints.minWidth);
  }
  if (constraints.minHeight !== undefined) {
    constrainedCrop.height = Math.max(constrainedCrop.height, constraints.minHeight);
  }
  if (constraints.maxWidth !== undefined) {
    constrainedCrop.width = Math.min(constrainedCrop.width, constraints.maxWidth);
  }
  if (constraints.maxHeight !== undefined) {
    constrainedCrop.height = Math.min(constrainedCrop.height, constraints.maxHeight);
  }

  // Apply aspect ratio constraint
  if (constraints.aspectRatio !== undefined) {
    const currentRatio = constrainedCrop.width / constrainedCrop.height;
    if (Math.abs(currentRatio - constraints.aspectRatio) > 0.001) {
      // Adjust height to match aspect ratio
      constrainedCrop.height = constrainedCrop.width / constraints.aspectRatio;
    }
  }

  // Ensure crop stays within image boundaries
  constrainedCrop = constrainCropToImage(constrainedCrop, imageWidth, imageHeight);

  return constrainedCrop;
};

/**
 * Calculates the relative position of a point within an element
 */
export const getRelativePosition = (
  event: MouseEvent | TouchEvent,
  element: HTMLElement
): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

/**
 * Determines if a point is within a rectangular area
 */
export const isPointInArea = (
  point: { x: number; y: number },
  area: CropArea
): boolean => {
  return (
    point.x >= area.x &&
    point.x <= area.x + area.width &&
    point.y >= area.y &&
    point.y <= area.y + area.height
  );
};