// pages/_app.js
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from '../context/NotificationContext';
import { AuthProvider } from '../context/AuthContext';
import Layout from '@/components/Layout';
import { initializeTokens } from '@/utils/tokenManager';

initializeTokens();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

function MyApp({ Component, pageProps }) {
  const getLayout = Component.noLayout
    ? (page) => page
    : (page) => <Layout>{page}</Layout>;

  return (
    <AuthProvider>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          {getLayout(<Component {...pageProps} />)}
          <ToastContainer position="top-right" autoClose={5000} />
        </QueryClientProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp;
