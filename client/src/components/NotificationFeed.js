// components/NotificationFeed.js
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NotificationFeed = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // WebSocket কানেকশন (আপনার সার্ভারের URL অনুযায়ী ঠিক করুন)
        const socket = new WebSocket('ws://localhost:5000');

        socket.onopen = () => {
            console.log('WebSocket কানেক্টেড হয়েছে।');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications((prev) => [data, ...prev]);
        };

        socket.onclose = () => {
            console.log('WebSocket সংযোগ বিচ্ছিন্ন হয়েছে।');
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">নোটিফিকেশন ফিড</h2>
            {notifications.map((notif, index) => (
                <Card key={index} className="mb-2">
                    <CardHeader>
                        <CardTitle>{notif.event}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Task ID: {notif.taskId}</p>
                        <p>New Status: {notif.newStatus}</p>
                        <p>{new Date(notif.timestamp).toLocaleString()}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default NotificationFeed;
