// pages/register.js
import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';
import Link from 'next/link';

const Register = () => {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.token) {
      router.push('/');
    }
  }, [user, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      return;
    }

    try {
      // username, email ও password পাঠানো হচ্ছে
      const res = await axiosInstance.post('/api/auth/signup', { username, email, password });
      const data = res.data;
      if (res.status === 201) {
        localStorage.setItem('token', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setUser({ token: data.data.accessToken });
        router.push('/');
      }
    } catch (err) {
      console.error('Register Error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('সার্ভারের সাথে সংযোগে সমস্যা হয়েছে');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4 text-center">রেজিস্টার করুন</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700">ইউজারনেম</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="আপনার ইউজারনেম দিন"
            required
          />
        </div>
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
        <div className="mb-4">
          <label className="block text-gray-700">কনফার্ম পাসওয়ার্ড</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          রেজিস্টার
        </button>
      </form>
      <p className="mt-4">
        আগে থেকে একাউন্ট আছে?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          লগইন করুন
        </Link>
      </p>
    </div>
  );
};

Register.noLayout = true; // Layout না দেখানোর জন্য flag

export default Register;
