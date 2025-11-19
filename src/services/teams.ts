import { TeamMember } from '@shared/types';
const MOCK_TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Senior Designer',
    email: 'sarah@motionpine.com',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    phone: '+1 (555) 111-2222',
    joinedAt: '2022-03-15T00:00:00Z'
  },
  {
    id: 't2',
    name: 'Mike Ross',
    role: 'Frontend Developer',
    email: 'mike@motionpine.com',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    phone: '+1 (555) 333-4444',
    joinedAt: '2022-06-01T00:00:00Z'
  },
  {
    id: 't3',
    name: 'Jessica Pearson',
    role: 'Project Manager',
    email: 'jessica@motionpine.com',
    status: 'on-leave',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    phone: '+1 (555) 555-6666',
    joinedAt: '2021-11-10T00:00:00Z'
  },
  {
    id: 't4',
    name: 'Harvey Specter',
    role: 'Creative Director',
    email: 'harvey@motionpine.com',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harvey',
    phone: '+1 (555) 777-8888',
    joinedAt: '2021-01-05T00:00:00Z'
  },
  {
    id: 't5',
    name: 'Louis Litt',
    role: 'Finance Manager',
    email: 'louis@motionpine.com',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Louis',
    phone: '+1 (555) 999-0000',
    joinedAt: '2021-08-20T00:00:00Z'
  }
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const teamService = {
  getTeamMembers: async (): Promise<TeamMember[]> => {
    await delay(600);
    return [...MOCK_TEAM];
  },
  getTeamMember: async (id: string): Promise<TeamMember | undefined> => {
    await delay(300);
    return MOCK_TEAM.find(t => t.id === id);
  }
};