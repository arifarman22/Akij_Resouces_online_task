import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ExamFromApi {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: number;
  negativeMarking: boolean;
  questions: Array<{
    id: string;
    title: string;
    type: "checkbox" | "radio" | "text";
    options: string[];
    order: number;
  }>;
}

interface EmployerState {
  currentUser: UserInfo | null;
  accessToken: string | null;
  exams: ExamFromApi[];
  login: (user: UserInfo, accessToken: string) => void;
  logout: () => void;
  setExams: (exams: ExamFromApi[]) => void;
  addExam: (exam: ExamFromApi) => void;
  removeExam: (id: string) => void;
}

export const useEmployerStore = create<EmployerState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      exams: [],
      login: (user, accessToken) => set({ currentUser: user, accessToken }),
      logout: () => set({ currentUser: null, accessToken: null, exams: [] }),
      setExams: (exams) => set({ exams }),
      addExam: (exam) => set((state) => ({ exams: [exam, ...state.exams] })),
      removeExam: (id) => set((state) => ({ exams: state.exams.filter((e) => e.id !== id) })),
    }),
    { name: "employer-storage" }
  )
);
