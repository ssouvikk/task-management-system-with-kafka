// pages/login.js
import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
                setError('There was a problem connecting to the server');
            }
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
            style={{ backgroundColor: '#b2cdee' }}
        >
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@example.com"
                        required
                        className="w-full"
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 text-gray-700">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                    />
                </div>
                <Button type="submit" className="w-full">
                    Login
                </Button>
                <p className="mt-6 text-center text-gray-600">
                    New user?{' '}
                    <Link href="/register" className="text-blue-500 hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
};

Login.noLayout = true;
export default Login;
