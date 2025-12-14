
// --- HRM TYPES ---
export interface Employee {
  id: string;
  name: string;
  role: string; // Manager, Kasir, Kitchen, etc.
  outletId: string; // Changed to ID for relation
  outletName: string; // Display name
  status: 'Active' | 'On Leave' | 'Resigned';
  joinDate: string;
  salary: string; // This should be a number in real app, string for 'Rp 1.000.000' mock
  pin?: string; // Simple PIN for POS access
}

export interface Attendance {
    id: string;
    employeeId: string;
    outletId: string;
    clockIn: string; // ISO String
    clockOut?: string; // ISO String
    status: 'Present' | 'Late' | 'Absent' | 'On Leave';
    notes?: string;
}

export interface Payroll {
    id: string;
    employeeId: string;
    period: string; // "YYYY-MM"
    baseSalary: number;
    totalAttendance: number;
    allowance: number;
    bonus: number;
    deduction: number;
    netSalary: number;
    status: 'unpaid' | 'paid';
}

export interface JobVacancy {
    id: string;
    title: string;
    department: string;
    type: 'Full-time' | 'Part-time' | 'Internship';
    salaryRange: string;
    status: 'Draft' | 'Published' | 'Closed';
    description: string;
    applicantsCount: number;
    postedChannels: string[]; // e.g. ['LinkedIn', 'Website', 'Instagram']
    publishDate?: string;
}

export type RecruitmentStage = 'Applied' | 'Screening' | 'Interview' | 'Offering' | 'Hired' | 'Rejected' | 'TalentPool';

export interface InterviewScore {
    communication: number; // 1-5
    technical: number;     // 1-5
    attitude: number;      // 1-5
    culture: number;       // 1-5
    average: number;       // Calculated
}

export interface RecruitmentCandidate {
    id: string;
    name: string;
    roleApplied: string;
    source: string; // LinkedIn, Instagram, etc.
    stage: RecruitmentStage;
    
    // Legacy Score (Keep for compatibility or calculated total)
    score: number; 

    // Feature 1: AI Resume Matcher
    aiMatchScore?: number; // 0-100
    aiAnalysis?: string;   // Reason from AI
    
    // Feature 2: Structured Interview
    interviewScores?: InterviewScore;

    applyDate: string;
    avatar?: string;
    documents?: Record<string, string>; 
}
