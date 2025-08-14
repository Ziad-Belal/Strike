import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  { id: 1, title: 'Own the Run', subtitle: 'Cushion that goes the distance.', cta: 'Shop Men', to: '/men', img: 'https://picsum.photos/seed/strike-hero1/1600/800' },
  { id: 2, title: 'Fresh Drops', subtitle: 'Latest styles, ready to move.', cta: 'New Arrivals', to: '/new-arrivals', img: 'https://picsum.photos/seed/strike-hero2/1600/800' },
  { id: 3, title: 'Score the Deal', subtitle: 'Performance gear on sale.', cta: 'Shop Sales', to: '/sale', img: 'https://picsum.photos/seed/strike-hero3/1600/800' },
]

export default function HeroCarousel() {
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])
  const s = slides[i]
  return (
    <div className='relative h-[56vh] min-h-[380px] w-full overflow-hidden'>
      <AnimatePresence mode='wait'>
        <motion.img key={s.id} src={s.img} alt='hero' className='absolute inset-0 h-full w-full object-cover'
          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}/>
      </AnimatePresence>
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
      <div className='absolute bottom-8 left-1/2 w-[min(96vw,1100px)] -translate-x-1/2 px-4'>
        <div className='max-w-xl text-white'>
          <motion.h2 key={`t-${s.id}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='text-3xl font-bold sm:text-4xl'>{s.title}</motion.h2>
          <motion.p key={`p-${s.id}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='mt-2 text-base sm:text-lg'>{s.subtitle}</motion.p>
          <Link to={s.to} className='mt-4 inline-flex items-center gap-2 rounded-3xl bg-white px-4 py-2 font-medium text-black'>
            {s.cta} →
          </Link>
        </div>
      </div>
    </div>
  )
}
