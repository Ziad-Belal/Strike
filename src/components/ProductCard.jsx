import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { Badge } from './atoms.jsx'

export default function ProductCard({ product }) {
  const [hover, setHover] = React.useState(false)
  const navigate = useNavigate()
  return (
    <div className='group cursor-pointer' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => navigate(`/product/${product.id}`)}>
      <div className='relative overflow-hidden rounded-3xl bg-black/3'>
        <img src={hover ? product.hoverImg : product.img} alt={product.name} className='aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105'/>
        <div className='absolute left-3 top-3 flex gap-2'>
          {product.badges?.map(b => <Badge key={b} className='bg-white/90 backdrop-blur'>{b}</Badge>)}
        </div>
        <button className='absolute right-3 top-3 rounded-full bg-white/90 p-2 backdrop-blur hover:bg-white'><Heart size={18}/></button>
      </div>
      <div className='mt-3 flex items-start justify-between gap-4'>
        <div>
          <div className='text-xs text-black/60'>{product.sport}</div>
          <div className='font-medium leading-tight'>{product.name}</div>
          <div className='flex items-center gap-1 text-sm text-black/70'>
            <Star size={16} className='fill-black'/> {product.rating}
          </div>
        </div>
        <div className='text-right font-semibold'>${product.price.toFixed(2)}</div>
      </div>
    </div>
  )
}
