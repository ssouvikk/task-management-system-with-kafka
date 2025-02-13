// pages/login.js
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';

const Login = () => {
    const { setUser } = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // API রুট কল: production API base URL ব্যবহার করা হচ্ছে
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Cookies পাঠানোর ক্ষেত্রে (যদি API cookies সেট করে)
            });
            const data = await res.json();
            if (res.ok) {
                // সফল হলে, টোকেন localStorage-এ সেভ করা হচ্ছে
                // **বিঃদ্রঃ** Production-এ HTTPOnly cookies ব্যবহার করা উচিত
                localStorage.setItem('token', data.token);
                setUser({ token: data.token });
                router.push('/');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert('সার্ভারের সাথে সংযোগে সমস্যা হয়েছে');
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
