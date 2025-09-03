// src/components/HeroCarousel.jsx

import React, { useState, useEffect } from 'react'; // Changed to useState and useEffect
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase'; // Import Supabase client

// --- THIS IS THE ONLY PART THAT HAS CHANGED ---
// The hardcoded 'slides' array is now gone.
// Instead, we will fetch this data from your database.

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]); // State to hold the slides from the database
  const [loading, setLoading] = useState(true); // State to handle loading
  const [i, setI] = useState(0);

  // This useEffect fetches your newest products to use as slides.
  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, image_url, category') // Fetch all the data we need
        .not('image_url', 'is', null) // Only get products that have an image
        .order('created_at', { ascending: false })
        .limit(3); // Get the 3 newest products

      if (error) {
        console.error("Error fetching slides:", error);
      } else {
        // We transform the database data into the EXACT same format your original code used.
        const formattedSlides = data.map(p => ({
          id: p.id,
          title: p.name,
          subtitle: p.description.substring(0, 50) + '...', // Use a short part of the description
          cta: `Shop ${p.category}`,
          to: `/product/${p.id}`, // Link directly to the product
          img: p.image_url,
        }));
        setSlides(formattedSlides);
      }
      setLoading(false);
    };

    fetchSlides();
  }, []);

  // This is your original, correct auto-play logic.
  useEffect(() => {
    if (slides.length > 0) {
      const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
      return () => clearInterval(t);
    }
  }, [slides]); // This effect now depends on the slides being loaded

  // If the slides are still loading or if none were found, we show a simple placeholder.
  if (loading || slides.length === 0) {
    return <div className='relative h-[56vh] min-h-[380px] w-full bg-gray-200'></div>;
  }
  
  // This is your original, beautiful carousel code. It is UNCHANGED.
  const s = slides[i];
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