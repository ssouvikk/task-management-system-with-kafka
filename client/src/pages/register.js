// pages/register.js
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';

const Register = () => {
  const { setUser } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // ক্লায়েন্ট সাইড ভ্যালিডেশন: পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে কিনা
    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      return;
    }

    try {
      // Axios instance ব্যবহার করে API কল করা হচ্ছে
      const res = await axiosInstance.post('/api/auth/signup', { email, password });
      const data = res.data;

      // যদি API কল সফল হয়
      if (res.status === 201) {
        // সিকিউরিটির জন্য, production এ HTTPOnly cookies ব্যবহারের পরামর্শ দেওয়া হয়
        localStorage.setItem('token', data.accessToken);
        setUser({ token: data.accessToken });
        router.push('/'); // সফল হলে ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে
      }
    } catch (err) {
      console.error('Register Error:', err);
      // যদি API থেকে error message পাওয়া যায়, তা দেখানো হবে
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('সার্ভারের সাথে সংযোগে সমস্যা হয়েছে');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4 text-center">রেজিস্টার করুন</h2>
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
    </div>
  );
};

export default Register;
