import { 
  Matrix2D, 
  Point2D, 
  transformPoint, 
  rotatePointAroundCenter, 
  distance, 
  angleBetweenPoints,
  degreesToRadians,
  radiansToDegrees,
  createTransformationMatrix,
  interpolateMatrix
} from './matrix2d';

describe('Matrix2D', () => {
  describe('Constructor and static methods', () => {
    test('creates identity matrix by default', () => {
      const matrix = new Matrix2D();
      expect(matrix.a).toBe(1);
      expect(matrix.b).toBe(0);
      expect(matrix.c).toBe(0);
      expect(matrix.d).toBe(1);
      expect(matrix.tx).toBe(0);
      expect(matrix.ty).toBe(0);
    });

    test('creates matrix with specified values', () => {
      const matrix = new Matrix2D(2, 1, 0.5, 3, 10, 20);
      expect(matrix.a).toBe(2);
      expect(matrix.b).toBe(1);
      expect(matrix.c).toBe(0.5);
      expect(matrix.d).toBe(3);
      expect(matrix.tx).toBe(10);
      expect(matrix.ty).toBe(20);
    });

    test('creates identity matrix using static method', () => {
      const matrix = Matrix2D.identity();
      expect(matrix.equals(new Matrix2D())).toBe(true);
    });

    test('creates translation matrix', () => {
      const matrix = Matrix2D.translation(5, 10);
      const expected = new Matrix2D(1, 0, 0, 1, 5, 10);
      expect(matrix.equals(expected)).toBe(true);
    });

    test('creates rotation matrix', () => {
      const angle = Math.PI / 4; // 45 degrees
      const matrix = Matrix2D.rotation(angle);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const expected = new Matrix2D(cos, sin, -sin, cos, 0, 0);
      expect(matrix.equals(expected)).toBe(true);
    });

    test('creates scaling matrix', () => {
      const matrix = Matrix2D.scaling(2, 3);
      const expected = new Matrix2D(2, 0, 0, 3, 0, 0);
      expect(matrix.equals(expected)).toBe(true);
    });

    test('creates uniform scaling matrix', () => {
      const matrix = Matrix2D.scaling(2);
      const expected = new Matrix2D(2, 0, 0, 2, 0, 0);
      expect(matrix.equals(expected)).toBe(true);
    });
  });

  describe('Transformations', () => {
    test('applies translation', () => {
      const matrix = new Matrix2D();
      matrix.translate(5, 10);
      expect(matrix.tx).toBe(5);
      expect(matrix.ty).toBe(10);
    });

    test('applies rotation', () => {
      const matrix = new Matrix2D();
      const angle = Math.PI / 2; // 90 degrees
      matrix.rotate(angle);
      
      const point = matrix.transformPoint({ x: 1, y: 0 });
      expect(Math.abs(point.x)).toBeLessThan(1e-10);
      expect(Math.abs(point.y - 1)).toBeLessThan(1e-10);
    });

    test('applies scaling', () => {
      const matrix = new Matrix2D();
      matrix.scale(2, 3);
      
      const point = matrix.transformPoint({ x: 1, y: 1 });
      expect(point.x).toBe(2);
      expect(point.y).toBe(3);
    });

    test('chains transformations', () => {
      const matrix = new Matrix2D();
      matrix.translate(5, 10).scale(2, 2).rotate(Math.PI);
      
      const point = matrix.transformPoint({ x: 1, y: 0 });
      expect(Math.abs(point.x - 3)).toBeLessThan(1e-10);
      expect(Math.abs(point.y - 10)).toBeLessThan(1e-10);
    });
  });

  describe('Matrix operations', () => {
    test('multiplies matrices correctly', () => {
      const m1 = Matrix2D.translation(5, 10);
      const m2 = Matrix2D.scaling(2, 3);
      
      m1.multiply(m2);
      
      const point = m1.transformPoint({ x: 1, y: 1 });
      expect(point.x).toBe(7); // (1 * 2) + 5
      expect(point.y).toBe(13); // (1 * 3) + 10
    });

    test('pre-multiplies matrices correctly', () => {
      const m1 = Matrix2D.translation(5, 10);
      const m2 = Matrix2D.scaling(2, 3);
      
      m1.preMultiply(m2);
      
      const point = m1.transformPoint({ x: 1, y: 1 });
      expect(point.x).toBe(11); // (1 + 5) * 2 + 0
      expect(point.y).toBe(33); // (1 + 10) * 3 + 0
    });

    test('calculates determinant', () => {
      const matrix = new Matrix2D(2, 1, 3, 4, 0, 0);
      expect(matrix.determinant()).toBe(5); // 2*4 - 1*3 = 5
    });

    test('inverts matrix', () => {
      const original = Matrix2D.translation(5, 10).scale(2, 3);
      const inverted = original.invert();
      const identity = original.clone().multiply(inverted);
      
      expect(identity.equals(Matrix2D.identity(), 1e-10)).toBe(true);
    });

    test('throws error when inverting non-invertible matrix', () => {
      const matrix = new Matrix2D(0, 0, 0, 0, 0, 0);
      expect(() => matrix.invert()).toThrow('Matrix is not invertible');
    });
  });

  describe('Point transformation', () => {
    test('transforms single point', () => {
      const matrix = Matrix2D.translation(5, 10);
      const point = matrix.transformPoint({ x: 1, y: 2 });
      expect(point.x).toBe(6);
      expect(point.y).toBe(12);
    });

    test('transforms multiple points', () => {
      const matrix = Matrix2D.scaling(2, 3);
      const points = [{ x: 1, y: 1 }, { x: 2, y: 3 }];
      const transformed = matrix.transformPoints(points);
      
      expect(transformed[0]).toEqual({ x: 2, y: 3 });
      expect(transformed[1]).toEqual({ x: 4, y: 9 });
    });
  });

  describe('Matrix decomposition', () => {
    test('decomposes translation matrix', () => {
      const matrix = Matrix2D.translation(5, 10);
      const decomposition = matrix.decompose();
      
      expect(decomposition.translation.x).toBe(5);
      expect(decomposition.translation.y).toBe(10);
      expect(Math.abs(decomposition.rotation)).toBeLessThan(1e-10);
      expect(Math.abs(decomposition.scale.x - 1)).toBeLessThan(1e-10);
      expect(Math.abs(decomposition.scale.y - 1)).toBeLessThan(1e-10);
    });

    test('decomposes rotation matrix', () => {
      const angle = Math.PI / 4;
      const matrix = Matrix2D.rotation(angle);
      const decomposition = matrix.decompose();
      
      expect(Math.abs(decomposition.rotation - angle)).toBeLessThan(1e-10);
      expect(Math.abs(decomposition.scale.x - 1)).toBeLessThan(1e-10);
      expect(Math.abs(decomposition.scale.y - 1)).toBeLessThan(1e-10);
    });

    test('decomposes scaling matrix', () => {
      const matrix = Matrix2D.scaling(2, 3);
      const decomposition = matrix.decompose();
      
      expect(Math.abs(decomposition.scale.x - 2)).toBeLessThan(1e-10);
      expect(Math.abs(decomposition.scale.y - 3)).toBeLessThan(1e-10);
      expect(Math.abs(decomposition.rotation)).toBeLessThan(1e-10);
    });
  });

  describe('Utility methods', () => {
    test('converts to CSS matrix string', () => {
      const matrix = new Matrix2D(1, 2, 3, 4, 5, 6);
      expect(matrix.toCSSMatrix()).toBe('matrix(1, 2, 3, 4, 5, 6)');
    });

    test('clones matrix', () => {
      const original = new Matrix2D(1, 2, 3, 4, 5, 6);
      const clone = original.clone();
      
      expect(clone.equals(original)).toBe(true);
      expect(clone).not.toBe(original);
    });

    test('resets to identity', () => {
      const matrix = new Matrix2D(1, 2, 3, 4, 5, 6);
      matrix.reset();
      expect(matrix.equals(Matrix2D.identity())).toBe(true);
    });

    test('gets and sets values', () => {
      const matrix = new Matrix2D();
      const values = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
      
      matrix.setValues(values.a, values.b, values.c, values.d, values.tx, values.ty);
      expect(matrix.getValues()).toEqual(values);
    });

    test('converts to string', () => {
      const matrix = new Matrix2D(1, 2, 3, 4, 5, 6);
      expect(matrix.toString()).toBe('Matrix2D(1, 2, 3, 4, 5, 6)');
    });
  });
});

