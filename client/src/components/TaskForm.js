// src/components/TaskForm.js
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const TaskForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        assignedTo: ''  // নতুন ফিল্ড
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                priority: initialData.priority,
                status: initialData.status,
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
                assignedTo: initialData.assignedTo || ''  // পূর্বের মান, যদি থাকে
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
        <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
            <div className="mb-2">
                <label className="block mb-1">শিরোনাম</label>
                <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="mb-2">
                <label className="block mb-1">বিবরণ</label>
                <Textarea name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="mb-2">
                <label className="block mb-1">প্রাধান্য</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="border p-2 rounded w-full">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div className="mb-2">
                <label className="block mb-1">স্ট্যাটাস</label>
                <select name="status" value={formData.status} onChange={handleChange} className="border p-2 rounded w-full">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
            <div className="mb-2">
                <label className="block mb-1">Due Date</label>
                <Input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
            </div>
            <div className="mb-2">
                <label className="block mb-1">অ্যাসাইন করা (Assigned To)</label>
                <Input name="assignedTo" value={formData.assignedTo} onChange={handleChange} placeholder="Assigned User" />
            </div>
            <div className="mt-4">
                <Button type="submit">সেভ করুন</Button>
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
