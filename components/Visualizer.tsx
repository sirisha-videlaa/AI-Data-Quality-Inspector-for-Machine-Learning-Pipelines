
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DatasetSummary } from '../types';

interface VisualizerProps {
  summary: DatasetSummary;
}

const Visualizer: React.FC<VisualizerProps> = ({ summary }) => {
  const missingData = summary.columns
    .map(c => ({ name: c.name, missing: c.missingPercentage }))
    .sort((a, b) => b.missing - a.missing)
    .filter(c => c.missing > 0);

  const targetDist = Object.entries(summary.targetDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Missing Data Chart */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-slate-100 font-semibold mb-6">Missing Values (%)</h3>
        {missingData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" unit="%" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="missing" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 italic">No missing values detected.</div>
        )}
      </div>

      {/* Target Distribution Chart */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-slate-100 font-semibold mb-6">Target Distribution: <span className="text-blue-400">{summary.targetColumn}</span></h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={targetDist}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {targetDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
