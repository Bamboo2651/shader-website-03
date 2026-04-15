precision mediump float;

uniform sampler2D uTexture;
uniform float uProgress;

varying vec2 vUv;

void main() {
    //縦方向に波を作り、progressで動かす
    float wave = sin(vUv.y * 10.0 + uProgress * 6.28);

    //progressが0→1→0の山型になるstrength（中間で最大）
    float strength = sin(uProgress * 3.14);

    //X方向にずらすoffset
    vec2 offset = vec2(wave * strength * 0.1, 0.0);

    //ずらしたUV座標でテクスチャを取得
    vec4 texColor = texture2D(uTexture, vUv + offset);

    gl_FragColor = texColor;
}