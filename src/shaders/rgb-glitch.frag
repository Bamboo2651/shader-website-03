precision mediump float;

uniform sampler2D uTexture;
uniform float uProgress;

varying vec2 vUv;

void main() {
    // 中間で最大になる強さ
    float strength = sin(uProgress * 3.14);

    // RGBそれぞれ別のUVでサンプリング
    float r = texture2D(uTexture, vUv + vec2(strength * 0.05, 0.0)).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - vec2(strength * 0.02, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
}