describe('Utility functions', () => {
  describe('transformPoint', () => {
    test('transforms point with translation only', () => {
      const point = { x: 1, y: 2 };
      const translation = { x: 5, y: 10 };
      const result = transformPoint(point, translation);
      
      expect(result.x).toBe(6);
      expect(result.y).toBe(12);
    });

    test('transforms point with translation and rotation', () => {
      const point = { x: 1, y: 0 };
      const translation = { x: 0, y: 0 };
      const rotation = Math.PI / 2;
      const result = transformPoint(point, translation, rotation);
      
      expect(Math.abs(result.x)).toBeLessThan(1e-10);
      expect(Math.abs(result.y - 1)).toBeLessThan(1e-10);
    });
  });

  describe('rotatePointAroundCenter', () => {
    test('rotates point around center', () => {
      const point = { x: 2, y: 1 };
      const center = { x: 1, y: 1 };
      const angle = Math.PI / 2;
      const result = rotatePointAroundCenter(point, center, angle);
      
      expect(Math.abs(result.x - 1)).toBeLessThan(1e-10);
      expect(Math.abs(result.y - 2)).toBeLessThan(1e-10);
    });
  });

  describe('distance', () => {
    test('calculates distance between points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(distance(p1, p2)).toBe(5);
    });
  });

  describe('angleBetweenPoints', () => {
    test('calculates angle between points', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 1, y: 1 };
      const angle = angleBetweenPoints(from, to);
      expect(Math.abs(angle - Math.PI / 4)).toBeLessThan(1e-10);
    });
  });

  describe('angle conversion', () => {
    test('converts degrees to radians', () => {
      expect(Math.abs(degreesToRadians(180) - Math.PI)).toBeLessThan(1e-10);
      expect(Math.abs(degreesToRadians(90) - Math.PI / 2)).toBeLessThan(1e-10);
    });

    test('converts radians to degrees', () => {
      expect(Math.abs(radiansToDegrees(Math.PI) - 180)).toBeLessThan(1e-10);
      expect(Math.abs(radiansToDegrees(Math.PI / 2) - 90)).toBeLessThan(1e-10);
    });
  });

  describe('createTransformationMatrix', () => {
    test('creates matrix from components', () => {
      const translation = { x: 5, y: 10 };
      const rotation = Math.PI / 4;
      const scale = { x: 2, y: 3 };
      
      const matrix = createTransformationMatrix(translation, rotation, scale);
      const point = matrix.transformPoint({ x: 1, y: 0 });
      
      // Should apply scale, then rotation, then translation
      const expectedX = Math.sqrt(2) + 5; // scaled and rotated x component
      const expectedY = Math.sqrt(2) + 10; // scaled and rotated y component
      
      expect(Math.abs(point.x - expectedX)).toBeLessThan(1e-10);
      expect(Math.abs(point.y - expectedY)).toBeLessThan(1e-10);
    });
  });

  describe('interpolateMatrix', () => {
    test('interpolates between matrices', () => {
      const from = Matrix2D.translation(0, 0);
      const to = Matrix2D.translation(10, 20);
      
      const interpolated = interpolateMatrix(from, to, 0.5);
      
      expect(interpolated.tx).toBe(5);
      expect(interpolated.ty).toBe(10);
    });

    test('clamps interpolation factor', () => {
      const from = Matrix2D.translation(0, 0);
      const to = Matrix2D.translation(10, 20);
      
      const interpolated1 = interpolateMatrix(from, to, -0.5);
      const interpolated2 = interpolateMatrix(from, to, 1.5);
      
      expect(interpolated1.equals(from)).toBe(true);
      expect(interpolated2.equals(to)).toBe(true);
    });
  });
});