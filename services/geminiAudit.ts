
import { GoogleGenAI } from "@google/genai";
import { DatasetSummary, AuditReport } from "../types";

export const generateAuditReport = async (summary: DatasetSummary): Promise<AuditReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
You are an expert Machine Learning Engineer and Data Quality Auditor.
Perform a data quality audit based on the following dataset summary. 
The actual data is not provided, only these aggregated statistics.

Dataset Details:
- Rows: ${summary.rowCount}
- Target: ${summary.targetColumn}
- Features: ${summary.featureColumns.join(', ')}

Column Summaries:
${summary.columns.map(c => `- ${c.name}: Type=${c.type}, Missing=${c.missingPercentage.toFixed(2)}%, Uniques=${c.uniqueCount}, ${c.correlationWithTarget !== undefined ? `CorrelationWithTarget=${c.correlationWithTarget.toFixed(3)}` : ''}`).join('\n')}

Target Distribution:
${JSON.stringify(summary.targetDistribution, null, 2)}

Audit Requirements:
1. Missing Data Analysis: Identify risks from the provided missing percentages.
2. Target Distribution: Flag class imbalance or regression skew.
3. Data Leakage: Flag features with suspicious correlations (e.g., > 0.95 or exactly 1.0) or proxy variables.
4. Feature Quality: Detect low variance (uniques=1) or high cardinality IDs.
5. Generalization Risk: Mention any columns like 'date' or 'id' that might drift.

Return ONLY a JSON object matching this structure:
{
  "healthScore": number,
  "criticalIssues": string[],
  "moderateIssues": string[],
  "featureWarnings": { "featureName": "explanation" },
  "leakageRisk": { "level": "Low" | "Medium" | "High", "explanation": string },
  "recommendedActions": string[],
  "finalVerdict": { "safe": "Yes" | "No" | "With Conditions", "reason": string }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as AuditReport;
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    throw error;
  }
};
