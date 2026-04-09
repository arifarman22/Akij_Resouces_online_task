import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  }
}

export function getTokens() {
  if (typeof window !== "undefined" && !accessToken) {
    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");
  }
  return { accessToken, refreshToken };
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

// Request interceptor: attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken: token } = getTokens();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthRoute = originalRequest.url?.startsWith("/auth/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken: rt } = getTokens();
        if (!rt) throw new Error("No refresh token");

        const res = await axios.post("/api/auth/refresh", { refreshToken: rt });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
        setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string, role: "EMPLOYER" | "CANDIDATE") => {
    const res = await api.post("/auth/login", { email, password, role });
    if (res.data.success) {
      setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res.data;
  },

  register: async (email: string, password: string, name: string) => {
    const res = await api.post("/auth/register", { email, password, name });
    if (res.data.success) {
      setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  logout: () => {
    clearTokens();
  },
};

// Exams API
export const examsApi = {
  getAll: async () => {
    const res = await api.get("/exams");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/exams/${id}`);
    return res.data;
  },

  create: async (examData: any) => {
    const res = await api.post("/exams", examData);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/exams/${id}`);
    return res.data;
  },
};

// Results API
export const resultsApi = {
  getAll: async (examId?: string) => {
    const params = examId ? `?examId=${examId}` : "";
    const res = await api.get(`/results${params}`);
    return res.data;
  },

  submit: async (data: {
    examId: string;
    answers: Record<string, string | string[]>;
    tabSwitches: number;
    fullscreenExits: number;
  }) => {
    const res = await api.post("/results", data);
    return res.data;
  },
};

export default api;
