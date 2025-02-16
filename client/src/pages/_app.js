// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from '../context/NotificationContext';

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

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <ToastContainer />
        </QueryClientProvider>
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

export default MyApp;
