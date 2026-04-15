# Shader解説: RGB Glitch (色収差とノイズ)

`slide.frag` 内に記述されている `effectGlitch` 関数についての解説です。
テレビの電波障害のようなノイズと、赤・緑・青のチャンネルが分裂する「色収差（Chromatic Aberration）」を組み合わせたサイバーなエフェクトです。

## ブロックノイズの生成
ランダム関数 `random` を使い、画面をヨコ縞模様（ブロック）に分割しています。
```glsl
float blockN = random(floor(uv * vec2(10.0, 40.0)) + uTime * 0.01);
```
`uv` を `floor(uv * vec2(10.0, 40.0))` のようにスケーリングしてから切り捨てることで、画面が 10×40 個の四角いブロック（グリッド）として認識され、ブロックごとに異なるランダム値が割り当てられます。
これを `p` と比較 (`step`) することで、進行度に合わせてランダムなブロック単位で次の画像に切り替わります。

## 色収差（RGB Shift）
GLSLでは、画像の色（`vec4`）の中からR・G・Bだけを個別に抽出することができます。抽出するときに、読み込むUV座標（サンプリング位置）をズラすことで、3Dメガネを通したようなフチの色のズレが生じます。
```glsl
// x軸方向にshiftXだけズラした座標から 赤色(r) を取得
float r1 = texture2D(uTexture, getCoverUV(uv + vec2(shiftX, 0.0))).r;
float g1 = texture2D(uTexture, getCoverUV(uv)).g; // 緑はズラさない
float b1 = texture2D(uTexture, getCoverUV(uv - vec2(shiftX, 0.0))).b; // 逆方向にズラした青(b)
```
この `shiftX` の幅もランダム値や `sin(p * PI)` を使って計算されているため、トランジションの真っ最中だけ激しく色がズレて、切り替わり完了時にはピタッと元に戻ります。
