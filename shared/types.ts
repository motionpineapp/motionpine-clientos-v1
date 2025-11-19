export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Shared User type (compatible with both Auth service and Worker entities)
export interface User {
  id: string;
  name: string;
  email?: string;
  role?: 'admin' | 'client';
  avatar?: string;
  company?: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// Client Management Types
export type ClientStatus = 'active' | 'paused' | 'inactive';
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: ClientStatus;
  avatar?: string;
  totalProjects: number;
  totalRevenue: number;
  joinedAt: string; // ISO Date string
  phone?: string;
  address?: string;
}
// Project Management Types
export type ProjectStatus = 'todo' | 'in-progress' | 'done';
export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  dueDate?: string; // ISO Date string
  createdAt: string; // ISO Date string
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}