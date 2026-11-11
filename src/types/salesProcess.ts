/**
 * Types for Sales Process Evaluation & Analytics System
 * Based on the 10-step Sales Flow Standard Operating Procedure (SOP)
 */

export type SalesChannel = 'LINE OA' | 'Facebook Inbox' | 'Instagram DM' | 'TikTok Shop' | 'หน้าร้าน/โทรศัพท์';

export type GradeType = 'A' | 'B' | 'C' | 'D';

export interface SOPCriterion {
  id: string;
  label: string;
  description: string;
  points: number; // Sub-points
  hint?: string;
}

export interface SOPStepDefinition {
  id: string;
  stepNumber: number;
  code: string;
  title: string;
  stageName: string; // e.g. "New Lead", "Engaged", "Quoted", "Won"
  description: string;
  sampleScript: string;
  maxPoints: number;
  criteria: SOPCriterion[];
  criticalNote?: string;
  isGoldenRule?: boolean;
}

export interface CaseEvaluation {
  id: string;
  date: string; // YYYY-MM-DD
  caseId: string; // e.g., "ORD-8821" or "LINE-CASE-104"
  salesRep: string; // Name of sales rep
  channel: SalesChannel;
  customerName: string;
  orderAmount?: number;
  productType?: string; // e.g., "กระเช้าผลไม้พรีเมียม 2,500 บาท"
  stepScores: Record<string, number>; // step id -> score (0 to maxPoints)
  checkedCriteria: Record<string, boolean>; // criterion id -> boolean
  totalScore: number; // 0 - 100
  percentage: number;
  grade: GradeType;
  evaluatorName: string;
  notes: string;
  transcriptExcerpt?: string;
  detectedMisses?: string[];
  createdAt: string;
}

export interface SalesRepStats {
  name: string;
  evaluationCount: number;
  averageScore: number;
  passRate: number; // % >= 80
  gradeCounts: Record<GradeType, number>;
  stepAverages: Record<string, number>;
  strongestStepId: string;
  weakestStepId: string;
}

export interface StepComplianceStat {
  stepId: string;
  stepNumber: number;
  title: string;
  averageScore: number;
  maxScore: number;
  complianceRate: number; // % of max
  failureCount: number;
  commonMisses: string[];
}
