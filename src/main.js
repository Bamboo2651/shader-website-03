import { init, triggerTransition } from './transition.js'

const imagePaths = [
    '/images/section1.jpg',
    '/images/section2.jpg',
    '/images/section3.jpg',
    '/images/section4.jpg',
]

init(imagePaths)

const sections = document.querySelectorAll('.section')

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index)
            triggerTransition(index)
        }
    })
}, {
    threshold: 0.5  // 50%以上見えたら発火
})

sections.forEach(section => observer.observe(section))