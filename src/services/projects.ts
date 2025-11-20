import { Project, ProjectStatus } from '@shared/types';
import { MOCK_PROJECTS } from './mock-data';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    await delay(300);
    return Promise.resolve(MOCK_PROJECTS);
  },
  getProject: async (id: string): Promise<Project | undefined> => {
    await delay(300);
    const project = MOCK_PROJECTS.find(p => p.id === id);
    return Promise.resolve(project);
  },
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    await delay(300);
    const projects = MOCK_PROJECTS.filter(p => p.clientId === clientId);
    return Promise.resolve(projects);
  },
  updateProjectStatus: async (id: string, status: ProjectStatus): Promise<Project | undefined> => {
    await delay(300);
    const project = MOCK_PROJECTS.find(p => p.id === id);
    if (project) {
      project.status = status;
      return Promise.resolve(project);
    }
    return Promise.resolve(undefined);
  },
};