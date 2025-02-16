// components/Navbar.js
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const Navbar = () => {
    const { setUser } = useContext(AuthContext);
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
