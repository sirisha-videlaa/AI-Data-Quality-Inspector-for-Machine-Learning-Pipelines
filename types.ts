
export interface DataColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'id' | 'other';
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
  topCategories?: { value: string; count: number }[];
  correlationWithTarget?: number;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  targetColumn: string;
  featureColumns: string[];
  columns: DataColumnInfo[];
  targetDistribution: { [key: string]: number };
}

export interface AuditReport {
  healthScore: number;
  criticalIssues: string[];
  moderateIssues: string[];
  featureWarnings: { [feature: string]: string };
  leakageRisk: {
    level: 'Low' | 'Medium' | 'High';
    explanation: string;
  };
  recommendedActions: string[];
  finalVerdict: {
    safe: 'Yes' | 'No' | 'With Conditions';
    reason: string;
  };
}
