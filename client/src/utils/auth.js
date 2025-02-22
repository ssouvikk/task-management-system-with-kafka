// utils/auth.js
import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { authData } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (!authData?.user) {
        router.push('/login');
      }
    }, [authData, router]);

    if (!authData?.user) {
      return <div>Loading...</div>;   // showing loading till data loads
    }

    return <Component {...props} />;
  };
}
