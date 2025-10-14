import BackIcon from "@/components/icons/BackIcon";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Notifications({}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.list || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Remove from selection if selected
        setSelectedNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.size === 0) return;
    
    setDeleting(true);
    try {
      const deletePromises = Array.from(selectedNotifications).map(id => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );

      await Promise.all(deletePromises);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.has(notif._id))
      );
      setSelectedNotifications(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting selected notifications:", error);
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setNotifications([]);
        setSelectedNotifications(new Set());
        setIsSelectionMode(false);
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getSenderName = (notification) => {
    // Hide vendor name - only show notification subject/title
    if (notification.type === "bidding") {
      return "New Bid";
    } else if (notification.type === "message") {
      return "New Message";
    } else if (notification.type === "order") {
      if (notification.category === "New Package Booking") {
        return "New Package Booking";
      } else if (notification.category === "New Personal Package Booking") {
        return "New Personal Package Booking";
      }
      return "New Order";
    } else if (notification.category === "packages") {
      return "New Package";
    } else if (notification.category === "personal-packages") {
      return "New Personal Package";
    }
    return notification.title || "Notification";
  };

  const getMessageContent = (notification) => {
    // Show only the notification subject/message content, hide vendor names
    if (notification.type === "bidding") {
      return notification.message || "You have received a new bid request";
    } else if (notification.type === "message") {
      // Extract just the message content from "Sender sent you a message: content"
      const message = notification.message || "";
      const match = message.match(/sent you a message:\s*(.+)/);
      if (match) {
        return match[1].trim();
      }
      return "You have received a new message";
    } else if (notification.type === "order") {
      if (notification.category === "New Package Booking") {
        return notification.message || "A new package has been booked";
      } else if (notification.category === "New Personal Package Booking") {
        return notification.message || "Your personal package has been booked";
      }
      return notification.message || "You have received a new order";
    } else if (notification.category === "packages") {
      return notification.message || "A new package has been created";
    } else if (notification.category === "personal-packages") {
      return notification.message || "A new personal package has been created";
    }
    return notification.message || notification.title;
  };


  return (
    <>
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-medium">Notifications</p>
        
        {!isSelectionMode ? (
          <>
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="text-blue-600 text-sm font-medium"
              >
                Select
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedNotifications(new Set());
              }}
              className="text-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
            {selectedNotifications.size > 0 && (
              <button
                onClick={deleteSelectedNotifications}
                disabled={deleting}
                className="text-red-600 text-sm font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting..." : `Delete (${selectedNotifications.size})`}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                disabled={deleting}
                className="text-red-600 text-sm font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete All"}
              </button>
            )}
          </div>
        )}
      </div>
      {isSelectionMode && notifications.length > 0 && (
        <div className="px-6 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <button
              onClick={selectAll}
              className="text-blue-600 text-sm font-medium"
            >
              {selectedNotifications.size === notifications.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-gray-600">
              {selectedNotifications.size} of {notifications.length} selected
            </span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 py-4 px-6 divide-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div 
              key={notification._id} 
              className={`flex flex-col gap-1 pt-4 ${!notification.read ? 'bg-blue-50' : ''} ${isSelectionMode ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                {isSelectionMode && (
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification._id)}
                    onChange={() => toggleSelection(notification._id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                )}
                
                <div className="flex-1" onClick={() => !isSelectionMode && !notification.read && markAsRead(notification._id)}>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-xl font-medium col-span-3">
                      {getSenderName(notification)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-between">
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      {!isSelectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                          title="Delete notification"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700">
                    {getMessageContent(notification)}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
