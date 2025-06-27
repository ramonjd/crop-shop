import { TouchPoint, GestureData, TouchEventData, TouchManagerConfig, GestureCallback } from '../types/events';

export class TouchEventManager {
  private element: HTMLElement;
  private config: TouchManagerConfig;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private gestureState: {
    pan?: { startCenter: { x: number; y: number }; lastCenter: { x: number; y: number } };
    pinch?: { startDistance: number; lastDistance: number; startScale: number };
    rotate?: { startAngle: number; lastAngle: number; startRotation: number };
  } = {};
  private onGesture?: GestureCallback;
  private animationFrame?: number;

  constructor(config: TouchManagerConfig) {
    this.element = config.element;
    this.config = {
      minPinchDistance: 10,
      rotationThreshold: 5,
      panThreshold: 3,
      enablePan: true,
      enablePinch: true,
      enableRotation: true,
      ...config,
    };
    this.onGesture = config.onGesture;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }

  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    const timestamp = Date.now();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const rect = this.element.getBoundingClientRect();
      
      this.activeTouches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        timestamp,
      });
    }

    this.processGestures();
  };

  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    const timestamp = Date.now();
    const rect = this.element.getBoundingClientRect();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      
      if (this.activeTouches.has(touch.identifier)) {
        this.activeTouches.set(touch.identifier, {
          id: touch.identifier,
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          timestamp,
        });
      }
    }

    this.processGestures();
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.activeTouches.delete(touch.identifier);
    }

    this.processGestures();
    
    if (this.activeTouches.size === 0) {
      this.resetGestureState();
    }
  };

  private processGestures(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      const touches = Array.from(this.activeTouches.values());
      const gestures: GestureData[] = [];

      if (touches.length === 1 && this.config.enablePan) {
        const panGesture = this.processPanGesture(touches[0]);
        if (panGesture) gestures.push(panGesture);
      } else if (touches.length === 2) {
        if (this.config.enablePinch) {
          const pinchGesture = this.processPinchGesture(touches);
          if (pinchGesture) gestures.push(pinchGesture);
        }
        
        if (this.config.enableRotation) {
          const rotateGesture = this.processRotateGesture(touches);
          if (rotateGesture) gestures.push(rotateGesture);
        }
      }

      if (gestures.length > 0 && this.onGesture) {
        gestures.forEach(gesture => this.onGesture!(gesture));
      }
    });
  }

  private processPanGesture(touch: TouchPoint): GestureData | null {
    const center = { x: touch.x, y: touch.y };
    
    if (!this.gestureState.pan) {
      this.gestureState.pan = {
        startCenter: center,
        lastCenter: center,
      };
      return null;
    }

    const translation = {
      x: center.x - this.gestureState.pan.lastCenter.x,
      y: center.y - this.gestureState.pan.lastCenter.y,
    };

    const distance = Math.sqrt(translation.x ** 2 + translation.y ** 2);
    
    if (distance < this.config.panThreshold!) {
      return null;
    }

    const velocity = this.calculateVelocity(
      this.gestureState.pan.lastCenter,
      center,
      touch.timestamp
    );

    this.gestureState.pan.lastCenter = center;

    return {
      type: 'pan',
      center,
      translation,
      velocity,
      isActive: true,
      timestamp: touch.timestamp,
    };
  }

  private processPinchGesture(touches: TouchPoint[]): GestureData | null {
    const [touch1, touch2] = touches;
    const center = {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
    
    const distance = Math.sqrt(
      (touch2.x - touch1.x) ** 2 + (touch2.y - touch1.y) ** 2
    );

    if (!this.gestureState.pinch) {
      this.gestureState.pinch = {
        startDistance: distance,
        lastDistance: distance,
        startScale: 1,
      };
      return null;
    }

    if (Math.abs(distance - this.gestureState.pinch.lastDistance) < this.config.minPinchDistance!) {
      return null;
    }

    const scale = distance / this.gestureState.pinch.startDistance;
    this.gestureState.pinch.lastDistance = distance;

    return {
      type: 'pinch',
      center,
      scale,
      isActive: true,
      timestamp: Math.max(touch1.timestamp, touch2.timestamp),
    };
  }

  private processRotateGesture(touches: TouchPoint[]): GestureData | null {
    const [touch1, touch2] = touches;
    const center = {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
    
    const angle = Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x) * (180 / Math.PI);

    if (!this.gestureState.rotate) {
      this.gestureState.rotate = {
        startAngle: angle,
        lastAngle: angle,
        startRotation: 0,
      };
      return null;
    }

    let rotation = angle - this.gestureState.rotate.startAngle;
    
    // Normalize rotation to -180 to 180 range
    if (rotation > 180) rotation -= 360;
    if (rotation < -180) rotation += 360;

    if (Math.abs(rotation - this.gestureState.rotate.lastAngle) < this.config.rotationThreshold!) {
      return null;
    }

    this.gestureState.rotate.lastAngle = rotation;

    return {
      type: 'rotate',
      center,
      rotation,
      isActive: true,
      timestamp: Math.max(touch1.timestamp, touch2.timestamp),
    };
  }

  private calculateVelocity(
    lastPoint: { x: number; y: number },
    currentPoint: { x: number; y: number },
    timestamp: number
  ): { x: number; y: number } {
    const timeDiff = Math.max(timestamp - (this.gestureState.pan?.lastCenter ? 0 : timestamp), 1);
    return {
      x: (currentPoint.x - lastPoint.x) / timeDiff,
      y: (currentPoint.y - lastPoint.y) / timeDiff,
    };
  }

  private resetGestureState(): void {
    this.gestureState = {};
  }

  public updateConfig(config: Partial<TouchManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchEnd);
    
    this.activeTouches.clear();
    this.resetGestureState();
  }

  public getActiveTouches(): TouchPoint[] {
    return Array.from(this.activeTouches.values());
  }

  public isGestureActive(): boolean {
    return this.activeTouches.size > 0;
  }
}