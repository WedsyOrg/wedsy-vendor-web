import BackIcon from "@/components/icons/BackIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { useEffect, useState, useRef } from "react";
import { 
  MdArrowForwardIos, 
  MdArrowBackIos,
  MdSearch, 
  MdCheck, 
  MdClear, 
  MdOutlineLocationOn, 
  MdPersonOutline,
  MdChatBubbleOutline
} from "react-icons/md";
import { useRouter } from "next/router";
import { Avatar, TextInput } from "flowbite-react";
import { formatMessageTime } from "@/utils/chat";

// Dummy fallback chats used when API is unavailable or returns empty
const DUMMY_CHATS = [
  {
    _id: "dummy-1",
    user: {
      name: "Deepika Padukone",
      profilePhoto: "",
    },
    lastMessage: {
      content: "Hi! Is your team available on 12 Nov?",
      createdAt: new Date().toISOString(),
    },
    unreadCount: 2,
  },
  {
    _id: "dummy-2",
    user: {
      name: "Ranveer Singh",
      profilePhoto: "",
    },
    lastMessage: {
      content: "Please share your best quote for sangeet",
      createdAt: new Date().toISOString(),
    },
    unreadCount: 0,
  },
];

export default function Home({}) {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const hasLoadedRef = useRef(false);
  const STORAGE_KEY = "wv_chat_list_v1";
  const STORAGE_SCROLL_KEY = "wv_chat_scroll_y";

  const fetchChats = (showSpinner = true) => {
    // Only show loading spinner when explicitly requested
    if (showSpinner) {
      setLoading(true);
    }
    
    console.log("Vendor fetchChats - API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Vendor fetchChats - Token:", localStorage.getItem("token") ? "Token exists" : "No token");
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        console.log("Vendor fetchChats - Response status:", response.status);
        console.log("Vendor fetchChats - Response ok:", response.ok);
        
        if (!response.ok) {
          console.log("Vendor fetchChats - Response not ok, redirecting to login");
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log("Vendor fetchChats - Response data:", response);
        setLoading(false);
        const data = response || [];
        
        // Add dummy data if no chats are returned
        if (data.length === 0) {
          const dummyChats = [
            {
              _id: "chat1",
              user: {
                name: "Priya Sharma",
                profilePhoto: "/api/placeholder/40/40"
              },
              lastMessage: {
                content: "Hi! I'm interested in your bridal makeup package. Can we discuss the pricing?",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
              },
              unreadCount: 2
            },
            {
              _id: "chat2",
              user: {
                name: "Anjali Patel",
                profilePhoto: "/api/placeholder/40/40"
              },
              lastMessage: {
                content: "Thank you for the quote. I'll discuss with my family and get back to you.",
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
              },
              unreadCount: 0
            },
            {
              _id: "chat3",
              user: {
                name: "Riya Singh",
                profilePhoto: "/api/placeholder/40/40"
              },
              lastMessage: {
                content: "What time slots are available for next Saturday?",
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
              },
              unreadCount: 1
            },
            {
              _id: "chat4",
              user: {
                name: "Sneha Gupta",
                profilePhoto: "/api/placeholder/40/40"
              },
              lastMessage: {
                content: "Perfect! I'll book the package for my wedding day.",
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              },
              unreadCount: 0
            },
            {
              _id: "chat5",
              user: {
                name: "Kavya Reddy",
                profilePhoto: "/api/placeholder/40/40"
              },
              lastMessage: {
                content: "Can you show me some portfolio images of your work?",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              },
              unreadCount: 3
            },
            {
              _id: "chat6",
              user: {
                name: "Meera Joshi",
                profilePhoto: "/api/placeholder/40/40"
              },
              lastMessage: {
                content: "I need makeup for my sister's engagement. What packages do you have?",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
              },
              unreadCount: 0
            }
          ];
          console.log("Vendor fetchChats - Using dummy data");
          setChats(dummyChats);
          // Cache dummy data
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dummyChats));
          } catch (_e) {}
        } else {
          console.log("Vendor fetchChats - Setting chats data:", data);
          setChats(data);
          // Cache latest list for instant back navigation
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (_e) {}
        }
        setInitialLoad(false);
        hasLoadedRef.current = true;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setLoading(false);
        // Use dummy data on network failure
        setChats(DUMMY_CHATS);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_CHATS));
        } catch (_e) {}
        setInitialLoad(false);
      });
  };

  useEffect(() => {
    // Load cached chats instantly (no spinner) when available
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setChats(parsed);
          setInitialLoad(false);
          hasLoadedRef.current = true;
          // restore scroll position
          const y = Number(sessionStorage.getItem(STORAGE_SCROLL_KEY) || 0);
          if (!Number.isNaN(y) && y > 0) {
            requestAnimationFrame(() => window.scrollTo(0, y));
          }
        }
      }
    } catch (_e) {}

    // Fetch fresh data silently (no spinner)
    fetchChats(false);
  }, []);

  // Handle page visibility change to refresh data when coming back from chat detail
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasLoadedRef.current) {
        // Refresh data silently when page becomes visible
        fetchChats(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Trigger slide-in animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle back navigation with slide-out animation
  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/'); // Navigate directly to dashboard
    }, 300); // Match the animation duration
  };

  // Save scroll position before navigating to a chat
  const onOpenChat = (id) => {
    try {
      sessionStorage.setItem(STORAGE_SCROLL_KEY, String(window.scrollY || 0));
    } catch (_e) {}
    setIsExiting(true);
    setTimeout(() => {
      router.push(`/chats/view/${id}`);
    }, 300); // Match the animation duration
  };
  return (
    <div 
      className="min-h-screen bg-white transition-all duration-300 ease-out"
      style={{
        transform: isExiting ? 'translateX(100%)' : (isVisible ? 'translateX(0)' : 'translateX(100%)'),
        opacity: isExiting ? 0 : (isVisible ? 1 : 0)
      }}
    >
      {/* Header */}
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <MdArrowBackIos 
          onClick={handleBackClick} 
          className="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
          size={24}
        />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          CHATS
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-dark-blue"></div>
          </div>
        ) : chats.length > 0 ? (
          chats
            .filter((chat) => 
              search === "" || 
              chat?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
              chat?.lastMessage?.content?.toLowerCase().includes(search.toLowerCase())
            )
            .map((chat, index) => (
              <div
                key={chat._id}
                className={`mb-3 p-4 rounded-lg cursor-pointer transition-colors ${
                  chat?.unreadCount > 0 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => onOpenChat(chat._id)}
              >
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="relative">
                    <Avatar
                      img={
                        chat?.user?.profilePhoto ||
                        "https://www.clipartkey.com/mpngs/m/209-2095552_profile-picture-placeholder-png.png"
                      }
                      rounded={true}
                      size="md"
                    />
                  </div>

                  {/* Chat Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-base font-semibold truncate ${
                        chat?.unreadCount > 0 ? 'text-black' : 'text-gray-700'
                      }`}>
                        {chat?.user?.name || "Deepika Padukone"}
                      </h3>
                      {chat?.lastMessage && (
                        <span className={`text-xs flex-shrink-0 ${
                          chat?.unreadCount > 0 ? 'text-black' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {chat?.lastMessage ? (
                      <p className={`text-sm truncate ${
                        chat?.unreadCount > 0 ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">No messages yet</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    {chat?.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {chat.unreadCount}
                      </div>
                    )}
                    <span className={`text-xs font-semibold ${
                      chat?.unreadCount > 0 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Bidding
                    </span>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MdChatBubbleOutline size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm text-center">
              Your chat conversations will appear here when customers start messaging you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
