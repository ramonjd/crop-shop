/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Represents the components of a 2D transformation matrix decomposition.
 */
export interface Matrix2DDecomposition {
  translation: Point2D;
  rotation: number;
  scale: Point2D;
  skew: Point2D;
}

/**
 * Represents the raw values of a 2D transformation matrix.
 * Uses the standard 3x3 matrix representation for 2D transformations:
 * [a c tx]
 * [b d ty]
 * [0 0 1 ]
 */
export interface Matrix2DValues {
  a: number;  // x-scale
  b: number;  // y-skew
  c: number;  // x-skew
  d: number;  // y-scale
  tx: number; // x-translation
  ty: number; // y-translation
}

/**
 * A comprehensive 2D transformation matrix class supporting common transformations
 * including translation, rotation, scaling, and matrix operations.
 * 
 * The matrix uses the standard 3x3 homogeneous coordinate representation:
 * [a  c  tx]
 * [b  d  ty]
 * [0  0  1 ]
 */
export class Matrix2D {
  private _a: number = 1;
  private _b: number = 0;
  private _c: number = 0;
  private _d: number = 1;
  private _tx: number = 0;
  private _ty: number = 0;

  /**
   * Creates a new Matrix2D instance.
   * @param a - The x-scale component (default: 1)
   * @param b - The y-skew component (default: 0)
   * @param c - The x-skew component (default: 0)
   * @param d - The y-scale component (default: 1)
   * @param tx - The x-translation component (default: 0)
   * @param ty - The y-translation component (default: 0)
   */
  constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
    this._tx = tx;
    this._ty = ty;
  }

  // Getters for matrix components
  get a(): number { return this._a; }
  get b(): number { return this._b; }
  get c(): number { return this._c; }
  get d(): number { return this._d; }
  get tx(): number { return this._tx; }
  get ty(): number { return this._ty; }

  /**
   * Creates a new identity matrix.
   * @returns A new Matrix2D instance representing the identity transformation
   */
  static identity(): Matrix2D {
    return new Matrix2D();
  }

  /**
   * Creates a translation matrix.
   * @param x - The x-axis translation distance
   * @param y - The y-axis translation distance
   * @returns A new Matrix2D instance representing the translation
   */
  static translation(x: number, y: number): Matrix2D {
    return new Matrix2D(1, 0, 0, 1, x, y);
  }

  /**
   * Creates a rotation matrix.
   * @param angle - The rotation angle in radians
   * @returns A new Matrix2D instance representing the rotation
   */
  static rotation(angle: number): Matrix2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix2D(cos, sin, -sin, cos, 0, 0);
  }

  /**
   * Creates a scaling matrix.
   * @param x - The x-axis scale factor
   * @param y - The y-axis scale factor (defaults to x for uniform scaling)
   * @returns A new Matrix2D instance representing the scaling
   */
  static scaling(x: number, y: number = x): Matrix2D {
    return new Matrix2D(x, 0, 0, y, 0, 0);
  }

  /**
   * Creates a new matrix from raw component values.
   * @param values - Object containing the matrix component values
   * @returns A new Matrix2D instance with the specified values
   */
  static fromValues(values: Matrix2DValues): Matrix2D {
    return new Matrix2D(values.a, values.b, values.c, values.d, values.tx, values.ty);
  }

  /**
   * Applies a translation transformation to this matrix.
   * @param x - The x-axis translation distance
   * @param y - The y-axis translation distance
   * @returns This matrix instance for method chaining
   */
  translate(x: number, y: number): Matrix2D {
    this._tx += this._a * x + this._c * y;
    this._ty += this._b * x + this._d * y;
    return this;
  }

  /**
   * Applies a rotation transformation to this matrix.
   * @param angle - The rotation angle in radians
   * @returns This matrix instance for method chaining
   */
  rotate(angle: number): Matrix2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const a = this._a * cos - this._b * sin;
    const b = this._a * sin + this._b * cos;
    const c = this._c * cos - this._d * sin;
    const d = this._c * sin + this._d * cos;

    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;

    return this;
  }

  /**
   * Applies a scaling transformation to this matrix.
   * @param x - The x-axis scale factor
   * @param y - The y-axis scale factor (defaults to x for uniform scaling)
   * @returns This matrix instance for method chaining
   */
  scale(x: number, y: number = x): Matrix2D {
    this._a *= x;
    this._b *= x;
    this._c *= y;
    this._d *= y;
    return this;
  }

  /**
   * Multiplies this matrix by another matrix.
   * @param other - The matrix to multiply with
   * @returns This matrix instance for method chaining
   */
  multiply(other: Matrix2D): Matrix2D {
    const a = this._a * other._a + this._c * other._b;
    const b = this._b * other._a + this._d * other._b;
    const c = this._a * other._c + this._c * other._d;
    const d = this._b * other._c + this._d * other._d;
    const tx = this._a * other._tx + this._c * other._ty + this._tx;
    const ty = this._b * other._tx + this._d * other._ty + this._ty;

    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
    this._tx = tx;
    this._ty = ty;

    return this;
  }

  /**
   * Pre-multiplies this matrix by another matrix.
   * @param other - The matrix to pre-multiply with
   * @returns This matrix instance for method chaining
   */
  preMultiply(other: Matrix2D): Matrix2D {
    const a = other._a * this._a + other._c * this._b;
    const b = other._b * this._a + other._d * this._b;
    const c = other._a * this._c + other._c * this._d;
    const d = other._b * this._c + other._d * this._d;
    const tx = other._a * this._tx + other._c * this._ty + other._tx;
    const ty = other._b * this._tx + other._d * this._ty + other._ty;

    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
    this._tx = tx;
    this._ty = ty;

    return this;
  }

  /**
   * Transforms a point using this matrix.
   * @param point - The point to transform
   * @returns A new transformed point
   */
  transformPoint(point: Point2D): Point2D {
    return {
      x: this._a * point.x + this._c * point.y + this._tx,
      y: this._b * point.x + this._d * point.y + this._ty
    };
  }

  /**
   * Transforms multiple points using this matrix.
   * @param points - Array of points to transform
   * @returns Array of new transformed points
   */
  transformPoints(points: Point2D[]): Point2D[] {
    return points.map(point => this.transformPoint(point));
  }

  /**
   * Calculates the determinant of this matrix.
   * @returns The determinant value
   */
  determinant(): number {
    return this._a * this._d - this._b * this._c;
  }

  /**
   * Creates an inverted copy of this matrix.
   * @returns A new Matrix2D instance representing the inverse transformation
   * @throws Error if the matrix is not invertible (determinant is 0)
   */
  invert(): Matrix2D {
    const det = this.determinant();
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is not invertible (determinant is 0)');
    }

    const invDet = 1 / det;
    return new Matrix2D(
      this._d * invDet,
      -this._b * invDet,
      -this._c * invDet,
      this._a * invDet,
      (this._c * this._ty - this._d * this._tx) * invDet,
      (this._b * this._tx - this._a * this._ty) * invDet
    );
  }

  /**
   * Creates a copy of this matrix.
   * @returns A new Matrix2D instance with the same values
   */
  clone(): Matrix2D {
    return new Matrix2D(this._a, this._b, this._c, this._d, this._tx, this._ty);
  }

  /**
   * Resets this matrix to the identity matrix.
   * @returns This matrix instance for method chaining
   */
  reset(): Matrix2D {
    this._a = 1;
    this._b = 0;
    this._c = 0;
    this._d = 1;
    this._tx = 0;
    this._ty = 0;
    return this;
  }

  /**
   * Sets the matrix components to the specified values.
   * @param a - The x-scale component
   * @param b - The y-skew component
   * @param c - The x-skew component
   * @param d - The y-scale component
   * @param tx - The x-translation component
   * @param ty - The y-translation component
   * @returns This matrix instance for method chaining
   */
  setValues(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix2D {
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
    this._tx = tx;
    this._ty = ty;
    return this;
  }

  /**
   * Gets the raw matrix values.
   * @returns Object containing all matrix component values
   */
  getValues(): Matrix2DValues {
    return {
      a: this._a,
      b: this._b,
      c: this._c,
      d: this._d,
      tx: this._tx,
      ty: this._ty
    };
  }

  /**
   * Converts the matrix to a CSS transform string.
   * @returns CSS matrix() transform string
   */
  toCSSMatrix(): string {
    return `matrix(${this._a}, ${this._b}, ${this._c}, ${this._d}, ${this._tx}, ${this._ty})`;
  }

  /**
   * Decomposes the matrix into its transformation components.
   * @returns Object containing translation, rotation, scale, and skew components
   */
  decompose(): Matrix2DDecomposition {
    const { a, b, c, d, tx, ty } = this;

    // Translation is straightforward
    const translation: Point2D = { x: tx, y: ty };

    // Calculate scale and rotation
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);

    // Determine if we have a flip
    const sign = this.determinant() < 0 ? -1 : 1;
    const adjustedScaleY = scaleY * sign;

    // Calculate rotation
    const rotation = Math.atan2(b, a);

    // Calculate skew
    const skewX = Math.atan2(a * c + b * d, scaleX * scaleX);
    const skewY = 0; // In 2D affine transformations, skewY is typically 0

    return {
      translation,
      rotation,
      scale: { x: scaleX, y: adjustedScaleY },
      skew: { x: skewX, y: skewY }
    };
  }

  /**
   * Checks if this matrix equals another matrix within a tolerance.
   * @param other - The matrix to compare with
   * @param tolerance - The tolerance for floating-point comparison (default: 1e-10)
   * @returns True if matrices are equal within tolerance
   */
  equals(other: Matrix2D, tolerance: number = 1e-10): boolean {
    return (
      Math.abs(this._a - other._a) < tolerance &&
      Math.abs(this._b - other._b) < tolerance &&
      Math.abs(this._c - other._c) < tolerance &&
      Math.abs(this._d - other._d) < tolerance &&
      Math.abs(this._tx - other._tx) < tolerance &&
      Math.abs(this._ty - other._ty) < tolerance
    );
  }

  /**
   * Returns a string representation of the matrix.
   * @returns String representation of the matrix
   */
  toString(): string {
    return `Matrix2D(${this._a}, ${this._b}, ${this._c}, ${this._d}, ${this._tx}, ${this._ty})`;
  }
}

