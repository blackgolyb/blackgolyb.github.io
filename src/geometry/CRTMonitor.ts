export interface GeometryData {
  vertices: Float32Array;
  indices: Uint16Array;
  stride: number;
}

export class CRTMonitor {
  private screenWidth: number;
  private screenHeight: number;
  private bezelSize: number;
  private depth: number;

  constructor(
    screenWidth: number = 1.5,
    screenHeight: number = 1.0,
    bezelSize: number = 0.15,
    depth: number = 0.3,
  ) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.bezelSize = bezelSize;
    this.depth = depth;
  }

  createScreenGeometry(): GeometryData {
    const sx = this.screenWidth / 2;
    const sy = this.screenHeight / 2;

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
