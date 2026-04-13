import vertSrc from './shaders/base.vert'
import fragSrc from './shaders/base.frag'

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

// 画像を読み込んでテクスチャとしてGPUに送る
const image = new Image()
image.src = '/images/section1.jpg'
image.onload = () => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // シェーダーのuTextureにテクスチャを渡す
    const uTexture = gl.getUniformLocation(program, 'uTexture')
    gl.uniform1i(uTexture, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}