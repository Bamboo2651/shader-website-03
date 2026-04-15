precision mediump float;

uniform sampler2D uTexture;
uniform float uProgress;

varying vec2 vUv;

// 疑似乱数（UV座標からランダムな0〜1の値を生成）
float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // ノイズ値を計算（グリッドで粗さを調整）
    float noise = random(floor(vUv * 20.0) / 20.0);

    // progressでthresholdを動かす（0→1で画像が消えていく）
    float alpha = smoothstep(uProgress - 0.1, uProgress + 0.1, noise);

    gl_FragColor = vec4(texColor.rgb, alpha);
}