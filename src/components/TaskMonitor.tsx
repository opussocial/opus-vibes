import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity, CheckCircle, XCircle, Clock, Trash2, Play } from "lucide-react";
import { Badge } from "./common/Badge";

interface Task {
  id: number;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  max_attempts: number;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export const TaskMonitor = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const clearTasks = async () => {
    await fetch("/api/tasks/clear", { method: "POST" });
    fetchTasks();
  };

  const createDemoTask = async () => {
    await fetch("/api/tasks/demo", { method: "POST" });
    fetchTasks();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-marine">Task Monitor</h2>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Monitor asynchronous background processing tasks.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={createDemoTask}
            className="flex items-center gap-2 px-4 py-2 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine/90 transition-all"
          >
            <Play size={18} />
            Enqueue Demo Task
          </button>
          <button 
            onClick={clearTasks}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all"
          >
            <Trash2 size={18} />
            Clear Finished
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-bottom border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Attempts</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">#{task.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{task.type}</div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                      {JSON.stringify(task.payload)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {task.status === 'pending' && <Badge color="zinc"><Clock size={10} className="mr-1" /> Pending</Badge>}
                      {task.status === 'processing' && <Badge color="blue"><Activity size={10} className="mr-1 animate-pulse" /> Processing</Badge>}
                      {task.status === 'completed' && <Badge color="green"><CheckCircle size={10} className="mr-1" /> Completed</Badge>}
                      {task.status === 'failed' && <Badge color="red"><XCircle size={10} className="mr-1" /> Failed</Badge>}
                    </div>
                    {task.error && <p className="text-[10px] text-red-500 mt-1 italic">{task.error}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {task.attempts} / {task.max_attempts}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(task.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {task.completed_at && task.started_at ? (
                      `${Math.round((new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 1000)}s`
                    ) : task.started_at ? (
                      'Running...'
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">
                    No tasks in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
