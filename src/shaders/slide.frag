precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform int uEffectIndex; // 0, 1, 2, 3

#define PI 3.14159265359

// --- Utilities ---
vec2 mirror(vec2 v) {
    vec2 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}

vec2 getCoverUV(vec2 uv) {
    float aspect = uResolution.x / uResolution.y;
    float imgAspect = 16.0 / 9.0;
    vec2 ratio = vec2(
        min(aspect / imgAspect, 1.0),
        min(imgAspect / aspect, 1.0)
    );
    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
}

// Random function for noise
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise based on random
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// --- Effects ---

// 0: Displacement (水のような滑らかな歪み)
vec4 effectDisplacement(vec2 uv, float p) {
    float delayValue = p * 7.0 - uv.y * 2.0 + uv.x - 2.0;
    delayValue = clamp(delayValue, 0.0, 1.0);
    
    vec2 acc = vec2(0.5, 2.0);
    vec2 translateValue = p + delayValue * acc;
    vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;
    vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - acc);
    
    float triP = mix(p, 1.0 - p, step(0.5, p)) * 2.0;
    float triDelay = mix(delayValue, 1.0 - delayValue, step(0.5, delayValue)) * 2.0;
    
    vec2 w = sin(sin(uTime * 0.5) * vec2(0.0, 0.3) + uv * vec2(0.0, 4.0)) * vec2(0.0, 0.5);
    vec2 xy = w * (triP * 0.5 + triDelay * 0.5);
    
    vec2 uv1 = uv + translateValue1 + xy;
    vec2 uv2 = uv + translateValue2 + xy;
    
    vec4 t0 = texture2D(uTexture, getCoverUV(mirror(uv1)));
    vec4 t1 = texture2D(uTexture2, getCoverUV(mirror(uv2)));
    
    return mix(t0, t1, delayValue);
}

// 1: RGB Glitch (色収差とデジタルノイズ)
vec4 effectGlitch(vec2 uv, float p) {
    float n = random(vec2(floor(uv.y * 30.0), floor(uTime * 15.0)));
    float shiftX = (n * 2.0 - 1.0) * 0.08 * sin(p * PI);
    
    // chromatic aberration for t0
    float r1 = texture2D(uTexture, getCoverUV(uv + vec2(shiftX, 0.0))).r;
    float g1 = texture2D(uTexture, getCoverUV(uv)).g;
    float b1 = texture2D(uTexture, getCoverUV(uv - vec2(shiftX, 0.0))).b;
    vec4 t0 = vec4(r1, g1, b1, 1.0);
    
    // chromatic aberration for t1
    float r2 = texture2D(uTexture2, getCoverUV(uv + vec2(shiftX * 1.5, 0.0))).r;
    float g2 = texture2D(uTexture2, getCoverUV(uv)).g;
    float b2 = texture2D(uTexture2, getCoverUV(uv - vec2(shiftX * 1.5, 0.0))).b;
    vec4 t1 = vec4(r2, g2, b2, 1.0);

    // block transition
    float blockN = random(floor(uv * vec2(10.0, 40.0)) + uTime * 0.01);
    float blockP = p * 1.5 - 0.25; 
    float mask = step(blockP, blockN);
    
    vec4 mixed = mix(t1, t0, mask);
    
    // add horizontal white noise line when p is near 0.5
    float scanline = step(0.98, random(vec2(uv.y, uTime))) * sin(p * PI) * 0.2;
    return mixed + vec4(scanline);
}

// 2: Noise Fade (ノイズによる侵食とディゾルブ)
vec4 effectNoiseFade(vec2 uv, float p) {
    float n = noise(uv * 10.0 + vec2(uTime * 0.2, uTime * 0.1));
    float mappedP = p * 2.0 - 0.5; // [-0.5, 1.5]
    float mask = smoothstep(mappedP - 0.15, mappedP + 0.15, n);
    
    vec2 disp = vec2((n - 0.5) * 0.05 * sin(p * PI));
    vec4 t0 = texture2D(uTexture, getCoverUV(uv + disp));
    vec4 t1 = texture2D(uTexture2, getCoverUV(uv - disp));
    
    // 境界に炎のようなエッジエフェクトをつける
    float fringe = smoothstep(mappedP - 0.2, mappedP + 0.2, n) - smoothstep(mappedP - 0.05, mappedP + 0.05, n);
    vec4 flame = vec4(2.0, 0.8, 0.2, 1.0); 
    
    vec4 mixed = mix(t1, t0, mask);
    return mixed + flame * fringe * sin(p * PI) * 0.8;
}

// 3: Grid Split (グリッド分割とスライド拡大)
vec4 effectGridSplit(vec2 uv, float p) {
    vec2 gridCount = vec2(5.0, 5.0);
    vec2 gridId = floor(uv * gridCount);
    float n = random(gridId);
    
    float mappedP = p * 1.5 - 0.25;
    float mask = step(mappedP, n);
    
    float cellDist = abs(mappedP - n);
    float localScale = 1.0 + cellDist * 0.8 * sin(p * PI);
    
    vec2 center = (gridId + 0.5) / gridCount;
    vec2 zoomUv = center + (uv - center) * localScale;
    
    float dir = mod(gridId.x, 2.0) == 0.0 ? 1.0 : -1.0;
    
    // t0 (遷移前の画像) は p に比例してスライドアウトする (p=0 のとき 0)
    vec2 slideOffset0 = vec2(0.0, p * 0.2 * dir);
    // t1 (遷移後の画像) は (p-1) に比例してスライドインする (p=1 のとき 0)
    vec2 slideOffset1 = vec2(0.0, (p - 1.0) * 0.2 * dir);
    
    vec4 t0 = texture2D(uTexture, getCoverUV(zoomUv + slideOffset0));
    vec4 t1 = texture2D(uTexture2, getCoverUV(zoomUv + slideOffset1));
    
    return mix(t1, t0, mask);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    vec4 color = vec4(0.0);
    
    // uEffectIndexを使ってトランジションエフェクトを切り替え
    if (uEffectIndex == 0) {
        color = effectDisplacement(uv, uProgress);
    } else if (uEffectIndex == 1) {
        color = effectGlitch(uv, uProgress);
    } else if (uEffectIndex == 2) {
        color = effectNoiseFade(uv, uProgress);
    } else {
        color = effectGridSplit(uv, uProgress);
    }
    
    gl_FragColor = color;
}