import { Project, ProjectStatus } from '@shared/types';
import { api } from '@/lib/api-client';
export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    return api<Project[]>('/api/projects');
  },
  getProject: async (id: string): Promise<Project | undefined> => {
    try {
      return await api<Project>(`/api/projects/${id}`);
    } catch (e) {
      return undefined;
    }
  },
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    return api<Project[]>(`/api/clients/${clientId}/projects`);
  },
  updateProjectStatus: async (id: string, status: ProjectStatus): Promise<Project | undefined> => {
    return api<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },
  createProject: async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const newProject = {
      ...data,
      createdAt: new Date().toISOString()
    };
    return api<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProject)
    });
  },
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    return api<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};