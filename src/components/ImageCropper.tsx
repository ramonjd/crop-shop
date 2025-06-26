import React, { useRef, useCallback, useEffect, useState } from 'react';
import { ImageCropperProps, CropArea } from '../types';
import { constrainCropToImage, applyCropConstraints, getRelativePosition } from '../utils/cropUtils';

/**
 * ImageCropper - A controlled React component for cropping images
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  alt = 'Image to crop',
  crop,
  constraints,
  disabled = false,
  className = '',
  style,
  onCropChange,
  onCropStart,
  onCropEnd,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      setImageLoaded(true);
    }
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    const error = new Error(`Failed to load image: ${src}`);
    onError?.(error);
  }, [src, onError]);

  // Handle mouse/touch start
  const handlePointerStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled || !containerRef.current || !imageLoaded) return;

      event.preventDefault();
      const nativeEvent = event.nativeEvent as MouseEvent | TouchEvent;
      const position = getRelativePosition(nativeEvent, containerRef.current);
      
      setIsDragging(true);
      setDragStart(position);
      onCropStart?.(crop);
    },
    [disabled, imageLoaded, crop, onCropStart]
  );

  // Handle mouse/touch move
  const handlePointerMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragStart || !containerRef.current || !imageLoaded) return;

      event.preventDefault();
      const position = getRelativePosition(event, containerRef.current);
      
      // Calculate new crop area
      const newCrop: CropArea = {
        x: Math.min(dragStart.x, position.x),
        y: Math.min(dragStart.y, position.y),
        width: Math.abs(position.x - dragStart.x),
        height: Math.abs(position.y - dragStart.y),
      };

      // Apply constraints
      const constrainedCrop = applyCropConstraints(
        newCrop,
        constraints,
        imageDimensions.width,
        imageDimensions.height
      );

      // Ensure crop stays within image boundaries
      const finalCrop = constrainCropToImage(
        constrainedCrop,
        imageDimensions.width,
        imageDimensions.height
      );

      onCropChange(finalCrop);
    },
    [isDragging, dragStart, imageLoaded, constraints, imageDimensions, onCropChange]
  );

  // Handle mouse/touch end
  const handlePointerEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      onCropEnd?.(crop);
    }
  }, [isDragging, crop, onCropEnd]);

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerEnd);
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerEnd);

      return () => {
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerEnd);
        document.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('touchend', handlePointerEnd);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerEnd]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    cursor: disabled ? 'default' : 'crosshair',
    userSelect: 'none',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
  };

  const cropOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    border: '2px solid #007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    pointerEvents: 'none',
    left: `${crop.x}px`,
    top: `${crop.y}px`,
    width: `${crop.width}px`,
    height: `${crop.height}px`,
    display: imageLoaded && crop.width > 0 && crop.height > 0 ? 'block' : 'none',
  };

  return (
    <div
      ref={containerRef}
      className={`image-cropper ${className}`}
      style={containerStyle}
      onMouseDown={handlePointerStart}
      onTouchStart={handlePointerStart}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        style={imageStyle}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
      />
      <div style={cropOverlayStyle} />
    </div>
  );
};

export default ImageCropper;