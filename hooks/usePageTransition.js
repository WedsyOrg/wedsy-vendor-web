import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('left');
  const router = useRouter();

  const navigateWithTransition = (path, transitionDirection = 'left') => {
    setDirection(transitionDirection);
    setIsTransitioning(true);
    
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  useEffect(() => {
    // Reset transition state when route changes
    const handleRouteChange = () => {
      setIsTransitioning(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return {
    isTransitioning,
    direction,
    navigateWithTransition
  };
};
