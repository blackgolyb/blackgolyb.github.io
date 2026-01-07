import { Terminal } from "@xterm/xterm";
import { CanvasAddon } from "@xterm/addon-canvas";
import "@xterm/xterm/css/xterm.css";
import "./style.css";

// Initialize terminal
const term = new Terminal({
  fontFamily: "monospace",
  fontSize: 16,
  theme: {
    background: "#000000",
    foreground: "#00ff66",
  },
});

const termElement = document.getElementById("term");
if (!termElement) {
  throw new Error("Terminal element not found");
}

term.open(termElement);

// Load canvas addon to force canvas rendering
const canvasAddon = new CanvasAddon();
term.loadAddon(canvasAddon);

term.write("cool-retro-term in browser\r\n$ ");

// Debug terminal DOM structure after a brief delay
setTimeout(() => {
  console.log("Terminal element:", termElement);
  console.log("Terminal element children:", termElement.children);
  console.log("All canvases in document:", document.querySelectorAll("canvas"));
  const canvas = document.querySelector("#term canvas");
  console.log("Canvas found with #term canvas selector:", canvas);
  console.log(
    "Terminal element HTML:",
    termElement.innerHTML.substring(0, 300),
  );
}, 100);

// Simulate terminal output
setInterval(() => {
  term.write("ping\r\n");
}, 1000);

console.log("Terminal initialized");

/* ------------------ WebGL ------------------ */

const glCanvas = document.getElementById("gl") as HTMLCanvasElement;
if (!glCanvas) {
  throw new Error("Canvas element not found");
}

const glContext = glCanvas.getContext("webgl");
if (!glContext) {
  throw new Error("WebGL not supported");
}

const gl: WebGLRenderingContext = glContext;

/* Shaders with 3D perspective */

// Screen shader (with CRT effects)
const screenVS = `
attribute vec3 pos;
attribute vec2 texCoord;
uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
varying vec2 uv;

void main() {
  uv = texCoord;
  gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}
`;

const screenFS = `
precision mediump float;
uniform sampler2D tex;
uniform vec2 res;
uniform float time;
varying vec2 uv;

void main() {
  vec2 p = uv;

  // barrel distortion
  p = p * 2.0 - 1.0;
  p *= 1.0 + dot(p, p) * 0.1;
  p = p * 0.5 + 0.5;

  // check bounds
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 c = texture2D(tex, p).rgb;

  // scanlines
  float scan = sin(p.y * res.y * 1.5) * 0.04;
  c -= scan;

  // glow
  c += c * 0.15;

  gl_FragColor = vec4(c, 1.0);
}
`;

// Bezel shader (simple shading)
const bezelVS = `
attribute vec3 pos;
uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
varying vec3 vPos;

void main() {
  vPos = pos;
  gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}
`;

const bezelFS = `
precision mediump float;
varying vec3 vPos;

void main() {
  // Dark gray/black bezel with subtle lighting
  vec3 bezelColor = vec3(0.12, 0.12, 0.13);

  // Simple directional lighting
  vec3 normal = normalize(vec3(0.0, 0.0, 1.0));
  vec3 lightDir = normalize(vec3(0.3, 0.5, 1.0));
  float diff = max(dot(normal, lightDir), 0.0) * 0.3 + 0.7;

  bezelColor *= diff;

  gl_FragColor = vec4(bezelColor, 1.0);
}
`;

/* Compile */

function createShader(type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader");
  }
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  // Check compilation status
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${info}`);
  }

  return shader;
}

function createProgram(vsSource: string, fsSource: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create program");
  }

  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);

  // Check linking status
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Program linking failed: ${info}`);
  }

  return program;
}

// Create shader programs
const screenProgram = createProgram(screenVS, screenFS);
const bezelProgram = createProgram(bezelVS, bezelFS);

console.log("WebGL shaders compiled and linked successfully");

/* Matrix helper functions */
function perspective(
  fov: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ]);
}

function lookAt(eye: number[], center: number[], up: number[]): Float32Array {
  const z = [eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]];
  const zLen = Math.sqrt(z[0] * z[0] + z[1] * z[1] + z[2] * z[2]);
  z[0] /= zLen;
  z[1] /= zLen;
  z[2] /= zLen;

  const x = [
    up[1] * z[2] - up[2] * z[1],
    up[2] * z[0] - up[0] * z[2],
    up[0] * z[1] - up[1] * z[0],
  ];
  const xLen = Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
  x[0] /= xLen;
  x[1] /= xLen;
  x[2] /= xLen;

  const y = [
    z[1] * x[2] - z[2] * x[1],
    z[2] * x[0] - z[0] * x[2],
    z[0] * x[1] - z[1] * x[0],
  ];

  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
    -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
    -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
    1,
  ]);
}

