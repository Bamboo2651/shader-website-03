precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uResolution;

#define PI 3.14159265359

vec2 mirror(vec2 v) {
    vec2 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}

float tri(float p) {
    return mix(p, 1.0 - p, step(0.5, p)) * 2.0;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec2 vuv1 = uv - 0.5;
    vuv1 *= vec2(1.0, uResolution.y / uResolution.x);
    vuv1 += 0.5;

    float p = uProgress;

    float delayValue = p * 7.0 - uv.y * 2.0 + uv.x - 2.0;
    delayValue = clamp(delayValue, 0.0, 1.0);

    vec2 acc = vec2(0.5, 2.0);

    vec2 translateValue = p + delayValue * acc;
    vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;
    vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - acc);

    // uTime依存の揺れをuProgressベースに変更
    vec2 w = sin(vec2(0.0, p * PI) * vec2(0.0, 0.3) + uv * vec2(0.0, 4.0)) * vec2(0.0, 0.5);
    vec2 xy = w * (tri(p) * 0.5 + tri(delayValue) * 0.5);

    vec2 uv1 = vuv1 + translateValue1 + xy;
    vec2 uv2 = vuv1 + translateValue2 + xy;

    vec4 t0 = texture2D(uTexture, mirror(uv1));
    vec4 t1 = texture2D(uTexture2, mirror(uv2));

    gl_FragColor = mix(t0, t1, delayValue);
}