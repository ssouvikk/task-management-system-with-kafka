// components/Navbar.js
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'
import NotificationContext from '../context/NotificationContext'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

const Navbar = () => {
    const { setAuthData } = useContext(AuthContext);
    const { notifications, resetNotifications } = useContext(NotificationContext)
    const router = useRouter()

    const handleLogout = () => {
        localStorage.clear()
        resetNotifications()
        setAuthData({})
        router.push('/login')
        toast('Logged Out successfully')
    }

    return (
        <nav className="bg-gray-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-lg font-bold">Task Manager</div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <div className="relative">
                    <button
                        onClick={() => { router.push('/notifications') }}
                        className="text-white hover:underline focus:outline-none"
                    >
                        Notifications
                    </button>
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs px-2">
                            {notifications.length > 99 ? '99+' : notifications.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded focus:outline-none"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default Navbar
