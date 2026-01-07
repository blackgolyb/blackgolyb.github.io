export const bezelVertexShader = `
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

export const bezelFragmentShader = `
precision mediump float;
varying vec3 vPos;

void main() {
  vec3 bezelColor = vec3(0.12, 0.12, 0.13);

  vec3 normal = normalize(vec3(0.0, 0.0, 1.0));
  vec3 lightDir = normalize(vec3(0.3, 0.5, 1.0));
  float diff = max(dot(normal, lightDir), 0.0) * 0.3 + 0.7;

  bezelColor *= diff;

  gl_FragColor = vec4(bezelColor, 1.0);
}
`;
