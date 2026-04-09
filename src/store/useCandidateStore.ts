import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ResultFromApi {
  id: string;
  candidateId: string;
  examId: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
  tabSwitches: number;
  fullscreenExits: number;
  candidate?: { id: string; email: string; name: string };
  exam?: { id: string; title: string };
}

interface CandidateState {
  currentUser: UserInfo | null;
  accessToken: string | null;
  results: ResultFromApi[];
  login: (user: UserInfo, accessToken: string) => void;
  logout: () => void;
  setResults: (results: ResultFromApi[]) => void;
  addResult: (result: ResultFromApi) => void;
}

export const useCandidateStore = create<CandidateState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      results: [],
      login: (user, accessToken) => set({ currentUser: user, accessToken }),
      logout: () => set({ currentUser: null, accessToken: null, results: [] }),
      setResults: (results) => set({ results }),
      addResult: (result) => set((state) => ({ results: [...state.results, result] })),
    }),
    { name: "candidate-storage" }
  )
);
