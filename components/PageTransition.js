import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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

  const getTransform = () => {
    if (isExiting) {
      return direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    }
    if (isVisible) {
      return 'translateX(0)';
    }
    return direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
  };

  return (
    <div
      className="w-full h-screen overflow-hidden"
      style={{
        transform: getTransform(),
        transition: 'transform 0.3s ease-in-out',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
