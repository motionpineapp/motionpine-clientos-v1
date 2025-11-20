import { TeamMember } from '@shared/types';
import { api } from '@/lib/api-client';
export const teamService = {
  getTeamMembers: async (): Promise<{ items: TeamMember[] }> => {
    return api('/api/team');
  },
  createTeamMember: async (data: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    return api('/api/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};