// src/components/TaskList.js
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import axiosInstance from '../utils/axiosInstance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const fetchTasks = async (filters) => {
  const { data } = await axiosInstance.get('/api/tasks', { params: filters })
  // API response-এ data: { tasks, total, pageNumber, perPage } থাকে
  return data.data
}

const TaskList = ({ onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    dueDate: '',
    perPage: 10,
    pageNumber: 1,
  })

  const { data: paginatedData, refetch } = useQuery(['tasks', filters], () => fetchTasks(filters))

  const tasks = paginatedData?.tasks || []
  const total = paginatedData?.total || 0
  const pageNumber = paginatedData?.pageNumber || filters.pageNumber
  const perPage = paginatedData?.perPage || filters.perPage
  const totalPages = Math.ceil(total / perPage)

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, pageNumber: 1 })
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, pageNumber: newPage })
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">টাস্ক তালিকা</h2>
      <div className="flex flex-wrap gap-2 mb-6">
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

        <select
          name="perPage"
          value={filters.perPage}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

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

      {tasks.length > 0 && (
        <div className="flex justify-between items-center mt-6">
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
      )}
    </div>
  )
}

export default TaskList
