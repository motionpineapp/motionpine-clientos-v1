import { Project, ProjectStatus } from '@shared/types';
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Website Redesign',
    clientId: 'c1',
    clientName: 'Acme Corp',
    status: 'in-progress',
    dueDate: '2023-12-01T00:00:00Z',
    createdAt: '2023-10-15T00:00:00Z',
    priority: 'high',
    description: 'Complete overhaul of the corporate website with new branding.'
  },
  {
    id: 'p2',
    title: 'Q4 Marketing Campaign',
    clientId: 'c1',
    clientName: 'Acme Corp',
    status: 'todo',
    dueDate: '2023-11-20T00:00:00Z',
    createdAt: '2023-10-20T00:00:00Z',
    priority: 'medium',
    description: 'Social media assets and ad copy for Q4 push.'
  },
  {
    id: 'p3',
    title: 'Mobile App MVP',
    clientId: 'c2',
    clientName: 'TechStart Inc',
    status: 'in-progress',
    dueDate: '2024-01-15T00:00:00Z',
    createdAt: '2023-09-01T00:00:00Z',
    priority: 'high',
    description: 'Initial release of the iOS and Android application.'
  },
  {
    id: 'p4',
    title: 'Brand Identity Refresh',
    clientId: 'c3',
    clientName: 'Global Media',
    status: 'done',
    dueDate: '2023-10-01T00:00:00Z',
    createdAt: '2023-08-15T00:00:00Z',
    priority: 'medium',
    description: 'Logo update and brand guidelines document.'
  },
  {
    id: 'p5',
    title: 'E-commerce Integration',
    clientId: 'c4',
    clientName: 'Wonder Design',
    status: 'done',
    dueDate: '2023-09-30T00:00:00Z',
    createdAt: '2023-07-10T00:00:00Z',
    priority: 'high',
    description: 'Shopify integration for the main product line.'
  },
  {
    id: 'p6',
    title: 'SEO Audit',
    clientId: 'c5',
    clientName: 'Wright Architecture',
    status: 'todo',
    dueDate: '2023-11-10T00:00:00Z',
    createdAt: '2023-10-25T00:00:00Z',
    priority: 'low',
    description: 'Technical SEO audit and content recommendations.'
  }
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    await delay(600);
    return [...MOCK_PROJECTS];
  },
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    await delay(400);
    return MOCK_PROJECTS.filter(p => p.clientId === clientId);
  },
  updateProjectStatus: async (id: string, status: ProjectStatus): Promise<Project | undefined> => {
    await delay(500);
    const project = MOCK_PROJECTS.find(p => p.id === id);
    if (project) {
      project.status = status;
    }
    return project;
  },
  createProject: async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    await delay(700);
    const newProject: Project = {
      ...data,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    MOCK_PROJECTS.push(newProject);
    return newProject;
  }
};