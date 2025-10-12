import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children, direction = 'left' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleExit = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(path);
    }, 300); // Match transition duration
  };

  // Enhanced animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      x: direction === 'left' ? '100%' : '-100%',
      scale: 0.95,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      x: direction === 'left' ? '-100%' : '100%',
      scale: 0.95,
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <motion.div
      className="w-full h-screen overflow-hidden"
      initial="initial"
      animate={isVisible ? "in" : "initial"}
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        position: 'relative'
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
