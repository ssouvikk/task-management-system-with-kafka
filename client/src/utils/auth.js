// utils/auth.js
import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      // If user state is null, i.e. authentication failed
      if (user === null) {
        router.push('/login');
      }
    }, [user, router]);

    // If user state is still undefined, i.e. authentication status is loading
    if (user === undefined) {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
}
