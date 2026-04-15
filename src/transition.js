import vertSrc from './shaders/base.vert'
import fragSrc from './shaders/displacement.frag'

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

canvas.width = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0, 0, canvas.width, canvas.height)

// アルファブレンドを有効化（noise-fadeのalphaを反映するため）
gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

function createShader(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
}

const vert = createShader(gl.VERTEX_SHADER, vertSrc)
const frag = createShader(gl.FRAGMENT_SHADER, fragSrc)
const program = gl.createProgram()
gl.attachShader(program, vert)
gl.attachShader(program, frag)
gl.linkProgram(program)
gl.useProgram(program)

const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
])

const buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

const loc = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(loc)
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

const uTextureLoc = gl.getUniformLocation(program, 'uTexture')
const uProgressLoc = gl.getUniformLocation(program, 'uProgress')

// テクスチャを画像URLから生成する関数
function loadTexture(src) {
    return new Promise((resolve) => {
        const image = new Image()
        image.src = src
        image.onload = () => {
            const texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            resolve(texture)
        }
    })
}

let textures = []
let currentIndex = 0
let progress = 0
let targetProgress = 0

// 外部から呼ばれる：セクション切り替えのトリガー
export function triggerTransition(nextIndex) {
    currentIndex = nextIndex
    targetProgress = 0
    progress = 0
    targetProgress = 1
}

export async function init(imagePaths) {
    // 全画像を事前にロード
    textures = await Promise.all(imagePaths.map(loadTexture))

    function render() {
        // なめらかにtargetに近づく
        progress += (targetProgress - progress) * 0.05

        // 現在のテクスチャをセット
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textures[currentIndex])
        gl.uniform1i(uTextureLoc, 0)
        gl.uniform1f(uProgressLoc, progress)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        requestAnimationFrame(render)
    }

    render()
}