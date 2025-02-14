// components/Sidebar.js
import Link from 'next/link';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-100 p-4">
            <ul>
                <li className="mb-2">
                    <Link href="/" className="text-gray-700 hover:text-blue-500">
                        Dashboard
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/tasks" className="text-gray-700 hover:text-blue-500">
                        Tasks
                    </Link>
                </li>
                {/* প্রয়োজনে আরও লিঙ্ক যোগ করুন */}
            </ul>
        </aside>
    );
};

export default Sidebar;
