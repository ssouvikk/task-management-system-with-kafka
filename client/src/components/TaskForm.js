// src/components/TaskForm.js
import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/ui/Select';
import AuthContext from '@/context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
];

const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' }
];

const TaskForm = ({ initialData, onSubmit, onCancel }) => {
    const { authData: { user } } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        assignedUser: ''
    });
    const [userOptions, setUserOptions] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                priority: initialData.priority,
                status: initialData.status,
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
                assignedUser: initialData.assignedUser ? initialData?.assignedUser?.id : ''
            });
        }
    }, [initialData]);

    // শুধুমাত্র অ্যাডমিন ইউজারের জন্য ইউজার লিস্ট ফেচ করা (non-admin)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get('/api/users'); // user.routes.js-এ সংজ্ঞায়িত API
                setUserOptions(
                    res.data.data.map(u => ({
                        value: u.id,
                        label: u.username + " (" + u.email + ")"
                    }))
                );
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        if (user?.role === "admin") {
            fetchUsers();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-white shadow-md mb-6">
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Priority</label>
                <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={priorityOptions}
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusOptions}
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Due Date</label>
                <Input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className='w-full'
                />
            </div>
            {user.role === 'admin' && (
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Assign User</label>
                    <Select
                        name="assignedUser"
                        value={formData.assignedUser}
                        onChange={handleChange}
                        options={[{ value: '', label: 'Select User' }, ...userOptions]}
                        className='w-full'
                    />
                </div>
            )}
            <div className="flex justify-end mt-6">
                <Button type="submit" className="mr-2">Save</Button>
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} className="ml-2">
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

export default TaskForm;
