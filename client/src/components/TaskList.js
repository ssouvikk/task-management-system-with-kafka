// src/components/TaskList.js
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import axiosInstance from '../utils/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/Select';
import NotificationContext from '@/context/NotificationContext';

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
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

const fetchTasks = async (filters) => {
  const { data } = await axiosInstance.get('/api/tasks', { params: filters });
  return data.data;
};

const TaskList = ({ onEdit, onDelete }) => {
  const { notifications } = useContext(NotificationContext);
  const [filters, setFilters] = useState({ priority: '', status: '', dueDate: '', pageNumber: 1 });
  const [perPage, setPerPage] = useState(10);

  const { data: paginatedData, refetch } = useQuery(
    ['tasks', { ...filters, perPage }],
    () => fetchTasks({ ...filters, perPage })
  );

  const tasks = paginatedData?.tasks || [];
  const total = paginatedData?.total || 0;
  const pageNumber = paginatedData?.pageNumber || filters.pageNumber;
  const totalPages = Math.ceil(total / perPage);

  useEffect(() => {
    refetch();
  }, [notifications]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, pageNumber: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, pageNumber: newPage });
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setFilters({ ...filters, pageNumber: 1 });
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Task List</h2>
      <div className="flex flex-wrap md:flex-nowrap gap-2 mb-6 items-center">
        <Select name="priority" value={filters.priority} onChange={handleFilterChange} options={priorityOptions} />
        <Select name="status" value={filters.status} onChange={handleFilterChange} options={statusOptions} />
        <Input type="date" name="dueDate" value={filters.dueDate} onChange={handleFilterChange} placeholder="Due Date" className="border p-2 rounded" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-800">Title</th>
              <th className="p-3 text-left text-gray-800">Description</th>
              <th className="p-3 text-left text-gray-800">Priority</th>
              <th className="p-3 text-left text-gray-800">Status</th>
              <th className="p-3 text-left text-gray-800">Due Date</th>
              <th className="p-3 text-left text-gray-800">Assigned To</th>
              <th className="p-3 text-left text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-700">{task.title}</td>
                <td className="p-3 text-gray-700">{task.description}</td>
                <td className="p-3 text-gray-700">{task.priority}</td>
                <td className="p-3 text-gray-700">{task.status}</td>
                <td className="p-3 text-gray-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                <td className="p-3 text-gray-700">{task.assignedUser?.email || '-'}</td>
                <td className="p-3 space-x-2">
                  <Button onClick={() => onEdit(task)}>Edit</Button>
                  <Button variant="destructive" onClick={() => onDelete(task.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <label className="text-gray-700">Per page:</label>
            <Select name="perPage" value={perPage} onChange={handlePerPageChange} options={perPageOptions} />
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}>Previous</Button>
            <span className="text-gray-700">Page {pageNumber} / {totalPages} (Total: {total})</span>
            <Button onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber === totalPages || totalPages === 0}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
