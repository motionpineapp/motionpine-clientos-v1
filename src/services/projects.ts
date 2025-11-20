import { Project } from '@shared/types';
import { api } from '@/lib/api-client';
export const projectService = {
  getProjects: async (): Promise<{ items: Project[] }> => {
    return api<{ items: Project[] }>('/api/projects');
  },
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    return api<Project[]>(`/api/projects/client/${clientId}`);
  },
  createProject: async (projectData: Omit<Project, 'id' | 'createdAt' | 'clientName'>): Promise<Project> => {
    return api<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
};