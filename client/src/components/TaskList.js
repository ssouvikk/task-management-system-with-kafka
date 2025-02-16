// src/components/TaskList.js
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axiosInstance from '../utils/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetchTasks = async (filters) => {
  // API call-এ perPage ও pageNumber query parameters যোগ করুন
  const { data } = await axiosInstance.get('/api/tasks', { params: filters });
  // এখন API response-এ data: { tasks, total, pageNumber, perPage } আছে
  return data.data;
};

const TaskList = ({ onEdit, onDelete }) => {
  // Filter state-এ pagination values যুক্ত করুন
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    dueDate: '',
    perPage: 2,      // ডিফল্ট 10
    pageNumber: 1,    // ডিফল্ট 1
  });

  const { data: paginatedData, refetch } = useQuery(['tasks', filters], () => fetchTasks(filters));

  // paginatedData থেকে tasks, total, pageNumber ও perPage নিন
  const tasks = paginatedData?.tasks || [];
  const total = paginatedData?.total || 0;
  const pageNumber = paginatedData?.pageNumber || filters.pageNumber;
  const perPage = paginatedData?.perPage || filters.perPage;
  const totalPages = Math.ceil(total / perPage);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, pageNumber: 1 }); // নতুন filter এ page reset করুন
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, pageNumber: newPage });
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-2">টাস্ক তালিকা</h2>
      <div className="flex flex-wrap gap-2 mb-4">
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

        <Input
          type="number"
          name="perPage"
          value={filters.perPage}
          onChange={(e) => {
            const value = Math.min(Number(e.target.value) || 10, 100);
            setFilters({ ...filters, perPage: value, pageNumber: 1 });
          }}
          placeholder="Per Page"
          className="border p-2 rounded w-24"
          min="1"
          max="100"
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
            <th className="p-2 text-left">অ্যাসাইন করা</th>
            <th className="p-2 text-left">ক্রিয়া</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b">
              <td className="p-2">{task.title}</td>
              <td className="p-2">{task.description}</td>
              <td className="p-2">{task.priority}</td>
              <td className="p-2">{task.status}</td>
              <td className="p-2">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
              </td>
              <td className="p-2">{task.assignedTo || '-'}</td>
              <td className="p-2 space-x-2">
                <Button onClick={() => onEdit(task)}>এডিট</Button>
                <Button variant="destructive" onClick={() => onDelete(task.id)}>ডিলিট</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
        >
          পূর্ববর্তী
        </Button>
        <span>
          পৃষ্ঠা {pageNumber} / {totalPages} (মোট: {total})
        </span>
        <Button
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages || totalPages === 0}
        >
          পরবর্তী
        </Button>
      </div>
    </div>
  );
};

export default TaskList;
