import { init, triggerTransition } from './transition.js'

const imagePaths = [
    '/images/section1.jpg',
    '/images/section2.jpg',
    '/images/section3.jpg',
    '/images/section4.jpg',
]

const TOTAL = imagePaths.length
let currentIndex = 0
let isTransitioning = false

// スクロール蓄積量
let scrollAccum = 0
const SCROLL_THRESHOLD = 80  // この px 分蓄積したら次へ進む

function goTo(next) {
    if (isTransitioning) return
    if (next < 0 || next >= TOTAL) return
    if (next === currentIndex) return

    isTransitioning = true
    currentIndex = next
    triggerTransition(currentIndex)

    // セクションのactive切り替え
    document.querySelectorAll('.section').forEach((s, i) => {
        s.classList.toggle('active', i === currentIndex)
    })

    // トランジション中は連打を防ぐ（0.03イージング × 約90フレーム ≒ 1.5秒）
    setTimeout(() => { isTransitioning = false }, 1500)
}

// ホイール
window.addEventListener('wheel', (e) => {
    e.preventDefault()
    scrollAccum += e.deltaY

    if (scrollAccum > SCROLL_THRESHOLD) {
        scrollAccum = 0
        goTo(currentIndex + 1)
    } else if (scrollAccum < -SCROLL_THRESHOLD) {
        scrollAccum = 0
        goTo(currentIndex - 1)
    }
}, { passive: false })

// タッチ（スマホ対応）
let touchStartY = 0
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY
})
window.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY
    if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1)
    }
})

// 初期化
init(imagePaths)
document.querySelectorAll('.section')[0]?.classList.add('active')