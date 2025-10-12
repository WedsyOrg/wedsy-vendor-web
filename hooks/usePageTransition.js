import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('left');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigateWithTransition = (path, transitionDirection = 'left') => {
    // Prevent multiple rapid navigations
    if (isTransitioning) return;
    
    setDirection(transitionDirection);
    setIsTransitioning(true);
    setIsLoading(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  const navigateBack = () => {
    if (isTransitioning) return;
    
    setDirection('right');
    setIsTransitioning(true);
    setIsLoading(true);
    
    setTimeout(() => {
      router.back();
    }, 150);
  };

  useEffect(() => {
    // Reset transition state when route changes
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setIsTransitioning(false);
      setIsLoading(false);
    };

    const handleRouteChangeError = () => {
      setIsTransitioning(false);
      setIsLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  return {
    isTransitioning,
    direction,
    isLoading,
    navigateWithTransition,
    navigateBack
  };
};
