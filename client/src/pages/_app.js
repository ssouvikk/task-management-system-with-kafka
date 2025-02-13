// pages/_app.js
import '../styles/globals.css'
import { useEffect, useState, createContext } from 'react'
import { useRouter } from 'next/router'

// AuthContext তৈরি করা হলো
export const AuthContext = createContext();

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  // App লোড হবার পর, localStorage থেকে token চেক করা
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Production এ token verification করা দরকার
      setUser({ token });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp;
