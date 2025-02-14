// utils/auth.js
import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      // user state যদি null হয়, অর্থাৎ authentication ফেইল হয়েছে
      if (user === null) {
        router.push('/login');
      }
    }, [user, router]);

    // যদি user state এখনও undefined, অর্থাৎ authentication status লোড হচ্ছে
    if (user === undefined) {
      return <div>লোড হচ্ছে...</div>;
    }

    return <Component {...props} />;
  };
}
