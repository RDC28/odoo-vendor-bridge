import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity-logs?limit=100');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Activity Logs</h1>
        <p className="text-slate-500">System-wide audit trail of all actions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center text-slate-400 py-8">No activity recorded.</div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-8">
            {logs.map((log) => (
              <div key={log._id} className="relative pl-8">
                <div className="absolute -left-4 top-1 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{log.userName || 'System'}</span>
                    <span className="text-slate-500 text-sm">performed</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-mono">{log.action}</span>
                    <span className="text-slate-500 text-sm">on</span>
                    <span className="font-medium text-slate-700 text-sm">{log.entityType}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy - hh:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
