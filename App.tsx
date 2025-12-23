
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import Visualizer from './components/Visualizer';
import AuditReportView from './components/AuditReportView';
import { analyzeDataset } from './services/dataAnalyzer';
import { generateAuditReport } from './services/geminiAudit';
import { DatasetSummary, AuditReport } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [featureColumns, setFeatureColumns] = useState<string[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = (rows: any[], cols: string[]) => {
    setData(rows);
    setHeaders(cols);
    setTargetColumn(cols[cols.length - 1] || ''); // Default to last column
    setFeatureColumns(cols.slice(0, cols.length - 1)); // Default to all others
    setSummary(null);
    setReport(null);
    setError(null);
  };

  const startAudit = async () => {
    if (!targetColumn) {
      setError('Please select a target column.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const stats = analyzeDataset(data, targetColumn, featureColumns);
      setSummary(stats);
      const auditResult = await generateAuditReport(stats);
      setReport(auditResult);
    } catch (err: any) {
      setError(err.message || 'Audit failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (col: string) => {
    setFeatureColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-block bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-sm font-bold mb-4 border border-blue-500/20 uppercase tracking-widest">
          Machine Learning Production Guard
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Data Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Auditor</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Evaluate your dataset before model training. Identify leakage, drift, and quality issues that cause unreliable results.
        </p>
      </header>

      {!data.length ? (
        <FileUpload onDataLoaded={handleDataLoaded} />
      ) : (
        <div className="space-y-12">
          {/* Configuration Panel */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <label className="block text-slate-100 font-bold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                  Select Target Variable
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {headers.map(h => (
                    <button
                      key={h}
                      onClick={() => {
                        setTargetColumn(h);
                        if (featureColumns.includes(h)) setFeatureColumns(f => f.filter(x => x !== h));
                      }}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all truncate ${
                        targetColumn === h 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-slate-100 font-bold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">2</span>
                  Select Feature Variables
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {headers.filter(h => h !== targetColumn).map(h => (
                    <button
                      key={h}
                      onClick={() => toggleFeature(h)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all truncate ${
                        featureColumns.includes(h)
                        ? 'bg-emerald-600 border-emerald-400 text-white' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center border-t border-slate-700 pt-8">
              <div className="text-slate-400 text-sm">
                Dataset ready: <span className="text-white font-bold">{data.length}</span> rows, <span className="text-white font-bold">{headers.length}</span> total columns.
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setData([])}
                  className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                >
                  Clear Data
                </button>
                <button 
                  onClick={startAudit}
                  disabled={loading || featureColumns.length === 0}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 ${
                    loading || featureColumns.length === 0
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Auditing Data...
                    </>
                  ) : (
                    <>
                      Start ML Audit
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && <div className="mt-4 text-red-400 text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</div>}
          </div>

          {summary && !loading && (
            <>
              <Visualizer summary={summary} />
              {report ? (
                <AuditReportView report={report} />
              ) : (
                <div className="text-center py-20 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-700">
                  <div className="animate-pulse text-slate-500">Processing Audit Results...</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        Built with Gemini-3-Pro for Production ML Quality Assurance.
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
