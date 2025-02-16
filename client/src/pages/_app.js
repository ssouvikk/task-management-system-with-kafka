// pages/_app.js
import '../styles/globals.css'
import { useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { NotificationProvider } from '../context/NotificationContext'
import Layout from '@/components/Layout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      setUser(token ? { token } : null)
    }
  }, [])

  // Layout wrap conditionally (login/register পেজে Layout না লাগানোর জন্য Component.noLayout ফ্ল্যাগ ব্যবহার করুন)
  const getLayout = Component.noLayout
    ? (page) => page
    : (page) => <Layout>{page}</Layout>

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          {getLayout(<Component {...pageProps} />)}
          <ToastContainer position="top-right" autoClose={5000} />
        </QueryClientProvider>
      </NotificationProvider>
    </AuthContext.Provider>
  )
}

export default MyApp
