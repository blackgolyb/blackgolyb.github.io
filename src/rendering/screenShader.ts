export const screenVertexShader = `
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

export const screenFragmentShader = `
precision mediump float;
uniform sampler2D tex;
uniform vec2 res;
uniform float time;
varying vec2 uv;

void main() {
  vec2 p = uv;

  p = p * 2.0 - 1.0;
  p *= 1.0 + dot(p, p) * 0.1;
  p = p * 0.5 + 0.5;

  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 c = texture2D(tex, p).rgb;

  float scan = sin(p.y * res.y * 1.5) * 0.04;
  c -= scan;

  c += c * 0.15;

  gl_FragColor = vec4(c, 1.0);
}
`;
