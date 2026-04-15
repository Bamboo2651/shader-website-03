import vertSrc from './shaders/base.vert'
// import fragSrc from './shaders/base.frag'
// import fragSrc from './shaders/displacement.frag'
// import fragSrc from './shaders/rgb-glitch.frag'
// import fragSrc from './shaders/noise-fade.frag'
import fragSrc from './shaders/grid-split.frag'

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

canvas.width = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0, 0, canvas.width, canvas.height)

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
    -1,  1,
     1,  1,
])

const buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

const loc = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(loc)
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

// uniformのロケーションを取得（画像読み込み前でもOK）
const uProgressLoc = gl.getUniformLocation(program, 'uProgress')

const image = new Image()
image.src = '/images/section1.jpg'
image.onload = () => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const uTexture = gl.getUniformLocation(program, 'uTexture')
    gl.uniform1i(uTexture, 0)

    // アニメーションループ
    function render(t) {
        // tはミリ秒なので秒に変換、sin波で0〜1を行き来させる
        const progress = (Math.sin(t * 0.001) + 1) / 2

        gl.uniform1f(uProgressLoc, progress)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}