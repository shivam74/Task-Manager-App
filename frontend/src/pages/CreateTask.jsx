import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../context/TaskContext';
import TaskForm from '../components/tasks/TaskForm';

const CreateTask = () => {
  const { createTask, uploadFile } = useContext(TaskContext);
  const navigate = useNavigate();

  const handleSubmit = async (data) => createTask(data);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Create task</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new task with details, assignment, and an optional PDF attachment.
        </p>
      </div>

      <TaskForm
        variant="page"
        initialData={null}
        onSubmit={handleSubmit}
        onUpload={uploadFile}
        onCancel={() => navigate('/tasks')}
        onSuccess={() => navigate('/tasks')}
      />
    </div>
  );
};

export default CreateTask;
