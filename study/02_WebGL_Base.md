# WebGLベースシステムとトランジション

## 1. `transition.js` の役割
ここでは生の WebGL API を叩いて、四角形（ポリゴン）を1枚画面いっぱいに描き、そこに2枚の画像を「テクスチャ」として貼り付けています。

### 無限ループスクロールの仕組み
画像のインデックスは 0, 1, 2, 3 の4つですが、スクロール値は 4, 5, 6... や逆に -1, -2... と無限に増減する可能性があります。
そこで「モジュロ演算（割り算の余り）」を使うことで、値がいくつになっても安全にインデックスを取り出しています。
```javascript
const maxIdx = textures.length;
// マイナスの値でも正しくループさせるためのモジュロ処理
const idx0 = ((floorProgress % maxIdx) + maxIdx) % maxIdx;
const idx1 = ((idx0 + 1) % maxIdx);
```
これにより、どこまでスクロールしても `idx0`（今の画像）と `idx1`（次の画像）が確実に `0〜3` の範囲に収まり、無限スクロールが実現できています。

### Uniform変数の送信
JavaScript からシェーダーへ送っているデータ（Uniform）は以下の通りです。
- `uTexture`: 遷移「前」の画像 (TEXTURE0)
- `uTexture2`: 遷移「後」の画像 (TEXTURE1)
- `uProgress`: 0.0 〜 1.0 のトランジション進行度
- `uEffectIndex`: 今どのエフェクトを発動させるか (0〜3 の整数)
- `uTime`: 常に増え続ける時間（波などのアニメーションに使う）

## 2. `base.vert` の役割
頂点シェーダー（バーテックスシェーダー）です。画面全体を覆う四角形を作っています。
```glsl
attribute vec2 position;
varying vec2 vUv;

void main(){
    vUv = position * 0.5 + 0.5; // -1〜1 の座標を 0〜1のUV座標に変換
    gl_Position = vec4(position, 0.0, 1.0);
}
```
ここからフラグメントシェーダー（`slide.frag`）へバトンタッチし、ピクセルごとの色を計算します。
