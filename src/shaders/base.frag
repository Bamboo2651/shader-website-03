precision mediump float;

uniform sampler2D uTexture;
uniform float uProgress;

varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = vec4(uProgress, texColor.g, texColor.b, 1.0);
}