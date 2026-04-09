import { Exam, CandidateResult } from "@/lib/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_USERS = {
  employer: { email: "employer@example.com", password: "password123", role: "employer" as const },
  candidate: { email: "candidate@example.com", password: "password123", role: "candidate" as const },
};

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: { email: string; name: string; role: "employer" | "candidate" };
  error?: string;
}

export const mockApi = {
  auth: {
    loginEmployer: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(500);
      if (email === MOCK_USERS.employer.email && password === MOCK_USERS.employer.password) {
        return { success: true, token: "mock-jwt-employer-" + Date.now(), user: { email, name: "Admin", role: "employer" } };
      }
      // Allow any credentials for demo
      return { success: true, token: "mock-jwt-employer-" + Date.now(), user: { email, name: "Employer", role: "employer" } };
    },
    loginCandidate: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(500);
      return { success: true, token: "mock-jwt-candidate-" + Date.now(), user: { email, name: email.split("@")[0], role: "candidate" } };
    },
  },
  exams: {
    getAll: async (): Promise<Exam[]> => {
      await delay(300);
      const stored = localStorage.getItem("employer-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.state?.exams || [];
      }
      return [];
    },
    create: async (exam: Exam): Promise<{ success: boolean; exam: Exam }> => {
      await delay(400);
      return { success: true, exam };
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      await delay(300);
      return { success: true };
    },
  },
  results: {
    submit: async (result: CandidateResult): Promise<{ success: boolean }> => {
      await delay(500);
      return { success: true };
    },
    getByExam: async (examId: string): Promise<CandidateResult[]> => {
      await delay(300);
      const stored = localStorage.getItem("candidate-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        return (parsed.state?.results || []).filter((r: CandidateResult) => r.examId === examId);
      }
      return [];
    },
  },
};
