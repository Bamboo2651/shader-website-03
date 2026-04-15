precision mediump float;

uniform sampler2D uTexture;
uniform float uProgress;

varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // グリッドのセル数
    float cols = 8.0;
    float rows = 6.0;

    // セル番号を計算
    vec2 cell = floor(vUv * vec2(cols, rows));

    // セルごとにランダムなずれ方向を決定
    float dir = random(cell) * 2.0 - 1.0;

    // progressでずれ量を制御
    float strength = sin(uProgress * 3.14);
    vec2 offset = vec2(dir * strength * 0.2, 0.0);

    vec4 texColor = texture2D(uTexture, vUv + offset);

    gl_FragColor = texColor;
}