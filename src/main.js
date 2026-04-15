import { init, setScrollProgress } from './transition.js'

const imagePaths = [
    '/images/section1.jpg',
    '/images/section2.jpg',
    '/images/section3.jpg',
    '/images/section4.jpg',
]

const TOTAL = imagePaths.length
let scrollProgress = 0   // 0.0〜(TOTAL-1).0 の連続値

// ── ホイール ──────────────────────────
window.addEventListener('wheel', (e) => {
    e.preventDefault()
    // deltaY をそのまま加算。感度は divisor で調整
    scrollProgress += e.deltaY / 1000
    scrollProgress = Math.max(0, Math.min(TOTAL - 1, scrollProgress))
    setScrollProgress(scrollProgress)
}, { passive: false })

// ── タッチ ────────────────────────────
let touchStartY = 0
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY
}, { passive: true })

window.addEventListener('touchmove', (e) => {
    e.preventDefault()
    const dy = touchStartY - e.touches[0].clientY
    touchStartY = e.touches[0].clientY
    scrollProgress += dy / 400
    scrollProgress = Math.max(0, Math.min(TOTAL - 1, scrollProgress))
    setScrollProgress(scrollProgress)
}, { passive: false })

init(imagePaths)