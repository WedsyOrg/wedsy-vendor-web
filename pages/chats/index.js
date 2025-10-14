import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { 
  MdArrowBackIos,
  MdChatBubbleOutline
} from "react-icons/md";
import SearchBox from "@/components/SearchBox";
import { useNavigation } from "@/utils/navigation";

export default function Chats() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const { navigateTo, back } = useNavigation();

  const fetchChats = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        }
        return response.json();
      })
      .then((data) => {
        setChats(data || []);
      })
      .catch((error) => {
        console.error("Error fetching chats:", error);
        setChats([]);
      });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleBackClick = () => {
    back();
  };

  const onOpenChat = (id) => {
    navigateTo(`/chats/view/${id}`, 'right');
  };

  return (
    <div className="min-h-screen bg-white">
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
        <SearchBox
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Chat List */}
      <div className="px-4">
        {chats.length > 0 ? (
          chats
            .filter((chat) => 
              search === "" || 
              chat?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
              chat?.lastMessage?.content?.toLowerCase().includes(search.toLowerCase())
            )
            .map((chat) => (
              <div
                key={chat._id}
                className="mb-3 p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 border border-gray-200 hover:bg-gray-100"
                onClick={() => onOpenChat(chat._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {chat?.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold truncate text-gray-700">
                        {chat?.user?.name || "Unknown User"}
                      </h3>
                      {chat?.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {new Date(chat.lastMessage.createdAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {chat?.lastMessage ? (
                      <p className="text-sm truncate text-gray-500">
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">No messages yet</p>
                    )}
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