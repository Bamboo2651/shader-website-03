import vertSrc  from './shaders/base.vert?raw'
import fragSrc  from './shaders/slide.frag?raw'

const canvas = document.getElementById('canvas')
const gl     = canvas.getContext('webgl')

canvas.width  = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0, 0, canvas.width, canvas.height)

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

function createShader(type, src) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
}

const program = gl.createProgram()
gl.attachShader(program, createShader(gl.VERTEX_SHADER,   vertSrc))
gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragSrc))
gl.linkProgram(program)
gl.useProgram(program)

const buf = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buf)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

const posLoc = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(posLoc)
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

const uTextureLoc    = gl.getUniformLocation(program, 'uTexture')
const uTexture2Loc   = gl.getUniformLocation(program, 'uTexture2')
const uProgressLoc   = gl.getUniformLocation(program, 'uProgress')
const uResolutionLoc = gl.getUniformLocation(program, 'uResolution')
const uTimeLoc       = gl.getUniformLocation(program, 'uTime') // ◀ 追加
const uEffectIndexLoc= gl.getUniformLocation(program, 'uEffectIndex') // ◀ エフェクト番号用

function loadTexture(src) {
    return new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
            const tex = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            resolve(tex)
        }
    })
}

let textures = []

// scrollProgress の「生の値」と「イージング後の値」を別管理
let rawProgress      = 0   // setScrollProgress() から受け取る値
let smoothProgress   = 0   // 整数にスナップしながら追従する値

export function setScrollProgress(val) {
    rawProgress = val
}

export async function init(imagePaths) {
    textures = await Promise.all(imagePaths.map(loadTexture))
    render()
}

function render() {
    smoothProgress = rawProgress;
    const nearest = Math.round(rawProgress);
    const floorProgress = Math.floor(smoothProgress)
    const slideProgress = smoothProgress - floorProgress
    
    // 現在のテクスチャインデックス (マイナス対応のモジュロ)
    const maxIdx = textures.length
    const idx0 = ((floorProgress % maxIdx) + maxIdx) % maxIdx
    const idx1 = ((idx0 + 1) % maxIdx)
    
    // uEffectIndex を計算 (トランジションの種類は、出発元のインデックスに依存する)
    const effectIndex = idx0

    // HTMLのテキストをスクロールに合わせて表示させる
    const nearestIdx = ((nearest % maxIdx) + maxIdx) % maxIdx
    const sections = document.querySelectorAll('.section');
    sections.forEach((sec, i) => {
        if (i === nearestIdx) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    // インジケーター(ドット)の更新がある場合のため
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((ind, i) => {
        if (i === nearestIdx) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textures[idx0])
    gl.uniform1i(uTextureLoc, 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, textures[idx1])
    gl.uniform1i(uTexture2Loc, 1)

    gl.uniform1f(uProgressLoc, slideProgress)
    gl.uniform1i(uEffectIndexLoc, effectIndex)
    gl.uniform2f(uResolutionLoc, canvas.width, canvas.height)
    
    // ◀ 追加: 時間を秒単位でシェーダーに送る
    gl.uniform1f(uTimeLoc, performance.now() / 1000.0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    requestAnimationFrame(render)
}