import Link from "next/link";

export default function StickFooter({}) {
  return (
    <>
      <div className="z-50 sticky bottom-0 mt-px w-full grid grid-cols-5 gap-2 border-t border-t-black p-2 px-4 justify-items-center bg-white">
        <Link href="/" className="flex flex-col items-center">
          <img src="/assets/icons/wedsy.png" className="w-8 h-8 mt-1" />
          <span className="text-xs text-gray-600 mt-2">Dashboard</span>
        </Link>
        <Link href="/chats/bidding" className="flex flex-col items-center">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
            <text x="12" y="18" textAnchor="middle" fontSize="18" fontWeight="bold" fill="black">B</text>
          </svg>
          <span className="text-xs text-gray-600 mt-1">Bids</span>
        </Link>
        <Link href="/personal-leads" className="flex flex-col items-center relative -top-8 z-50">
          <div className="relative z-50">
            <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="white" stroke="#2B3F6C" strokeWidth="2"/>
              <path d="M20 12v16M12 20h16" stroke="#2B3F6C" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xs text-gray-600 mt-1">Create</span>
        </Link>
        <Link href="/chats/packages" className="flex flex-col items-center">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
            <text x="12" y="18" textAnchor="middle" fontSize="18" fontWeight="bold" fill="black">P</text>
          </svg>
          <span className="text-xs text-gray-600 mt-1">Packages</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center mt-1">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="black" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="black" strokeWidth="2"/>
          </svg>
          <span className="text-xs text-gray-600 mt-1">Settings</span>
        </Link>
      </div>
    </>
  );
}