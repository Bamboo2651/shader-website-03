# UIとスクロールロジックの仕組み

このプロジェクトでは、背景で WebGL のキャンバスが動き、その手前に HTML/CSS の UI が重なる「オーバーレイ構造」を採用しています。

## 1. `index.html` と `style.css` の役割
WebGL (Canvas) は背景として固定（`position: fixed`）されています。その上にテキストやインジケーターのアニメーションを被せています。

### CSS スタッガード（時間差）アニメーション
テキストが下からフワッと順番に現れるようなアニメーションは CSS で制御しています。
```css
.section.active .label { transition-delay: 0.1s; }
.section.active h2 { transition-delay: 0.2s; }
.section.active p { transition-delay: 0.3s; }
```
`transition-delay` を少しずつズラす（スタッガード）ことで、パラパラと順番に出現するリッチな表現を作っています。

## 2. `main.js` の役割 (スクロールとイージング)
`main.js` は、ユーザーのスクロール（マウスホイール、タッチ）を受け取り、それを「心地よいアニメーションの値」に変換してシェーダーに渡す司令塔です。

### 緩急をつける関数 (Ease-In-Out)
ショート動画のように「最初はゆっくり進み、途中でシュッと早く動き、最後にもう一度ゆっくり止まる」ような動きを数学的に作り出しているのが `easeInOutCubic` 関数です。
```javascript
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```
`t`（時間）が 0.0〜1.0 に進むにつれて、曲線的なカーブの値を出力します。

### requestAnimationFrame を使った独自アニメーション
スクロール量（`deltaY`）が一定値を超えたら `triggerScroll()` が発火します。ここでは `requestAnimationFrame` を使って、指定した秒数（1200ms）かけて `currentIndex` から `targetIndex` へ値を滑らかに補間しながら、毎フレーム `setScrollProgress` を呼び出してWebGLへ値を送り続けています。
