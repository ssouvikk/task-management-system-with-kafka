// pages/_app.js
import '../styles/globals.css'
import { useEffect, useState } from 'react'
import AuthContext from '../context/AuthContext';  // পরিবর্তিত ইমপোর্ট

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  // App লোড হবার পর localStorage থেকে token চেক করা
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
