// pages/index.js
import React, { useState } from 'react'
import { useQueryClient, useMutation } from 'react-query'
import TaskList from '../components/TaskList'
import TaskForm from '../components/TaskForm'
import { Button } from '@/components/ui/button'
import { withAuth } from '@/utils/auth'
import axiosInstance from '../utils/axiosInstance'

const Dashboard = () => {
    const queryClient = useQueryClient()
    const [editingTask, setEditingTask] = useState(null)
    const [showForm, setShowForm] = useState(false)

    // Create Task Mutation
    const createTaskMutation = useMutation(
        (newTask) => axiosInstance.post('/api/tasks', newTask),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('tasks')
                setShowForm(false)
            },
        }
    )

    // Update Task Mutation
    const updateTaskMutation = useMutation(
        ({ id, updatedTask }) => axiosInstance.put(`/api/tasks/${id}`, updatedTask),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('tasks')
                setEditingTask(null)
                setShowForm(false)
            },
        }
    )

    // Delete Task Mutation
    const deleteTaskMutation = useMutation(
        (id) => axiosInstance.delete(`/api/tasks/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('tasks')
            },
        }
    )

    const handleFormSubmit = (formData) => {
        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, updatedTask: formData })
        } else {
            createTaskMutation.mutate(formData)
        }
    }

    const handleEdit = (task) => {
        setEditingTask(task)
        setShowForm(true)
    }

    const handleDelete = (id) => {
        if (confirm('আপনি কি নিশ্চিত যে টাস্কটি মুছে ফেলতে চান?')) {
            deleteTaskMutation.mutate(id)
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Task Management Dashboard</h1>
            <Button
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                onClick={() => { setEditingTask(null); setShowForm(true); }}
            >
                নতুন টাস্ক তৈরি করুন
            </Button>
            {showForm && (
                <TaskForm
                    initialData={editingTask}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setShowForm(false); setEditingTask(null); }}
                />
            )}
            <TaskList onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    )
}

export default withAuth(Dashboard)
