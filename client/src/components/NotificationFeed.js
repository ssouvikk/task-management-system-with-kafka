// src/components/NotificationFeed.js
import React, { useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import NotificationContext from '../context/NotificationContext';

const NotificationFeed = () => {
    const { addNotification } = useContext(NotificationContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = new WebSocket(`ws://localhost:5000?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket কানেক্টেড হয়েছে।');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Toast হিসেবে দেখান
            toast.info(`New Notification: ${data.change_type}`);
            // Context-এ নতুন নোটিফিকেশন যোগ করুন
            addNotification(data);
        };

        socket.onclose = () => {
            console.log('WebSocket সংযোগ বিচ্ছিন্ন হয়েছে।');
        };

        return () => {
            socket.close();
        };
    }, [addNotification]);

    return null; // এই কম্পোনেন্টটি UI render করবে না, শুধু নোটিফিকেশন handle করবে।
};

export default NotificationFeed;
