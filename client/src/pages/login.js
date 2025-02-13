// pages/login.js
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';  // নতুন ইমপোর্ট পাথ
import { useRouter } from 'next/router';

const Login = () => {
    const { setUser } = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        // ডেমো উদাহরণ: বাস্তবে API কল করে অথেনটিকেশন করবেন
        if (email === 'user@example.com' && password === 'password') {
            const token = 'dummy-jwt-token'; // আসল ক্ষেত্রে API থেকে JWT টোকেন নিন
            localStorage.setItem('token', token);
            setUser({ token });
            router.push('/');
        } else {
            alert('ভুল ইমেইল বা পাসওয়ার্ড');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl mb-4 text-center">লগইন করুন</h2>
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
        </div>
    );
};

export default Login;
