import { usePageTransition } from '@/hooks/usePageTransition';

// Navigation utility for consistent smooth transitions
export const useNavigation = () => {
  const { navigateWithTransition, navigateBack, isTransitioning } = usePageTransition();

  const navigateTo = (path, direction = 'left') => {
    if (isTransitioning) return;
    navigateWithTransition(path, direction);
  };

  const navigateBackSmooth = () => {
    if (isTransitioning) return;
    navigateBack();
  };

  // Common navigation patterns with appropriate directions
  const navigationHelpers = {
    toDashboard: () => navigateTo('/', 'left'),
    toBids: () => navigateTo('/chats/bidding', 'right'),
    toPackages: () => navigateTo('/chats/packages', 'right'),
    toSettings: () => navigateTo('/settings', 'right'),
    toPersonalLeads: () => navigateTo('/personal-leads', 'right'),
    toOrders: () => navigateTo('/orders', 'right'),
    toChats: () => navigateTo('/chats', 'right'),
    toLogin: () => navigateTo('/login', 'left'),
    back: navigateBackSmooth,
  };

  return {
    navigateTo,
    navigateBack: navigateBackSmooth,
    isTransitioning,
    ...navigationHelpers
  };
};

// Helper function to determine transition direction based on current and target paths
export const getTransitionDirection = (currentPath, targetPath) => {
  const pathHierarchy = {
    '/': 0,
    '/chats/bidding': 1,
    '/personal-leads': 2,
    '/chats/packages': 3,
    '/settings': 4,
    '/orders': 5,
    '/chats': 6,
  };

  const currentLevel = pathHierarchy[currentPath] || 0;
  const targetLevel = pathHierarchy[targetPath] || 0;

  return targetLevel > currentLevel ? 'right' : 'left';
};
