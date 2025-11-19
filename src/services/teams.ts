import { TeamMember } from '@shared/types';
import { api } from '@/lib/api-client';
export const teamService = {
  getTeamMembers: async (): Promise<TeamMember[]> => {
    return api<TeamMember[]>('/api/teams');
  },
  getTeamMember: async (id: string): Promise<TeamMember | undefined> => {
    // Since we don't have a specific single-member endpoint in routes yet,
    // we can fetch all and find. Or add the route.
    // For now, let's fetch all to be safe with current routes.
    const members = await api<TeamMember[]>('/api/teams');
    return members.find(m => m.id === id);
  },
  createTeamMember: async (member: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> => {
    const newMember = {
      ...member,
      joinedAt: new Date().toISOString()
    };
    return api<TeamMember>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(newMember)
    });
  }
};