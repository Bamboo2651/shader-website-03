import { init, setScrollProgress } from './transition.js'

const imagePaths = [
    '/images/section1.jpg',
    '/images/section2.jpg',
    '/images/section3.jpg',
    '/images/section4.jpg',
]

let currentIndex = 0;
let targetIndex = 0;
let isAnimating = false;
let throttleWheel = false;

// イージング関数 (Ease In Out Cubic - 緩急をつける)
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function triggerScroll(direction) {
    targetIndex += direction;
    isAnimating = true;
    
    const startProgress = currentIndex;
    const endProgress = targetIndex;
    const duration = 1200; // アニメーションにかける時間(ms)
    let startTime = null;
    
    function animate(time) {
        if (!startTime) startTime = time;
        let elapsed = time - startTime;
        let t = Math.min(elapsed / duration, 1.0);
        
        let easedT = easeInOutCubic(t);
        let currentVal = startProgress + (endProgress - startProgress) * easedT;
        
        setScrollProgress(currentVal);
        
        if (t < 1.0) {
            requestAnimationFrame(animate);
        } else {
            currentIndex = targetIndex;
            // アニメーション完了後、少し待って連続スクロールを許可
            setTimeout(() => { isAnimating = false; }, 200);
        }
    }
    requestAnimationFrame(animate);
}

// ── ホイール ──────────────────────────
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isAnimating || throttleWheel) return;

    if (Math.abs(e.deltaY) > 20) {
        const dir = e.deltaY > 0 ? 1 : -1;
        triggerScroll(dir);
        
        // トラックパッドなどの連続発火を抑制
        throttleWheel = true;
        setTimeout(() => { throttleWheel = false; }, 1500);
    }
}, { passive: false });

// ── タッチ ────────────────────────────
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isAnimating) return;

    const dy = touchStartY - e.touches[0].clientY;
    
    if (Math.abs(dy) > 30) {
        const dir = dy > 0 ? 1 : -1;
        triggerScroll(dir);
    }
}, { passive: false });

init(imagePaths);