import { useState } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Your order has been processed',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      message: 'New game deals available',
      time: '1 day ago',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      // Mark all as read when opening
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-300 hover:text-white transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg z-10">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-400 p-4 text-center">No notifications</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="border-b border-gray-700 last:border-0"
                  >
                    <div className="p-4 hover:bg-gray-700 transition-colors">
                      <p className="text-white mb-1">{notification.message}</p>
                      <p className="text-gray-400 text-sm">
                        {notification.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <button
                className="text-blue-400 hover:text-blue-300 text-sm w-full text-center"
                onClick={() => setNotifications([])}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
