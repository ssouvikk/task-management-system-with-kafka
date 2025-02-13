// utils/auth.js
import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useRouter } from 'next/router';

export function withAuth(Component) {
    return function AuthenticatedComponent(props) {
        const { user } = useContext(AuthContext);
        const router = useRouter();

        useEffect(() => {
            if (!user) {
                router.push('/login');
            }
        }, [user]);

        if (!user) {
            return <div>Loading...</div>;
        }
        return <Component {...props} />;
    };
}
