(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`attribute vec2 position;\r
varying vec2 vUv;\r
\r
void main(){\r
    vUv = position * 0.5 + 0.5;\r
    gl_Position = vec4(position, 0.0, 1.0);\r
}`,t=`precision highp float;\r
\r
uniform sampler2D uTexture;\r
uniform sampler2D uTexture2;\r
uniform float uProgress;\r
uniform float uTime;\r
uniform vec2 uResolution;\r
uniform int uEffectIndex; // 0, 1, 2, 3\r
\r
#define PI 3.14159265359\r
\r
// --- Utilities ---\r
vec2 mirror(vec2 v) {\r
    vec2 m = mod(v, 2.0);\r
    return mix(m, 2.0 - m, step(1.0, m));\r
}\r
\r
vec2 getCoverUV(vec2 uv) {\r
    float aspect = uResolution.x / uResolution.y;\r
    float imgAspect = 16.0 / 9.0;\r
    vec2 ratio = vec2(\r
        min(aspect / imgAspect, 1.0),\r
        min(imgAspect / aspect, 1.0)\r
    );\r
    return vec2(\r
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,\r
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5\r
    );\r
}\r
\r
// Random function for noise\r
float random(vec2 st) {\r
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\r
}\r
\r
// 2D Noise based on random\r
float noise(vec2 st) {\r
    vec2 i = floor(st);\r
    vec2 f = fract(st);\r
\r
    float a = random(i);\r
    float b = random(i + vec2(1.0, 0.0));\r
    float c = random(i + vec2(0.0, 1.0));\r
    float d = random(i + vec2(1.0, 1.0));\r
\r
    vec2 u = f*f*(3.0-2.0*f);\r
\r
    return mix(a, b, u.x) +\r
            (c - a)* u.y * (1.0 - u.x) +\r
            (d - b) * u.x * u.y;\r
}\r
\r
// --- Effects ---\r
\r
// 0: Displacement (水のような滑らかな歪み)\r
vec4 effectDisplacement(vec2 uv, float p) {\r
    float delayValue = p * 7.0 - uv.y * 2.0 + uv.x - 2.0;\r
    delayValue = clamp(delayValue, 0.0, 1.0);\r
    \r
    vec2 acc = vec2(0.5, 2.0);\r
    vec2 translateValue = p + delayValue * acc;\r
    vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;\r
    vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - acc);\r
    \r
    float triP = mix(p, 1.0 - p, step(0.5, p)) * 2.0;\r
    float triDelay = mix(delayValue, 1.0 - delayValue, step(0.5, delayValue)) * 2.0;\r
    \r
    vec2 w = sin(sin(uTime * 0.5) * vec2(0.0, 0.3) + uv * vec2(0.0, 4.0)) * vec2(0.0, 0.5);\r
    vec2 xy = w * (triP * 0.5 + triDelay * 0.5);\r
    \r
    vec2 uv1 = uv + translateValue1 + xy;\r
    vec2 uv2 = uv + translateValue2 + xy;\r
    \r
    vec4 t0 = texture2D(uTexture, getCoverUV(mirror(uv1)));\r
    vec4 t1 = texture2D(uTexture2, getCoverUV(mirror(uv2)));\r
    \r
    return mix(t0, t1, delayValue);\r
}\r
\r
// 1: RGB Glitch (色収差とデジタルノイズ)\r
vec4 effectGlitch(vec2 uv, float p) {\r
    float n = random(vec2(floor(uv.y * 30.0), floor(uTime * 15.0)));\r
    float shiftX = (n * 2.0 - 1.0) * 0.08 * sin(p * PI);\r
    \r
    // chromatic aberration for t0\r
    float r1 = texture2D(uTexture, getCoverUV(uv + vec2(shiftX, 0.0))).r;\r
    float g1 = texture2D(uTexture, getCoverUV(uv)).g;\r
    float b1 = texture2D(uTexture, getCoverUV(uv - vec2(shiftX, 0.0))).b;\r
    vec4 t0 = vec4(r1, g1, b1, 1.0);\r
    \r
    // chromatic aberration for t1\r
    float r2 = texture2D(uTexture2, getCoverUV(uv + vec2(shiftX * 1.5, 0.0))).r;\r
    float g2 = texture2D(uTexture2, getCoverUV(uv)).g;\r
    float b2 = texture2D(uTexture2, getCoverUV(uv - vec2(shiftX * 1.5, 0.0))).b;\r
    vec4 t1 = vec4(r2, g2, b2, 1.0);\r
\r
    // block transition\r
    float blockN = random(floor(uv * vec2(10.0, 40.0)) + uTime * 0.01);\r
    float blockP = p * 1.5 - 0.25; \r
    float mask = step(blockP, blockN);\r
    \r
    vec4 mixed = mix(t1, t0, mask);\r
    \r
    // add horizontal white noise line when p is near 0.5\r
    float scanline = step(0.98, random(vec2(uv.y, uTime))) * sin(p * PI) * 0.2;\r
    return mixed + vec4(scanline);\r
}\r
\r
// 2: Noise Fade (ノイズによる侵食とディゾルブ)\r
vec4 effectNoiseFade(vec2 uv, float p) {\r
    float n = noise(uv * 10.0 + vec2(uTime * 0.2, uTime * 0.1));\r
    float mappedP = p * 2.0 - 0.5; // [-0.5, 1.5]\r
    float mask = smoothstep(mappedP - 0.15, mappedP + 0.15, n);\r
    \r
    vec2 disp = vec2((n - 0.5) * 0.05 * sin(p * PI));\r
    vec4 t0 = texture2D(uTexture, getCoverUV(uv + disp));\r
    vec4 t1 = texture2D(uTexture2, getCoverUV(uv - disp));\r
    \r
    // 境界に炎のようなエッジエフェクトをつける\r
    float fringe = smoothstep(mappedP - 0.2, mappedP + 0.2, n) - smoothstep(mappedP - 0.05, mappedP + 0.05, n);\r
    vec4 flame = vec4(2.0, 0.8, 0.2, 1.0); \r
    \r
    vec4 mixed = mix(t1, t0, mask);\r
    return mixed + flame * fringe * sin(p * PI) * 0.8;\r
}\r
\r
// 3: Grid Split (グリッド分割とスライド拡大)\r
vec4 effectGridSplit(vec2 uv, float p) {\r
    vec2 gridCount = vec2(5.0, 5.0);\r
    vec2 gridId = floor(uv * gridCount);\r
    float n = random(gridId);\r
    \r
    float mappedP = p * 1.5 - 0.25;\r
    float mask = step(mappedP, n);\r
    \r
    float cellDist = abs(mappedP - n);\r
    float localScale = 1.0 + cellDist * 0.8 * sin(p * PI);\r
    \r
    vec2 center = (gridId + 0.5) / gridCount;\r
    vec2 zoomUv = center + (uv - center) * localScale;\r
    \r
    float dir = mod(gridId.x, 2.0) == 0.0 ? 1.0 : -1.0;\r
    \r
    // t0 (遷移前の画像) は p に比例してスライドアウトする (p=0 のとき 0)\r
    vec2 slideOffset0 = vec2(0.0, p * 0.2 * dir);\r
    // t1 (遷移後の画像) は (p-1) に比例してスライドインする (p=1 のとき 0)\r
    vec2 slideOffset1 = vec2(0.0, (p - 1.0) * 0.2 * dir);\r
    \r
    vec4 t0 = texture2D(uTexture, getCoverUV(zoomUv + slideOffset0));\r
    vec4 t1 = texture2D(uTexture2, getCoverUV(zoomUv + slideOffset1));\r
    \r
    return mix(t1, t0, mask);\r
}\r
\r
void main() {\r
    vec2 uv = gl_FragCoord.xy / uResolution.xy;\r
    \r
    vec4 color = vec4(0.0);\r
    \r
    // uEffectIndexを使ってトランジションエフェクトを切り替え\r
    if (uEffectIndex == 0) {\r
        color = effectDisplacement(uv, uProgress);\r
    } else if (uEffectIndex == 1) {\r
        color = effectGlitch(uv, uProgress);\r
    } else if (uEffectIndex == 2) {\r
        color = effectNoiseFade(uv, uProgress);\r
    } else {\r
        color = effectGridSplit(uv, uProgress);\r
    }\r
    \r
    gl_FragColor = color;\r
}`,n=document.getElementById(`canvas`),r=n.getContext(`webgl`);n.width=window.innerWidth,n.height=window.innerHeight,r.viewport(0,0,n.width,n.height),r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA);function i(e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}var a=r.createProgram();r.attachShader(a,i(r.VERTEX_SHADER,e)),r.attachShader(a,i(r.FRAGMENT_SHADER,t)),r.linkProgram(a),r.useProgram(a);var o=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,o),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),r.STATIC_DRAW);var s=r.getAttribLocation(a,`position`);r.enableVertexAttribArray(s),r.vertexAttribPointer(s,2,r.FLOAT,!1,0,0),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!0);var c=r.getUniformLocation(a,`uTexture`),l=r.getUniformLocation(a,`uTexture2`),u=r.getUniformLocation(a,`uProgress`),d=r.getUniformLocation(a,`uResolution`),f=r.getUniformLocation(a,`uTime`),p=r.getUniformLocation(a,`uEffectIndex`);function m(e){return new Promise(t=>{let n=new Image;n.src=e,n.onload=()=>{let e=r.createTexture();r.bindTexture(r.TEXTURE_2D,e),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,n),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),t(e)}})}var h=[],g=0,_=0;function v(e){g=e}async function y(e){h=await Promise.all(e.map(m)),b()}function b(){_=g;let e=Math.round(g),t=Math.floor(_),i=_-t,a=h.length,o=(t%a+a)%a,s=(o+1)%a,m=o,v=(e%a+a)%a;document.querySelectorAll(`.section`).forEach((e,t)=>{t===v?e.classList.add(`active`):e.classList.remove(`active`)}),document.querySelectorAll(`.indicator`).forEach((e,t)=>{t===v?e.classList.add(`active`):e.classList.remove(`active`)}),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,h[o]),r.uniform1i(c,0),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,h[s]),r.uniform1i(l,1),r.uniform1f(u,i),r.uniform1i(p,m),r.uniform2f(d,n.width,n.height),r.uniform1f(f,performance.now()/1e3),r.drawArrays(r.TRIANGLE_STRIP,0,4),requestAnimationFrame(b)}var x=[`./images/section1.jpg`,`./images/section2.jpg`,`./images/section3.jpg`,`./images/section4.jpg`],S=0,C=0,w=!1,T=!1;function E(e){return e<.5?4*e*e*e:1-(-2*e+2)**3/2}function D(e){C+=e,w=!0;let t=S,n=C,r=null;function i(e){r||=e;let a=e-r,o=Math.min(a/1200,1),s=E(o);v(t+(n-t)*s),o<1?requestAnimationFrame(i):(S=C,setTimeout(()=>{w=!1},200))}requestAnimationFrame(i)}window.addEventListener(`wheel`,e=>{e.preventDefault(),!(w||T)&&Math.abs(e.deltaY)>20&&(D(e.deltaY>0?1:-1),T=!0,setTimeout(()=>{T=!1},1500))},{passive:!1});var O=0;window.addEventListener(`touchstart`,e=>{O=e.touches[0].clientY},{passive:!0}),window.addEventListener(`touchmove`,e=>{if(e.preventDefault(),w)return;let t=O-e.touches[0].clientY;Math.abs(t)>30&&D(t>0?1:-1)},{passive:!1}),y(x);