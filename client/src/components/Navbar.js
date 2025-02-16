// src/components/Navbar.js
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const Navbar = () => {
    const { setUser } = useContext(AuthContext);
    const { notificationCount, resetNotifications } = useContext(NotificationContext);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
        toast('Logged Out successfully');
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="text-lg font-bold">Task Manager</div>
            <div className="relative">
                <button onClick={() => { resetNotifications(); router.push('/notifications'); }} className="mr-4">
                    Notifications
                </button>
                {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
