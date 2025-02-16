// src/components/TaskForm.js
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/ui/Select'; // নতুন Select component import

// priority এবং status এর জন্য options array
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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        assignedTo: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                priority: initialData.priority,
                status: initialData.status,
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
                assignedTo: initialData.assignedTo || ''
            });
        }
    }, [initialData]);

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
                <label className="block text-gray-700 mb-2">শিরোনাম</label>
                <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">বিবরণ</label>
                <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">প্রাধান্য</label>
                <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={priorityOptions}
                    className='w-full'
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">স্ট্যাটাস</label>
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
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">অ্যাসাইন করা (Assigned To)</label>
                <Input
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Assigned User"
                    className='w-full'
                />
            </div>
            <div className="flex justify-end mt-6">
                <Button type="submit" className="mr-2">সেভ করুন</Button>
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} className="ml-2">
                        ক্যান্সেল
                    </Button>
                )}
            </div>
        </form>
    );
};

export default TaskForm;