/**
 * Transforms a point by applying translation and rotation.
 * @param point - The point to transform
 * @param translation - The translation offset
 * @param rotation - The rotation angle in radians
 * @returns The transformed point
 */
export function transformPoint(point: Point2D, translation: Point2D, rotation: number = 0): Point2D {
  if (rotation === 0) {
    return {
      x: point.x + translation.x,
      y: point.y + translation.y
    };
  }

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return {
    x: point.x * cos - point.y * sin + translation.x,
    y: point.x * sin + point.y * cos + translation.y
  };
}

/**
 * Rotates a point around a center point.
 * @param point - The point to rotate
 * @param center - The center point of rotation
 * @param angle - The rotation angle in radians
 * @returns The rotated point
 */
export function rotatePointAroundCenter(point: Point2D, center: Point2D, angle: number): Point2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Translate point to origin
  const translatedX = point.x - center.x;
  const translatedY = point.y - center.y;

  // Rotate and translate back
  return {
    x: translatedX * cos - translatedY * sin + center.x,
    y: translatedX * sin + translatedY * cos + center.y
  };
}

/**
 * Calculates the distance between two points.
 * @param point1 - The first point
 * @param point2 - The second point
 * @returns The distance between the points
 */
export function distance(point1: Point2D, point2: Point2D): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle between two points.
 * @param from - The starting point
 * @param to - The ending point
 * @returns The angle in radians
 */
