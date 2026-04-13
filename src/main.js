import vertSrc from './shaders/base.vert'
import fragSrc from './shaders/base.frag'

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

// canvasのサイズをウィンドウに合わせる
canvas.width = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0, 0, canvas.width, canvas.height)

// シェーダーをコンパイルする
function createShader(type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

// プログラムを作る
const vert = createShader(gl.VERTEX_SHADER, vertSrc)
const frag = createShader(gl.FRAGMENT_SHADER, fragSrc)
const program = gl.createProgram()
gl.attachShader(program, vert)
gl.attachShader(program, frag)
gl.linkProgram(program)
gl.useProgram(program)

// 画面全体を覆う四角形の頂点
const positions = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1,
])

// GPUに頂点データを送る
const buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

// シェーダーのposition変数とバッファを繋げる
const loc = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(loc)
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

// 描画
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)