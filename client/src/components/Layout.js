// components/Layout.js
import Navbar from './Navbar'
import NotificationFeed from './NotificationFeed'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4 bg-gray-50">
                    {children}
                </main>
            </div>
            <NotificationFeed />
        </div>
    )
}

export default Layout
