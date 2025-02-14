// components/TaskList.js
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
// ShadCN UI কম্পোনেন্ট হিসেবে Button, Input, Select ব্যবহার করা হয়েছে (আপনার প্রোজেক্টে ইমপোর্ট পাথ সামঞ্জস্য করুন)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '../utils/axiosInstance';

const fetchTasks = async (filters) => {
  const { data } = await axiosInstance.get('/api/tasks', { params: filters });
  return data;
};

const TaskList = ({ onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    dueDate: ''
  });

  // React Query এর useQuery হুক ব্যবহার করে টাস্ক ডেটা আনছে
  const { data: tasks, refetch } = useQuery(['tasks', filters], () => fetchTasks(filters));

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-2">টাস্ক তালিকা</h2>
      <div className="flex space-x-2 mb-4">
        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">সকল প্রাধান্য</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">সকল স্ট্যাটাস</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <Input
          type="date"
          name="dueDate"
          value={filters.dueDate}
          onChange={handleFilterChange}
          placeholder="Due Date"
          className="border p-2 rounded"
        />

        <Button onClick={refetch}>ফিল্টার করুন</Button>
      </div>

      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">শিরোনাম</th>
            <th className="p-2 text-left">বিবরণ</th>
            <th className="p-2 text-left">প্রাধান্য</th>
            <th className="p-2 text-left">স্ট্যাটাস</th>
            <th className="p-2 text-left">Due Date</th>
            <th className="p-2 text-left">ক্রিয়া</th>
          </tr>
        </thead>
        <tbody>
          {tasks && tasks.map((task) => (
            <tr key={task.id} className="border-b">
              <td className="p-2">{task.title}</td>
              <td className="p-2">{task.description}</td>
              <td className="p-2">{task.priority}</td>
              <td className="p-2">{task.status}</td>
              <td className="p-2">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
              </td>
              <td className="p-2 space-x-2">
                <Button onClick={() => onEdit(task)}>এডিট</Button>
                <Button variant="destructive" onClick={() => onDelete(task.id)}>ডিলিট</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
