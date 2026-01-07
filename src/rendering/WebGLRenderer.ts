import { ITerminalSource } from "../core/ITerminalSource";
import { createProgram } from "../utils/shader";
import { perspective, lookAt, rotateY } from "../utils/matrix";
import { screenVertexShader, screenFragmentShader } from "./screenShader";
import { bezelVertexShader, bezelFragmentShader } from "./bezelShader";
import { CRTMonitor } from "../geometry/CRTMonitor";

export class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;
  private terminalSource: ITerminalSource;

  private screenProgram: WebGLProgram;
  private bezelProgram: WebGLProgram;

  private screenVertexBuffer: WebGLBuffer;
  private screenIndexBuffer: WebGLBuffer;
  private bezelVertexBuffer: WebGLBuffer;
  private bezelIndexBuffer: WebGLBuffer;

  private texture: WebGLTexture;

  private screenProjLoc: WebGLUniformLocation | null;
  private screenViewLoc: WebGLUniformLocation | null;
  private screenModelLoc: WebGLUniformLocation | null;
  private screenTimeLoc: WebGLUniformLocation | null;
  private screenResLoc: WebGLUniformLocation | null;

  private bezelProjLoc: WebGLUniformLocation | null;
  private bezelViewLoc: WebGLUniformLocation | null;
  private bezelModelLoc: WebGLUniformLocation | null;

  private viewMatrix: Float32Array;
  private monitor: CRTMonitor;

  private screenIndexCount: number;
  private bezelIndexCount: number;

  constructor(canvasId: string, terminalSource: ITerminalSource) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas ${canvasId} not found`);
    }
    this.canvas = canvas;

    const glContext = canvas.getContext("webgl");
    if (!glContext) {
      throw new Error("WebGL not supported");
    }
    this.gl = glContext;
    this.terminalSource = terminalSource;

    this.monitor = new CRTMonitor();

    this.screenProgram = createProgram(
      this.gl,
      screenVertexShader,
      screenFragmentShader,
    );
    this.bezelProgram = createProgram(
      this.gl,
      bezelVertexShader,
      bezelFragmentShader,
    );

    this.screenProjLoc = this.gl.getUniformLocation(
      this.screenProgram,
      "projMatrix",
    );
    this.screenViewLoc = this.gl.getUniformLocation(
      this.screenProgram,
      "viewMatrix",
    );
    this.screenModelLoc = this.gl.getUniformLocation(
      this.screenProgram,
      "modelMatrix",
    );
    this.screenTimeLoc = this.gl.getUniformLocation(this.screenProgram, "time");
    this.screenResLoc = this.gl.getUniformLocation(this.screenProgram, "res");

    this.bezelProjLoc = this.gl.getUniformLocation(
      this.bezelProgram,
      "projMatrix",
    );
    this.bezelViewLoc = this.gl.getUniformLocation(
      this.bezelProgram,
      "viewMatrix",
    );
    this.bezelModelLoc = this.gl.getUniformLocation(
      this.bezelProgram,
      "modelMatrix",
    );

    this.viewMatrix = lookAt([0, 0, 3.0], [0, 0, 0], [0, 1, 0]);

    const screenGeometry = this.monitor.createScreenGeometry();
    const bezelGeometry = this.monitor.createBezelGeometry();

    this.screenVertexBuffer = this.createBuffer(screenGeometry.vertices);
    this.screenIndexBuffer = this.createIndexBuffer(screenGeometry.indices);
    this.bezelVertexBuffer = this.createBuffer(bezelGeometry.vertices);
    this.bezelIndexBuffer = this.createIndexBuffer(bezelGeometry.indices);

    this.screenIndexCount = screenGeometry.indices.length;
    this.bezelIndexCount = bezelGeometry.indices.length;

    this.texture = this.createTexture();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  private createBuffer(data: Float32Array): WebGLBuffer {
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create buffer");
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  private createIndexBuffer(data: Uint16Array): WebGLBuffer {
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create index buffer");
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  private createTexture(): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error("Failed to create texture");
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE,
    );
    return texture;
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const aspect = this.canvas.width / this.canvas.height;
    const projMatrix = perspective(Math.PI / 4, aspect, 0.1, 100.0);

    this.gl.useProgram(this.screenProgram);
    this.gl.uniformMatrix4fv(this.screenProjLoc, false, projMatrix);
    this.gl.uniformMatrix4fv(this.screenViewLoc, false, this.viewMatrix);

    this.gl.useProgram(this.bezelProgram);
    this.gl.uniformMatrix4fv(this.bezelProjLoc, false, projMatrix);
    this.gl.uniformMatrix4fv(this.bezelViewLoc, false, this.viewMatrix);
  }

  render(time: number): void {
    if (!this.terminalSource.isReady()) {
      return;
    }

    const termCanvas = this.terminalSource.getCanvas();
    if (!termCanvas) {
      return;
    }

    const modelMatrix = rotateY(0);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      termCanvas,
    );

    this.renderScreen(time, modelMatrix);
  }

  private renderScreen(time: number, modelMatrix: Float32Array): void {
    this.gl.useProgram(this.screenProgram);
    this.gl.uniformMatrix4fv(this.screenModelLoc, false, modelMatrix);
    this.gl.uniform1f(this.screenTimeLoc, time * 0.001);
    this.gl.uniform2f(this.screenResLoc, this.canvas.width, this.canvas.height);

    const texLoc = this.gl.getUniformLocation(this.screenProgram, "tex");
    this.gl.uniform1i(texLoc, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.screenVertexBuffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.screenIndexBuffer);

    const screenPosLoc = this.gl.getAttribLocation(this.screenProgram, "pos");
    const screenTexLoc = this.gl.getAttribLocation(
      this.screenProgram,
      "texCoord",
    );

    this.gl.enableVertexAttribArray(screenPosLoc);
    this.gl.enableVertexAttribArray(screenTexLoc);

    const screenStride = 5 * 4;
    this.gl.vertexAttribPointer(
      screenPosLoc,
      3,
      this.gl.FLOAT,
      false,
      screenStride,
      0,
    );
    this.gl.vertexAttribPointer(
      screenTexLoc,
      2,
      this.gl.FLOAT,
      false,
      screenStride,
      3 * 4,
    );

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.screenIndexCount,
      this.gl.UNSIGNED_SHORT,
      0,
    );
  }

  private renderBezel(modelMatrix: Float32Array): void {
    this.gl.useProgram(this.bezelProgram);
    this.gl.uniformMatrix4fv(this.bezelModelLoc, false, modelMatrix);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bezelVertexBuffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.bezelIndexBuffer);

    const bezelPosLoc = this.gl.getAttribLocation(this.bezelProgram, "pos");
    this.gl.enableVertexAttribArray(bezelPosLoc);

    const bezelStride = 3 * 4;
    this.gl.vertexAttribPointer(
      bezelPosLoc,
      3,
      this.gl.FLOAT,
      false,
      bezelStride,
      0,
    );

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.bezelIndexCount,
      this.gl.UNSIGNED_SHORT,
      0,
    );
  }
}