function rotateY(angle: number): Float32Array {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
}

/* Setup matrices */
// Screen program uniforms
const screenProjLoc = gl.getUniformLocation(screenProgram, "projMatrix");
const screenViewLoc = gl.getUniformLocation(screenProgram, "viewMatrix");
const screenModelLoc = gl.getUniformLocation(screenProgram, "modelMatrix");
const screenTimeLoc = gl.getUniformLocation(screenProgram, "time");
const screenResLoc = gl.getUniformLocation(screenProgram, "res");

// Bezel program uniforms
const bezelProjLoc = gl.getUniformLocation(bezelProgram, "projMatrix");
const bezelViewLoc = gl.getUniformLocation(bezelProgram, "viewMatrix");
const bezelModelLoc = gl.getUniformLocation(bezelProgram, "modelMatrix");

const viewMatrix = lookAt([0, 0, 4.5], [0, 0, 0], [0, 1, 0]);

// Enable depth test
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

/* Resize function */
function resize(): void {
  glCanvas.width = window.innerWidth;
  glCanvas.height = window.innerHeight;
  gl.viewport(0, 0, glCanvas.width, glCanvas.height);

  // Update projection matrix with new aspect ratio
  const aspect = glCanvas.width / glCanvas.height;
  const projMatrix = perspective(Math.PI / 4, aspect, 0.1, 100.0);

  gl.useProgram(screenProgram);
  gl.uniformMatrix4fv(screenProjLoc, false, projMatrix);
  gl.uniformMatrix4fv(screenViewLoc, false, viewMatrix);

  gl.useProgram(bezelProgram);
  gl.uniformMatrix4fv(bezelProjLoc, false, projMatrix);
  gl.uniformMatrix4fv(bezelViewLoc, false, viewMatrix);
}

window.addEventListener("resize", resize);
resize();

/* 3D CRT Monitor Box with bezel */
// Screen dimensions (inset from bezel)
const screenW = 1.5;
const screenH = 1.0;
const bezelSize = 0.15;
const depth = 0.3;

// Outer bezel dimensions
const outerW = screenW + bezelSize * 2;
const outerH = screenH + bezelSize * 2;

// Screen vertices (position + texCoord)
const sx = screenW / 2;
const sy = screenH / 2;
const screenVertices = new Float32Array([
  // x, y, z, u, v
  -sx,
  -sy,
  -depth * 0.5,
  0.0,
  1.0,
  sx,
  -sy,
  -depth * 0.5,
  1.0,
  1.0,
  sx,
  sy,
  -depth * 0.5,
  1.0,
  0.0,
  -sx,
  sy,
  -depth * 0.5,
  0.0,
  0.0,
]);

const screenIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

// Bezel vertices (just position, no texCoords)
const ox = outerW / 2;
const oy = outerH / 2;
const bezelVertices = new Float32Array([
  // Top bezel
  -ox,
  oy,
  depth,
  ox,
  oy,
  depth,
  sx,
  sy,
  -depth * 0.5,
  -sx,
  sy,
  -depth * 0.5,

  // Bottom bezel
  -sx,
  -sy,
  -depth * 0.5,
  sx,
  -sy,
  -depth * 0.5,
  ox,
  -oy,
  depth,
  -ox,
  -oy,
  depth,

  // Left bezel
  -ox,
  -oy,
  depth,
  -sx,
  -sy,
  -depth * 0.5,
  -sx,
  sy,
  -depth * 0.5,
  -ox,
  oy,
  depth,

  // Right bezel
  sx,
  -sy,
  -depth * 0.5,
  ox,
  -oy,
  depth,
  ox,
  oy,
  depth,
  sx,
  sy,
  -depth * 0.5,

  // Front frame
  -ox,
  -oy,
  depth,
  ox,
  -oy,
  depth,
  ox,
  oy,
  depth,
  -ox,
  oy,
  depth,
]);

const bezelIndices = new Uint16Array([
  // Top
  0, 1, 2, 0, 2, 3,
  // Bottom
  4, 5, 6, 4, 6, 7,
  // Left
  8, 9, 10, 8, 10, 11,
  // Right
  12, 13, 14, 12, 14, 15,
  // Front
  16, 17, 18, 16, 18, 19,
]);

// Create buffers
const screenVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, screenVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, screenVertices, gl.STATIC_DRAW);

const screenIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, screenIndices, gl.STATIC_DRAW);

const bezelVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bezelVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, bezelVertices, gl.STATIC_DRAW);

const bezelIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bezelIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bezelIndices, gl.STATIC_DRAW);

/* Texture from xterm canvas */

const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

/* Render loop */

let termCanvas: HTMLCanvasElement | null = null;
let frameCount = 0;

function draw(t: number): void {
  frameCount++;

  // Get terminal canvas if not yet found
  if (!termCanvas) {
    // Try multiple selectors for different xterm versions
    termCanvas = document.querySelector("#term canvas") as HTMLCanvasElement;

    if (!termCanvas) {
      termCanvas = document.querySelector(
        "#term .xterm-screen canvas",
      ) as HTMLCanvasElement;
    }

    if (!termCanvas) {
      termCanvas = document.querySelector(".xterm canvas") as HTMLCanvasElement;
    }

    if (termCanvas) {
      console.log("Terminal canvas found at frame:", frameCount);
      console.log(
        "Canvas dimensions:",
        termCanvas.width,
        "x",
        termCanvas.height,
      );
    } else {
      if (frameCount < 100 && frameCount % 10 === 0) {
        console.log("Waiting for terminal canvas... frame:", frameCount);
        const termElement = document.getElementById("term");
        console.log(
          "Term element children count:",
          termElement?.children.length,
        );
        console.log(
          "All canvases on page:",
          document.querySelectorAll("canvas").length,
        );
      }
      requestAnimationFrame(draw);
      return;
    }
  }

  // Rotate the monitor slightly
  const rotationAngle = Math.sin(t * 0.0002) * 0.15;
  const modelMatrix = rotateY(rotationAngle);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Prepare texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    termCanvas,
  );

  if (frameCount === 1) {
    console.log(
      "Terminal canvas dimensions:",
      termCanvas.width,
      "x",
      termCanvas.height,
    );
    console.log("GL canvas dimensions:", glCanvas.width, "x", glCanvas.height);
  }

  // Draw screen with terminal texture
  gl.useProgram(screenProgram);
  gl.uniformMatrix4fv(screenModelLoc, false, modelMatrix);
  gl.uniform1f(screenTimeLoc, t * 0.001);
  gl.uniform2f(screenResLoc, glCanvas.width, glCanvas.height);

  // Bind texture to uniform sampler
  const texLoc = gl.getUniformLocation(screenProgram, "tex");
  gl.uniform1i(texLoc, 0); // Use texture unit 0

  gl.bindBuffer(gl.ARRAY_BUFFER, screenVertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndexBuffer);

  const screenPosLoc = gl.getAttribLocation(screenProgram, "pos");
  const screenTexLoc = gl.getAttribLocation(screenProgram, "texCoord");
  gl.enableVertexAttribArray(screenPosLoc);
  gl.enableVertexAttribArray(screenTexLoc);

  const screenStride = 5 * 4; // 5 floats per vertex
  gl.vertexAttribPointer(screenPosLoc, 3, gl.FLOAT, false, screenStride, 0);
  gl.vertexAttribPointer(screenTexLoc, 2, gl.FLOAT, false, screenStride, 3 * 4);

  gl.drawElements(gl.TRIANGLES, screenIndices.length, gl.UNSIGNED_SHORT, 0);

  // Check for GL errors
  const err = gl.getError();
  if (err !== gl.NO_ERROR && frameCount < 5) {
    console.error("WebGL error:", err);
  }

  // Draw bezel - TEMPORARILY DISABLED FOR DEBUGGING
  /*
  gl.useProgram(bezelProgram);
  gl.uniformMatrix4fv(bezelModelLoc, false, modelMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, bezelVertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bezelIndexBuffer);

  const bezelPosLoc = gl.getAttribLocation(bezelProgram, "pos");
  gl.enableVertexAttribArray(bezelPosLoc);
  gl.disableVertexAttribArray(screenTexLoc);

  const bezelStride = 3 * 4; // 3 floats per vertex (no texCoords)
  gl.vertexAttribPointer(bezelPosLoc, 3, gl.FLOAT, false, bezelStride, 0);

  gl.drawElements(gl.TRIANGLES, bezelIndices.length, gl.UNSIGNED_SHORT, 0);
  */

  if (frameCount === 1) {
    console.log("First frame rendered successfully");
    console.log("Screen indices:", screenIndices.length);
    console.log("Bezel indices:", bezelIndices.length);
    console.log(
      "Screen program active:",
      gl.getParameter(gl.CURRENT_PROGRAM) === screenProgram,
    );
  }

  requestAnimationFrame(draw);
}

// Start render loop immediately
console.log("Starting render loop");
draw(0);
