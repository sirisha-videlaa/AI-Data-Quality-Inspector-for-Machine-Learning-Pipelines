
import React from 'react';
import { AuditReport } from '../types';

interface AuditReportViewProps {
  report: AuditReport;
}

const AuditReportView: React.FC<AuditReportViewProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-green-400';
    if (score > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getVerdictBadge = (safe: string) => {
    switch(safe) {
      case 'Yes': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'No': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        <div className="flex flex-col items-center">
          <div className={`text-6xl font-black ${getScoreColor(report.healthScore)}`}>
            {report.healthScore}<span className="text-2xl text-slate-500">/100</span>
          </div>
          <div className="text-slate-400 font-medium mt-2">Health Score</div>
        </div>
        
        <div className="flex-1 h-full flex flex-col justify-center border-l border-slate-700 pl-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-slate-400">Final Verdict:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getVerdictBadge(report.finalVerdict.safe)}`}>
              {report.finalVerdict.safe}
            </span>
          </div>
          <p className="text-slate-300 italic">"{report.finalVerdict.reason}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Issues */}
        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
          <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Critical Issues
          </h3>
          <ul className="space-y-3">
            {report.criticalIssues.map((issue, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-red-500">•</span> {issue}
              </li>
            ))}
            {report.criticalIssues.length === 0 && <li className="text-slate-500 italic">No critical issues detected.</li>}
          </ul>
        </div>

        {/* Leakage Risk */}
        <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM6.464 14.95a1 1 0 00-1.414 0l-.707.707a1 1 0 001.414 1.414l.707-.707a1 1 0 000-1.414z" />
            </svg>
            Leakage Risk: {report.leakageRisk.level}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">{report.leakageRisk.explanation}</p>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700 p-8 rounded-2xl">
        <h3 className="text-blue-400 font-bold mb-6 flex items-center gap-2 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Recommended Actions (Ordered by Impact)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.recommendedActions.map((action, i) => (
            <div key={i} className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <p className="text-slate-300 text-sm">{action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-slate-100 font-bold text-lg">Feature-Level Warnings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(report.featureWarnings).map(([feature, warning], i) => (
            <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="font-mono text-xs text-blue-400 mb-1">{feature}</div>
              <p className="text-slate-400 text-xs italic">{warning}</p>
            </div>
          ))}
          {Object.keys(report.featureWarnings).length === 0 && (
            <div className="col-span-full text-slate-500 text-center py-4">No specific feature warnings.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditReportView;
