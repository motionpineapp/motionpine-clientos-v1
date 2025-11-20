import { Project } from '@shared/types';
import { api } from '@/lib/api-client';
export const projectService = {
  getProjects: async (): Promise<{ items: Project[] }> => {
    return api('/api/projects');
  },
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    return api(`/api/clients/${clientId}/projects`);
  },
  createProject: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    return api('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    return api(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },
};