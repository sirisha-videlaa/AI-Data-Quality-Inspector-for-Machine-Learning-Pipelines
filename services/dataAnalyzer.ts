
import { DataColumnInfo, DatasetSummary } from '../types';

export const analyzeDataset = (
  data: any[],
  targetCol: string,
  featureCols: string[]
): DatasetSummary => {
  const rowCount = data.length;
  const allCols = [targetCol, ...featureCols];
  
  const columns: DataColumnInfo[] = allCols.map(colName => {
    const values = data.map(row => row[colName]).filter(v => v !== undefined && v !== null && v !== '');
    const missingCount = rowCount - values.length;
    const uniqueValues = Array.from(new Set(values));
    const uniqueCount = uniqueValues.length;
    
    // Determine type
    const firstVal = values[0];
    let type: DataColumnInfo['type'] = 'other';
    if (typeof firstVal === 'number') type = 'numeric';
    else if (uniqueCount < 20 || typeof firstVal === 'string') type = 'categorical';

    const info: DataColumnInfo = {
      name: colName,
      type,
      missingCount,
      missingPercentage: (missingCount / rowCount) * 100,
      uniqueCount,
    };

    if (type === 'numeric') {
      const nums = values.map(v => Number(v)).filter(v => !isNaN(v));
      if (nums.length > 0) {
        info.min = Math.min(...nums);
        info.max = Math.max(...nums);
        info.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    } else if (type === 'categorical') {
      const counts: { [key: string]: number } = {};
      values.forEach(v => {
        counts[String(v)] = (counts[String(v)] || 0) + 1;
      });
      info.topCategories = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));
    }

    return info;
  });

  // Target Distribution
  const targetValues = data.map(row => row[targetCol]);
  const targetDist: { [key: string]: number } = {};
  targetValues.forEach(v => {
    const key = v === undefined || v === null || v === '' ? 'Missing' : String(v);
    targetDist[key] = (targetDist[key] || 0) + 1;
  });

  // Basic Correlation (Numeric only)
  const targetIsNumeric = columns.find(c => c.name === targetCol)?.type === 'numeric';
  if (targetIsNumeric) {
    columns.forEach(col => {
      if (col.name !== targetCol && col.type === 'numeric') {
        // Very simplified Pearson Correlation
        const x = data.map(r => Number(r[col.name]));
        const y = data.map(r => Number(r[targetCol]));
        col.correlationWithTarget = calculateCorrelation(x, y);
      }
    });
  }

  return {
    rowCount,
    columnCount: allCols.length,
    targetColumn: targetCol,
    featureColumns: featureCols,
    columns,
    targetDistribution: targetDist
  };
};

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    const valX = isNaN(x[i]) ? 0 : x[i];
    const valY = isNaN(y[i]) ? 0 : y[i];
    sumX += valX;
    sumY += valY;
    sumXY += valX * valY;
    sumX2 += valX * valX;
    sumY2 += valY * valY;
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
}
