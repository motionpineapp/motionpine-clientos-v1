import { TeamMember } from '@shared/types';
import { MOCK_TEAM } from './mock-data';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const teamService = {
  getTeamMembers: async (): Promise<TeamMember[]> => {
    await delay(300);
    return Promise.resolve(MOCK_TEAM);
  },
  getTeamMember: async (id: string): Promise<TeamMember | undefined> => {
    await delay(300);
    const member = MOCK_TEAM.find(m => m.id === id);
    return Promise.resolve(member);
  },
};