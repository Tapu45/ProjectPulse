import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config: import("axios").InternalAxiosRequestConfig<any>) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default api;

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const API_ROUTES = {
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    CURRENT_USER: `${BASE_URL}/api/auth/me`,
    FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,
  },

  ISSUES: {
    CREATE: `${BASE_URL}/api/complain`,
    GET_ALL: `${BASE_URL}/api/complain`,
    GET_BY_ID: (id: string) => `${BASE_URL}/api/complain/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/api/complain/${id}`,
    DELETE: (id: string) => `${BASE_URL}/issues/${id}`,
    GET_USER_COMPLAINTS: `${BASE_URL}/api/complain/user`,
    GET_ASSIGNED_COMPLAINTS: `${BASE_URL}/api/complain/assigned`,
    UPDATE_STATUS: (id: string) => `${BASE_URL}/api/complain/${id}/resolve`,
    RESPOND_TO_RESOLUTION: (id: string) => `/api/complain/${id}/respond-resolution`,
    GET_COMPLAINT_STATS: `${BASE_URL}/api/complain/stats`,
  },

  DASHBOARD: {
    STATS: `${BASE_URL}/api/dashboard/stats`,
    CATEGORY_STATS: `${BASE_URL}/api/dashboard/category-stats`,
    STATUS_STATS: `${BASE_URL}/api/dashboard/status-stats`,
    PRIORITY_STATS: `${BASE_URL}/api/dashboard/priority-stats`,
    COMPLAINTS_TREND: `${BASE_URL}/api/dashboard/complaints-trend`,
    PROJECT_STATS: `${BASE_URL}/api/dashboard/project-stats`,
    RESOLUTION_TIME: `${BASE_URL}/api/dashboard/resolution-time`,
    WORKLOAD: `${BASE_URL}/api/dashboard/workload`,
  },

  PROJECTS: {
    GET_ALL: `${BASE_URL}/api/projects`,
    GET_BY_ID: (id: string) => `${BASE_URL}/api/projects/${id}`,
    CREATE: `${BASE_URL}/api/projects`,
    UPDATE: (id: string) => `${BASE_URL}/api/projects/${id}`,
    DELETE: (id: string) => `${BASE_URL}/api/projects/${id}`,
  },

  USERS: {
    GET_ALL: `${BASE_URL}/users`,
    GET_BY_ID: (id: string) => `${BASE_URL}/users/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/users/${id}`,
    DELETE: (id: string) => `${BASE_URL}/users/${id}`,
    
  },

  NOTIFICATIONS: {
    GET_ALL: `${BASE_URL}/api/notifications`,
    UNREAD_COUNT: `${BASE_URL}/api/notifications/unread-count`,
    MARK_AS_READ: (id: string) => `${BASE_URL}/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${BASE_URL}/api/notifications/read-all`,
    DELETE: (id: string) => `${BASE_URL}/api/notifications/${id}`,
    DELETE_ALL_READ: `${BASE_URL}/api/notifications/read`,
  },

  RESPONSES: {
    CREATE: (issueId: string) => `${BASE_URL}/issues/${issueId}/responses`,
    GET_ALL: (issueId: string) => `${BASE_URL}/issues/${issueId}/responses`,
    DELETE: (issueId: string, responseId: string) =>
      `${BASE_URL}/issues/${issueId}/responses/${responseId}`,
  },
  ASSIGNMENT: {
    ASSIGN: `${BASE_URL}/api/assignment/assign`,
    GET_ASSIGNABLE_STAFF: `${BASE_URL}/api/assignment/assignable-staff`,
    BALANCE_WORKLOAD: `${BASE_URL}/api/assignment/balance-workload`,
    // GET_ASSIGNMENT_HISTORY: (complaintId: string) => 
    //   `${BASE_URL}/api/admin/assignment-history/${complaintId}`,
  },
  ADMIN: {
    CREATE_USER: `${BASE_URL}/api/admin`,
    GET_USERS: `${BASE_URL}/api/admin/users`,
    GET_USER_BY_ID: (id: string) => `${BASE_URL}/api/admin/users/${id}`,
    UPDATE_USER: (id: string) => `/api/admin/users/${id}`,
    DELETE_USER: (id: string) => `/api/admin/users/${id}`,
    CREATE_TEAM: `${BASE_URL}/api/admin/teams`,
    GET_TEAMS: `${BASE_URL}/api/admin/teams`,
    GET_TEAM_BY_ID: (id: string) => `${BASE_URL}/api/admin/teams/${id}`,
    UPDATE_TEAM: (id: string) => `${BASE_URL}/api/admin/teams/${id}`,
    DELETE_TEAM: (id: string) => `${BASE_URL}/api/admin/teams/${id}`,
    ADD_TEAM_MEMBER: (teamId: string) => `${BASE_URL}/api/admin/teams/${teamId}/members`,
    REMOVE_TEAM_MEMBER: (teamId: string, memberId: string) =>
      `${BASE_URL}/api/admin/teams/${teamId}/members/${memberId}`,

  },
};