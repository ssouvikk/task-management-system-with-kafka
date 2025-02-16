// components/Layout.js
import Navbar from './Navbar'
import NotificationFeed from './NotificationFeed'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 bg-gray-50 text-gray-800" style={{ backgroundColor: '#b2cdee' }}>
                    {children}
                </main>
            </div>
            <NotificationFeed />
        </div>
    )
}

export default Layout
