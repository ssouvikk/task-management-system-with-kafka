// pages/tasks.js
import Layout from '../components/Layout';
import { withAuth } from '../utils/auth';

const Tasks = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold">Tasks</h1>
      <p>এখানে আপনার টাস্কের তালিকা দেখানো হবে।</p>
    </Layout>
  );
};

export default withAuth(Tasks);
