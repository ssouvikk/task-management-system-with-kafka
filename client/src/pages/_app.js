// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';

// নতুন QueryClient instance তৈরি করুন
const queryClient = new QueryClient();

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
