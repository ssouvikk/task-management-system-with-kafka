import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axiosInstance from '../utils/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/Select'; // আমাদের নতুন reusable Select import


// Select component-এর জন্য options গুলি:
const priorityOptions = [
  { value: '', label: 'সকল প্রাধান্য' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const statusOptions = [
  { value: '', label: 'সকল স্ট্যাটাস' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
];

const perPageOptions = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

// API থেকে tasks fetch করার function
const fetchTasks = async (filters) => {
  const { data } = await axiosInstance.get('/api/tasks', { params: filters });
  // API response-এ data: { tasks, total, pageNumber, perPage } থাকে
  return data.data;
};

const TaskList = ({ onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    dueDate: '',
    pageNumber: 1,
  });

  const [perPage, setPerPage] = useState(10);

  const { data: paginatedData, refetch } = useQuery(
    ['tasks', { ...filters, perPage }],
    () => fetchTasks({ ...filters, perPage })
  );

  const tasks = paginatedData?.tasks || [];
  const total = paginatedData?.total || 0;
  const pageNumber = paginatedData?.pageNumber || filters.pageNumber;
  const totalPages = Math.ceil(total / perPage);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, pageNumber: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, pageNumber: newPage });
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    // perPage পরিবর্তনের সাথে পৃষ্ঠা ১ থেকে শুরু হবে
    setFilters({ ...filters, pageNumber: 1 });
  };


  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">টাস্ক তালিকা</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        <Select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          options={priorityOptions}
        />
        <Select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          options={statusOptions}
        />
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

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-800">শিরোনাম</th>
              <th className="p-3 text-left text-gray-800">বিবরণ</th>
              <th className="p-3 text-left text-gray-800">প্রাধান্য</th>
              <th className="p-3 text-left text-gray-800">স্ট্যাটাস</th>
              <th className="p-3 text-left text-gray-800">Due Date</th>
              <th className="p-3 text-left text-gray-800">অ্যাসাইন করা</th>
              <th className="p-3 text-left text-gray-800">ক্রিয়া</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-700">{task.title}</td>
                <td className="p-3 text-gray-700">{task.description}</td>
                <td className="p-3 text-gray-700">{task.priority}</td>
                <td className="p-3 text-gray-700">{task.status}</td>
                <td className="p-3 text-gray-700">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </td>
                <td className="p-3 text-gray-700">{task.assignedTo || '-'}</td>
                <td className="p-3 space-x-2">
                  <Button onClick={() => onEdit(task)}>এডিট</Button>
                  <Button variant="destructive" onClick={() => onDelete(task.id)}>
                    ডিলিট
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination এবং perPage নির্বাচন */}
      {tasks.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <label className="text-gray-700">প্রতি পৃষ্ঠায়:</label>
            <Select
              name="perPage"
              value={perPage}
              onChange={handlePerPageChange}
              options={perPageOptions}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}>
              পূর্ববর্তী
            </Button>
            <span className="text-gray-700">
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
      )}
    </div>
  );
};

export default TaskList;
