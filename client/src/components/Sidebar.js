// components/Sidebar.js
import Link from 'next/link'

const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-100 p-4 hidden md:block">
            <ul>
                <li className="mb-2">
                    <Link href="/" className="text-gray-700 hover:text-blue-500">
                        Dashboard
                    </Link>
                </li>
                {/* অন্যান্য লিঙ্ক যোগ করুন */}
            </ul>
        </aside>
    )
}

export default Sidebar
