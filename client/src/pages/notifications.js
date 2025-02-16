// pages/notifications.js
import React, { useContext } from 'react';
import Layout from '../components/Layout';
import NotificationContext from '../context/NotificationContext';
import { Button } from '@/components/ui/button';

const Notifications = () => {
    const { notifications, resetNotifications } = useContext(NotificationContext);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">নোটিফিকেশন</h1>
                <Button onClick={resetNotifications}>নোটিফিকেশন রিসেট করুন</Button>
            </div>
            {notifications.length === 0 ? (
                <p className="text-gray-600">কোন নোটিফিকেশন নেই</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notif, index) => (
                        <li key={index} className="p-4 border rounded shadow">
                            <p className="font-semibold">ইভেন্ট: {notif.change_type}</p>
                            <p>টাস্ক আইডি: {notif.taskId}</p>
                            <p>Updated: {new Date(notif.updatedAt).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;
