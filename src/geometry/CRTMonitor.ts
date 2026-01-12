export interface GeometryData {
  vertices: Float32Array;
  indices: Uint16Array;
  stride: number;
}

export class CRTMonitor {
  createScreenGeometry(aspect: number = 1.0): GeometryData {
    const sx = aspect;
    const sy = 1;

    const vertices = new Float32Array([
      -sx,
      -sy,
      0.0,
      0.0,
      1.0,
      sx,
      -sy,
      0.0,
      1.0,
      1.0,
      sx,
      sy,
      0.0,
      1.0,
      0.0,
      -sx,
      sy,
      0.0,
      0.0,
      0.0,
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    return { vertices, indices, stride: 5 * 4 };
  }

  createBezelGeometry(): GeometryData {
    const vertices = new Float32Array([]);
    const indices = new Uint16Array([]);
    return { vertices, indices, stride: 3 * 4 };
  }
}
