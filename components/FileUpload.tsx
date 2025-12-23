
import React from 'react';

interface FileUploadProps {
  onDataLoaded: (data: any[], columns: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => {
          const val = values[i]?.trim();
          // Simple type conversion
          if (val === '') obj[h] = null;
          else if (!isNaN(Number(val))) obj[h] = Number(val);
          else obj[h] = val;
        });
        return obj;
      }).filter(row => Object.keys(row).length > 0 && row[headers[0]] !== undefined);

      onDataLoaded(rows, headers);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-12 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csv-upload"
      />
      <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 group-hover:text-blue-400 mb-4 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xl font-semibold mb-2">Upload Dataset</span>
        <span className="text-slate-500 text-sm text-center">Drag and drop or click to select a .csv file<br/>(First row must be headers)</span>
      </label>
    </div>
  );
};

export default FileUpload;
