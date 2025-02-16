// pages/register.js
import { useState, useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import { useRouter } from 'next/router'
import axiosInstance from '../utils/axiosInstance'
import Link from 'next/link'

const Register = () => {
  const { user, setUser } = useContext(AuthContext)
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && user.token) {
      router.push('/')
    }
  }, [user, router])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না')
      return
    }
    try {
      const res = await axiosInstance.post('/api/auth/signup', { username, email, password })
      const data = res.data
      if (res.status === 201) {
        localStorage.setItem('token', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        setUser({ token: data.data.accessToken })
        router.push('/')
      }
    } catch (err) {
      console.error('Register Error:', err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('সার্ভারের সাথে সংযোগে সমস্যা হয়েছে')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" style={{ backgroundColor: '#b2cdee' }}>
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">রেজিস্টার করুন</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">ইউজারনেম</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="আপনার ইউজারনেম দিন"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">ইমেইল</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@example.com"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-gray-700">কনফার্ম পাসওয়ার্ড</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition duration-200">
          রেজিস্টার
        </button>
        <p className="mt-6 text-center text-gray-600">
          আগে থেকে একাউন্ট আছে?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            লগইন করুন
          </Link>
        </p>
      </form>
    </div>
  )
}

Register.noLayout = true
export default Register
