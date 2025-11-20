import { TeamMember } from '@shared/types';
import { MOCK_TEAM } from './mock-data';
export const teamService = {
  getTeamMembers: async (): Promise<{ items: TeamMember[] }> => {
    return Promise.resolve({ items: MOCK_TEAM });
  },
  createTeamMember: async (data: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    const newMember: TeamMember = { id: `t${MOCK_TEAM.length + 1}`, ...data };
    // In a real mock, you'd push this to an array
    return Promise.resolve(newMember);
  },
};