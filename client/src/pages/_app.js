// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // client-side এ token চেক করুন
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setUser({ token });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp;
