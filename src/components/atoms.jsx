// src/components/atoms.jsx

import React, { useEffect } from 'react'; // --- THIS IS THE ONLY ADDITION ON THIS LINE ---
import { motion, AnimatePresence } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';

export const Button = ({ className = '', variant = 'default', size = 'md', asChild = false, children, ...props }) => {
  const Comp = asChild ? Slot : 'button';
  const base = 'inline-flex items-center justify-center rounded-3xl font-medium transition active:scale-[.98]';
  const variants = {
    default: 'bg-black text-white hover:bg-black/90',
    ghost: 'bg-transparent hover:bg-black/5',
    outline: 'border border-black/10 hover:bg-black/5',
  };
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };
  
  return (
    <Comp className={[base, variants[variant], sizes[size], className].join(' ')} {...props}>{children}</Comp>
  )
}

export const Badge = ({ children, className = '' }) => (
  <span className={['rounded-full border border-black/10 px-2.5 py-1 text-xs font-medium', className].join(' ')}>{children}</span>
)

export const Input = ({ className = '', ...props }) => (
  <input className={['w-full rounded-3xl border border-black/10 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/20', className].join(' ')} {...props} />
)

export const Sheet = ({ open, onClose, side = 'right', children }) => {
  // --- THIS IS THE FINAL, GUARANTEED FIX FOR THE SCROLLING BUG ---
  useEffect(() => {
    // When the sheet is open, we want to prevent the body from scrolling.
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // This is a "cleanup" function. When the sheet closes, we always
    // make sure to re-enable scrolling, no matter what.
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]); // This logic runs every time the 'open' state changes.
  // --- END OF FIX ---

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className='fixed inset-0 z-50' 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className='absolute inset-0 bg-black/40' aria-hidden="true" />
          <motion.div
            className={['absolute bg-white h-full w-full sm:w-[420px] p-4 overflow-y-auto', side === 'right' ? 'right-0' : 'left-0'].join(' ')}
            initial={{ x: side === 'right' ? 400 : -400 }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? 400 : -400 }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div 
        className='fixed inset-0 z-50 flex items-center justify-center p-4'
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className='absolute inset-0 bg-black/40' aria-hidden="true" />
        <motion.div 
          className='relative w-[min(96vw,720px)] rounded-3xl bg-white p-6 shadow-soft'
          initial={{ scale: .96, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: .96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
