export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Shared User type (compatible with both Auth service and Worker entities)
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'client';
  avatar?: string;
  company?: string;
}
export interface Chat {
  id: string;
  title: string;
  clientId?: string; // Optional link to a specific client
  lastMessage?: string;
  lastMessageTs?: number;
  unreadCount?: number;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
  senderName?: string;
  senderAvatar?: string;
  attachments?: string[]; // URLs
}
// Client Management Types
export type ClientStatus = 'active' | 'paused' | 'inactive';
export type AccountStatus = 'pending' | 'setup_initiated' | 'active' | 'expired' | 'used';
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
  accountStatus?: AccountStatus;
  magicToken?: string;
  tokenExpiry?: number;
  tokenUsedAt?: number;
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
// Expense Management Types
export interface Expense {
  id: string;
  item: string;
  cost: number;
  date: string; // ISO Date string
  assignedTo?: string; // Name of team member or department
  category?: 'infrastructure' | 'software' | 'office' | 'other';
}
export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string; // ISO Date string
  status: 'active' | 'canceled';
  icon?: string; // URL or identifier
}
// Team Management Types
export type TeamMemberStatus = 'active' | 'inactive' | 'on-leave';
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: TeamMemberStatus;
  avatar?: string;
  phone?: string;
  joinedAt: string; // ISO Date string
}
// Pine Credit System Types
export interface PineTransaction {
  id: string;
  clientId: string;
  type: 'purchase' | 'usage';
  amount: number;
  description: string;
  date: string; // ISO Date string
}