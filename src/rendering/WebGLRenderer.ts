import { ITerminalSource } from "../core/ITerminalSource";
import { createProgram } from "../utils/shader";
import { perspective, lookAt, rotateY } from "../utils/matrix";
import { screenVertexShader, screenFragmentShader } from "./screenShader";
import { CRTMonitor } from "../geometry/CRTMonitor";

export class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;
  private terminalSource: ITerminalSource;

  private screenProgram: WebGLProgram;

  private screenVertexBuffer: WebGLBuffer;
  private screenIndexBuffer: WebGLBuffer;

  private texture: WebGLTexture;

  private screenProjLoc: WebGLUniformLocation | null;
  private screenViewLoc: WebGLUniformLocation | null;
  private screenModelLoc: WebGLUniformLocation | null;
  private screenTimeLoc: WebGLUniformLocation | null;
  private screenResLoc: WebGLUniformLocation | null;

  private viewMatrix: Float32Array;
  private monitor: CRTMonitor;

  private screenIndexCount: number;

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

    this.viewMatrix = lookAt([0, 0, 1.0], [0, 0, 0], [0, 1, 0]);

    this.screenVertexBuffer = this.gl.createBuffer()!;
    this.screenIndexBuffer = this.gl.createBuffer()!;
    this.screenIndexCount = 0;

    this.updateScreenGeometry(1.0);

    this.texture = this.createTexture();

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.resize();
    window.addEventListener("resize", () => this.resize());
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

  private updateScreenGeometry(aspect: number): void {
    const screenGeometry = this.monitor.createScreenGeometry(aspect);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.screenVertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      screenGeometry.vertices,
      this.gl.STATIC_DRAW,
    );

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.screenIndexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      screenGeometry.indices,
      this.gl.STATIC_DRAW,
    );

    this.screenIndexCount = screenGeometry.indices.length;
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const aspect = this.canvas.width / this.canvas.height;
    this.updateScreenGeometry(aspect);

    const projMatrix = perspective(Math.PI / 2, aspect, 0.1, 100.0);

    this.gl.useProgram(this.screenProgram);
    this.gl.uniformMatrix4fv(this.screenProjLoc, false, projMatrix);
    this.gl.uniformMatrix4fv(this.screenViewLoc, false, this.viewMatrix);
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
}
