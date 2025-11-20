import { Project } from '@shared/types';
import { MOCK_PROJECTS } from './mock-data';
let projects = [...MOCK_PROJECTS];
export const projectService = {
  getProjects: async (): Promise<{ items: Project[] }> => {
    return Promise.resolve({ items: projects });
  },
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    return Promise.resolve(clientProjects);
  },
  createProject: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const newProject: Project = {
      id: `p${projects.length + 1}`,
      ...projectData,
    };
    projects.push(newProject);
    return Promise.resolve(newProject);
  },
  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    let updatedProject: Project | null = null;
    projects = projects.map(p => {
      if (p.id === id) {
        updatedProject = { ...p, ...projectData };
        return updatedProject;
      }
      return p;
    });
    if (updatedProject) {
      return Promise.resolve(updatedProject);
    }
    return Promise.reject(new Error('Project not found'));
  },
};