export function angleBetweenPoints(from: Point2D, to: Point2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees
 * @returns The angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param radians - The angle in radians
 * @returns The angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Creates a transformation matrix from individual transformation components.
 * @param translation - The translation component
 * @param rotation - The rotation angle in radians
 * @param scale - The scale component
 * @param origin - The origin point for rotation and scaling (default: {x: 0, y: 0})
 * @returns A new Matrix2D representing the combined transformation
 */
export function createTransformationMatrix(
  translation: Point2D = { x: 0, y: 0 },
  rotation: number = 0,
  scale: Point2D = { x: 1, y: 1 },
  origin: Point2D = { x: 0, y: 0 }
): Matrix2D {
  const matrix = new Matrix2D();
  
  // Apply transformations in order: translate to origin, scale, rotate, translate back, then final translation
  if (origin.x !== 0 || origin.y !== 0) {
    matrix.translate(-origin.x, -origin.y);
  }
  
  if (scale.x !== 1 || scale.y !== 1) {
    matrix.scale(scale.x, scale.y);
  }
  
  if (rotation !== 0) {
    matrix.rotate(rotation);
  }
  
  if (origin.x !== 0 || origin.y !== 0) {
    matrix.translate(origin.x, origin.y);
  }
  
  if (translation.x !== 0 || translation.y !== 0) {
    matrix.translate(translation.x, translation.y);
  }
  
  return matrix;
}

/**
 * Interpolates between two matrices.
 * @param from - The starting matrix
 * @param to - The ending matrix
 * @param t - The interpolation factor (0-1)
 * @returns A new Matrix2D representing the interpolated transformation
 */
export function interpolateMatrix(from: Matrix2D, to: Matrix2D, t: number): Matrix2D {
  const clampedT = Math.max(0, Math.min(1, t));
  
  return new Matrix2D(
    from.a + (to.a - from.a) * clampedT,
    from.b + (to.b - from.b) * clampedT,
    from.c + (to.c - from.c) * clampedT,
    from.d + (to.d - from.d) * clampedT,
    from.tx + (to.tx - from.tx) * clampedT,
    from.ty + (to.ty - from.ty) * clampedT
  );
}