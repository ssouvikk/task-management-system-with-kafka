// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from '../context/NotificationContext';
import Layout from '@/components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setUser(token ? { token } : null);
    }
  }, []);


  // যদি Component.noLayout সেট থাকে, তাহলে সরাসরি Component রেন্ডার করুন, নতুবা Layout দিয়ে wrap করুন।
  const getLayout = Component.noLayout
    ? (page) => page
    : (page) => <Layout>{page}</Layout>

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          {getLayout(<Component {...pageProps} />)}
          <ToastContainer />
        </QueryClientProvider>
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

export default MyApp;
