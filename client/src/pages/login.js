// pages/login.js
import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';
import Link from 'next/link';

const Login = () => {
    const { user, setUser } = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.token) {
            router.push('/');
        }
    }, [user, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axiosInstance.post('/api/auth/login', { email, password });
            const data = res.data;
            if (res.status === 200) {
                localStorage.setItem('token', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                setUser({ token: data.data.accessToken });
                router.push('/');
            }
        } catch (err) {
            console.error('Login Error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('সার্ভারের সাথে সংযোগে সমস্যা হয়েছে');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl mb-4 text-center">লগইন করুন</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <div className="mb-4">
                    <label className="block text-gray-700">ইমেইল</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="example@example.com"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">পাসওয়ার্ড</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    লগইন
                </button>
            </form>
            <p className="mt-4">
                নতুন ইউজার?{" "}
                <Link href="/register" className="text-blue-500 hover:underline">
                    রেজিস্টার করুন
                </Link>
            </p>
        </div>
    );
};
Login.noLayout = true; // Layout না দেখানোর জন্য flag

export default Login;
