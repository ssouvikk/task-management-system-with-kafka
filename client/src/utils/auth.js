// utils/auth.js
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../context/AuthContext';
import Loader from '@/components/Loader';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { authData } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (authData === undefined) return;
      if (!authData?.user) {
        router.replace(`/login?redirect=${router.pathname}`);
      }
    }, [authData, router]);

    if (authData === undefined || !authData?.user) {
      return <Loader />;
    }

    return <Component {...props} />;
  };
}
