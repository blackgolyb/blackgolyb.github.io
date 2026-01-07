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
      -this.depth * 0.5,
      0.0,
      1.0,
      sx,
      -sy,
      -this.depth * 0.5,
      1.0,
      1.0,
      sx,
      sy,
      -this.depth * 0.5,
      1.0,
      0.0,
      -sx,
      sy,
      -this.depth * 0.5,
      0.0,
      0.0,
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    return { vertices, indices, stride: 5 * 4 };
  }

  createBezelGeometry(): GeometryData {
    const sx = this.screenWidth / 2;
    const sy = this.screenHeight / 2;
    const ox = (this.screenWidth + this.bezelSize * 2) / 2;
    const oy = (this.screenHeight + this.bezelSize * 2) / 2;

    const vertices = new Float32Array([
      -ox,
      oy,
      this.depth,
      ox,
      oy,
      this.depth,
      sx,
      sy,
      -this.depth * 0.5,
      -sx,
      sy,
      -this.depth * 0.5,

      -sx,
      -sy,
      -this.depth * 0.5,
      sx,
      -sy,
      -this.depth * 0.5,
      ox,
      -oy,
      this.depth,
      -ox,
      -oy,
      this.depth,

      -ox,
      -oy,
      this.depth,
      -sx,
      -sy,
      -this.depth * 0.5,
      -sx,
      sy,
      -this.depth * 0.5,
      -ox,
      oy,
      this.depth,

      sx,
      -sy,
      -this.depth * 0.5,
      ox,
      -oy,
      this.depth,
      ox,
      oy,
      this.depth,
      sx,
      sy,
      -this.depth * 0.5,

      -ox,
      -oy,
      this.depth,
      ox,
      -oy,
      this.depth,
      ox,
      oy,
      this.depth,
      -ox,
      oy,
      this.depth,
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
      14, 15, 16, 17, 18, 16, 18, 19,
    ]);

    return { vertices, indices, stride: 3 * 4 };
  }
}
