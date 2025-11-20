import { TeamMember } from '@shared/types';
import { api } from '@/lib/api-client';
export const teamService = {
  getTeamMembers: async (): Promise<{ items: TeamMember[] }> => {
    return api<{ items: TeamMember[] }>('/api/team');
  },
  createTeamMember: async (data: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> => {
    return api<TeamMember>('/api/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};