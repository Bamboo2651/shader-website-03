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

            // 全セクションからactiveを外して、現在のだけ付ける
            sections.forEach(s => s.classList.remove('active'))
            entry.target.classList.add('active')
        }
    })
}, {
    threshold: 0.5
})

sections.forEach(section => observer.observe(section))