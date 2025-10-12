import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { usePageTransition } from "@/hooks/usePageTransition";

export default function StickFooter({}) {
  const router = useRouter();
  const { navigateWithTransition, isTransitioning } = usePageTransition();

  const handleNavigation = (e, path) => {
    e.preventDefault();
    if (isTransitioning) return;
    
    // Determine transition direction based on current path
    let direction = 'left';
    const currentPath = router.pathname;
    
    // Define navigation patterns for smooth transitions
    const navigationMap = {
      '/': { '/chats/bidding': 'right', '/personal-leads': 'right', '/chats/packages': 'right', '/settings': 'right' },
      '/chats/bidding': { '/': 'left', '/personal-leads': 'right', '/chats/packages': 'right', '/settings': 'right' },
      '/personal-leads': { '/': 'left', '/chats/bidding': 'left', '/chats/packages': 'right', '/settings': 'right' },
      '/chats/packages': { '/': 'left', '/chats/bidding': 'left', '/personal-leads': 'left', '/settings': 'right' },
      '/settings': { '/': 'left', '/chats/bidding': 'left', '/personal-leads': 'left', '/chats/packages': 'left' }
    };
    
    direction = navigationMap[currentPath]?.[path] || 'left';
    navigateWithTransition(path, direction);
  };

  const navItems = [
    { href: "/", icon: "img", label: "Dashboard", iconSrc: "/assets/icons/wedsy.png", className: "w-8 h-8 mt-1" },
    { href: "/chats/bidding", icon: "svg", label: "Bids", svgContent: <text x="12" y="18" textAnchor="middle" fontSize="18" fontWeight="bold" fill="black">B</text>, className: "w-10 h-10" },
    { href: "/personal-leads", icon: "svg", label: "Create", svgContent: <><circle cx="20" cy="20" r="18" fill="white" stroke="#2B3F6C" strokeWidth="2"/><path d="M20 12v16M12 20h16" stroke="#2B3F6C" strokeWidth="3" strokeLinecap="round"/></>, className: "w-12 h-12", specialClass: "relative -top-8 z-50" },
    { href: "/chats/packages", icon: "svg", label: "Packages", svgContent: <text x="12" y="18" textAnchor="middle" fontSize="18" fontWeight="bold" fill="black">P</text>, className: "w-10 h-10" },
    { href: "/settings", icon: "svg", label: "Settings", svgContent: <><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="black" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="black" strokeWidth="2"/></>, className: "w-9 h-9", specialClass: "mt-1" }
  ];

  return (
    <>
      <div className="z-50 sticky bottom-0 mt-px w-full grid grid-cols-5 gap-2 border-t border-gray-300 p-2 px-4 justify-items-center bg-white shadow-[0_-2px_6px_rgba(0,0,0,0.08)]">
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.1 }}
          >
            <a
              href={item.href}
              onClick={(e) => handleNavigation(e, item.href)}
              className={`flex flex-col items-center ${item.specialClass || ''} ${isTransitioning ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            >
              {item.icon === "img" ? (
                <img src={item.iconSrc} className={item.className} />
              ) : (
                <svg className={item.className} viewBox={item.href === "/personal-leads" ? "0 0 40 40" : "0 0 24 24"} fill="none">
                  {item.svgContent}
                </svg>
              )}
              <span className="text-xs text-gray-600 mt-1">{item.label}</span>
            </a>
          </motion.div>
        ))}
      </div>
    </>
  );
}