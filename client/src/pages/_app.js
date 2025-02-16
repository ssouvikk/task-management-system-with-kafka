// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';

// react-toastify import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Global QueryClient instance তৈরির সময় refetchOnWindowFocus false
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
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}

export default MyApp;
