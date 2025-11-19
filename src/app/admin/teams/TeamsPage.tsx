import React, { useEffect, useState } from 'react';
import { teamService } from '@/services/teams';
import { TeamMember } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Phone, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadTeam();
  }, []);
  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const data = await teamService.getTeamMembers();
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
      case 'on-leave': return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Team Directory"
        description="Manage your agency team members and roles."
      >
        <Button onClick={() => toast.info('Invite Member Modal')}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading directory...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-gray-50 group-hover:border-primary/10 transition-colors">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white ${
                    member.status === 'active' ? 'bg-green-500' : 
                    member.status === 'on-leave' ? 'bg-orange-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{member.role}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(member.status)}>
                  {member.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <div className="w-full pt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start h-9 text-sm font-normal text-muted-foreground hover:text-foreground" onClick={() => window.location.href = `mailto:${member.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {member.email}
                  </Button>
                  {member.phone && (
                    <Button variant="outline" className="w-full justify-start h-9 text-sm font-normal text-muted-foreground hover:text-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {member.phone}
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-3 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {/* Add New Card Placeholder */}
          <button 
            onClick={() => toast.info('Invite Member Modal')}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:bg-gray-50 transition-all group h-full min-h-[300px]"
          >
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900">Add Team Member</h3>
            <p className="text-sm text-muted-foreground mt-1">Invite a new colleague</p>
          </button>
        </div>
      )}
    </div>
  );
}