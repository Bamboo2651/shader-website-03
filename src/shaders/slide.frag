precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uTime;        // JSから受け取る時間
uniform vec2 uResolution;

#define PI 3.14159265359

// --- ここから提示していただいた関数 ---
vec2 mirror(vec2 v) {
    vec2 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}

float tri(float p) {
    return mix(p, 1.0 - p, step(0.5, p)) * 2.0;
}

// --- 画像のアスペクト比を16:9に保つ関数（歪み防止） ---
vec2 getCoverUV(vec2 uv) {
    float aspect = uResolution.x / uResolution.y;
    float imgAspect = 16.0 / 9.0; // 使用する画像が正方形などの場合はここを変更してください
    
    vec2 ratio = vec2(
        min(aspect / imgAspect, 1.0),
        min(imgAspect / aspect, 1.0)
    );
    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    vec2 vuv1 = uv - 0.5;
    vuv1 *= vec2(1.0, uResolution.y / uResolution.x);
    vuv1 += 0.5;
    
    // Shadertoyの自動ループの代わりに、スクロール値(0.0〜1.0)を使用
    float p = uProgress;
    
    float delayValue = p * 7.0 - uv.y * 2.0 + uv.x - 2.0;
    delayValue = clamp(delayValue, 0.0, 1.0);
    
    vec2 acc = vec2(0.5, 2.0);
    
    vec2 translateValue = p + delayValue * acc;
    vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;
    vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - acc);
    
    // iTimeの代わりに uTime を使って常に波打たせる
    vec2 w = sin(sin(uTime) * vec2(0.0, 0.3) + uv * vec2(0.0, 4.0)) * vec2(0.0, 0.5);
    vec2 xy = w * (tri(p) * 0.5 + tri(delayValue) * 0.5);
    
    vec2 uv1 = vuv1 + translateValue1 + xy;
    vec2 uv2 = vuv1 + translateValue2 + xy;
    
    // 最後にアスペクト比を補正してテクスチャをサンプリング
    vec4 t0 = texture2D(uTexture, getCoverUV(mirror(uv1)));
    vec4 t1 = texture2D(uTexture2, getCoverUV(mirror(uv2)));
    
    gl_FragColor = mix(t0, t1, delayValue);
}