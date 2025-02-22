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
  const [authData, setAuthData] = useState(null)

  const loadUser = async () => {
    if (typeof window !== 'undefined') {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const userData = localStorage.getItem('user')
        if (accessToken && userData) {
          setAuthData({ accessToken, user: JSON.parse(userData) })
        } else {
          setAuthData(null)
          localStorage.clear()
        }
      } catch (error) {
        localStorage.clear()
        setAuthData(null)
      }
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  if (authData === null) {
    return <div>Loading...</div>
  }

  const getLayout = Component.noLayout ? (page) => page : (page) => <Layout>{page}</Layout>

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
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
