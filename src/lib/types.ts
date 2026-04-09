export interface Question {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'text';
  options?: string[]; // Used for checkbox and radio
}

export interface Exam {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  questions: Question[];
  negativeMarking: boolean;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  examId: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
  tabSwitches: number;
  fullscreenExits: number;
}
