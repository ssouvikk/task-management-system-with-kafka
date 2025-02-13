//এই পৃষ্ঠাটি প্রোটেক্টেড রুট হিসেবে HOC withAuth ব্যবহার করে বানানো হয়েছে।
// pages/index.js
import Layout from '../components/Layout';
import { withAuth } from '../utils/auth';

const Dashboard = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>এখানে আপনার টাস্ক সম্পর্কিত তথ্য দেখানো হবে।</p>
    </Layout>
  );
};

export default withAuth(Dashboard);
