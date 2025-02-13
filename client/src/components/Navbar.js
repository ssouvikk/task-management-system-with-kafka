// components/Navbar.js
import { useContext } from 'react';
import { AuthContext } from '../pages/_app';
import { useRouter } from 'next/router';

const Navbar = () => {
    const { setUser } = useContext(AuthContext);
    const router = useRouter();

    // Logout ফাংশন
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="text-lg font-bold">Task Manager</div>
            <div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
