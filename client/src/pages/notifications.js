// pages/notifications.js
import React, { useContext } from 'react'
import NotificationContext from '../context/NotificationContext'
import { Button } from '@/components/ui/button'

const Notifications = () => {
    const { notifications, resetNotifications } = useContext(NotificationContext)

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">নোটিফিকেশন</h1>
                <Button onClick={resetNotifications} className="mt-4 md:mt-0">
                    নোটিফিকেশন রিসেট করুন
                </Button>
            </div>
            {notifications.length === 0 ? (
                <p className="text-gray-600 text-center">কোন নোটিফিকেশন নেই</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notif, index) => (
                        <li key={index} className="p-4 border rounded shadow bg-white">
                            <p className="font-semibold text-gray-800">ইভেন্ট: {notif.change_type}</p>
                            <p className="text-gray-700">টাস্ক আইডি: {notif.taskId}</p>
                            <p className="text-gray-600">
                                Updated: {new Date(notif.updatedAt).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Notifications
