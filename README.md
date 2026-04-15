# shader-website-03

> Shadertoy のエフェクトをスクロール遷移に組み込んだ、かっこいい Web サイトを作る学習プロジェクト。  

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| ビルドツール | [Vite](https://vitejs.dev/) |
| 言語 | Vanilla JavaScript |
| シェーダー | GLSL（WebGL 生API） |
| GLSLファイル読み込み | [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl) |
| スクロール検知 | IntersectionObserver API |

---

## 画面
![alt text](image.png)
スクロールしたら
![alt text](image-1.png)
スクロールし終わる
![alt text](image-2.png)


スクロールするときに、エフェクトを追加し、一風変わったスクロールができる。

---


## プロジェクト構成

```
shader-website-03/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js              # エントリーポイント・セクション初期化
│   ├── transition.js        # WebGL描画・エフェクト切り替え制御
│   ├── shaders/
│   │   ├── base.vert        # 共通 Vertex Shader
│   │   ├── displacement.frag  # エフェクト①：歪み
│   │   ├── rgb-glitch.frag    # エフェクト②：RGBグリッチ
│   │   ├── noise-fade.frag    # エフェクト③：ノイズフェード
│   │   └── grid-split.frag    # エフェクト④：グリッド分割
│   └── style.css
└── public/
    └── images/              # 各セクションの背景画像
        ├── section1.jpg
        ├── section2.jpg
        └── ...
```

---

## セットアップ

- [x] セットアップ（Vite + プラグイン導入）

```bash
# リポジトリ作成 & 移動
mkdir shader-website-03 && cd shader-website-03

# 依存パッケージインストール
npm install

# GLSL ファイルを import できるようにするプラグイン追加
npm install -D vite-plugin-glsl

# 開発サーバー起動
npm run dev
```

### vite.config.js の設定

```js
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [glsl()]
})
```

---

## 実装ステップ（学習の進め方）

### Step 1: WebGL の最小セットアップ
- [x] Step 1: WebGL 最小セットアップ

> **目標:** 画面全体を単色で塗りつぶせる状態にする

### Step 2: テクスチャを表示する
- [x] Step 2: テクスチャ表示

> **目標:** 画像を canvas に表示できる

### Step 3: `progress` uniform を作る
- [x] Step 3: progress uniform

> **目標:** JS ↔ GLSL の橋渡しを理解する

### Step 4: エフェクト① displacement を実装する
- [x] Step 4: displacement エフェクト

> **目標:** Shadertoy のコードを自分のサイトに移植できる

### Step 5: エフェクト②〜④を追加する
- [x] Step 5: 残り3エフェクト（glitch / noise / grid）

> **目標:** 4種類のエフェクトを切り替えられる

### Step 6: スクロールと連動させる
- [x] Step 6: スクロール連動

> **目標:** スクロールするとエフェクト付きでセクションが切り替わる

### Step 7: HTML/CSS でサイトとして仕上げる
- [ ] Step 7: サイト仕上げ

---

## 参考リンク

| 内容 | URL |
|------|-----|
| 参考サイト（TAO TAJIMA） | https://taotajima.jp/ |
| Shadertoy（エフェクト参考） | https://www.shadertoy.com |
| vite-plugin-glsl | https://github.com/UstymUkhman/vite-plugin-glsl |
| WebGL Fundamentals（日本語あり） | https://webglfundamentals.org/webgl/lessons/ja/ |
| The Book of Shaders | https://thebookofshaders.com |
| IntersectionObserver MDN | https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API |

---

## 学習メモ欄

実装中に気づいたことや詰まったポイントをここに記録していく。

```
- 
```
