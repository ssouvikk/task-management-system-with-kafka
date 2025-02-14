// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  // প্রাথমিকভাবে user state undefined রাখুন
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // client-side এ token চেক করা
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // token থাকলে সেট করুন, না থাকলে null
      setUser(token ? { token } : null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp;
