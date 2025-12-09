import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { pineService } from '@/services/pines';
import { useAuthStore } from '@/services/auth';
import type { ServiceType } from '@shared/types';
import { Plus, Trash2, TreePine, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectDraft {
  id: string;
  serviceTypeId: string;
  title: string;
  brief: string;
  referenceLinks: string;
  isExpanded: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  reels: { label: 'Reels & Short-Form', icon: '🎬' },
  ads: { label: 'Ads & Commerce', icon: '📺' },
  longform: { label: 'Long-Form', icon: '🎙️' },
};

export function IntakePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [balance, setBalance] = useState(0);
  const [projects, setProjects] = useState<ProjectDraft[]>([
    { id: crypto.randomUUID(), serviceTypeId: '', title: '', brief: '', referenceLinks: '', isExpanded: true }
  ]);

  // Get client ID from user
  const clientId = user?.id;

  useEffect(() => {
    async function loadData() {
      if (!clientId) return;
      try {
        const [types, bal] = await Promise.all([
          pineService.getServiceTypes(),
          pineService.getBalance(clientId)
        ]);
        setServiceTypes(types);
        setBalance(bal);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load service types');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId]);

  // Group services by category
  const servicesByCategory = serviceTypes.reduce((acc, service) => {
    const cat = service.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, ServiceType[]>);

  // Calculate totals
  const totalPines = projects.reduce((sum, p) => {
    const service = serviceTypes.find(s => s.id === p.serviceTypeId);
    return sum + (service?.pineCost || 0);
  }, 0);

  const balanceAfter = balance - totalPines;
  const hasInsufficientFunds = balanceAfter < 0;
  const hasValidProjects = projects.every(p => p.serviceTypeId && p.title.trim());

  // Handlers
  const addProject = () => {
    setProjects(prev => prev.map(p => ({ ...p, isExpanded: false })).concat({
      id: crypto.randomUUID(),
      serviceTypeId: '',
      title: '',
      brief: '',
      referenceLinks: '',
      isExpanded: true
    }));
  };

  const removeProject = (id: string) => {
    if (projects.length === 1) return;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = (id: string, updates: Partial<ProjectDraft>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const toggleExpand = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const handleSubmit = async () => {
    if (!clientId || !hasValidProjects || hasInsufficientFunds) return;

    setSubmitting(true);
    try {
      const result = await pineService.createProjects(clientId, projects.map(p => ({
        serviceTypeId: p.serviceTypeId,
        title: p.title,
        brief: p.brief || undefined,
        referenceLinks: p.referenceLinks || undefined,
      })));

      toast.success(`${result.projects.length} project(s) submitted! ${result.totalPinesDeducted} 🌲 deducted.`);
      navigate('/client/projects');
    } catch (error) {
      console.error('Failed to submit projects:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit projects');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="New Project Request"
          description="Select services and submit your projects"
        />

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TreePine className="h-6 w-6" />
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-2xl font-bold">{balance} Pines</p>
              </div>
            </div>
            {totalPines > 0 && (
              <div className="text-right">
                <p className="text-sm opacity-90">After Submission</p>
                <p className={`text-2xl font-bold ${hasInsufficientFunds ? 'text-red-200' : ''}`}>
                  {balanceAfter} Pines
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {hasInsufficientFunds && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient pines. You need {totalPines} but only have {balance}.
              <Button variant="link" className="px-2 h-auto" onClick={() => navigate('/client/wallet')}>
                Top up now →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project, index) => {
            const service = serviceTypes.find(s => s.id === project.serviceTypeId);

            return (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader
                  className="py-3 px-4 bg-gray-50 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                    {project.isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    {!project.isExpanded && service && (
                      <span className="text-sm text-muted-foreground">
                        {service.name} • {project.title || 'Untitled'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {service && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {service.pineCost} 🌲
                      </Badge>
                    )}
                    {projects.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); removeProject(project.id); }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {project.isExpanded && (
                  <CardContent className="p-4 space-y-4">
                    {/* Service Type Selector */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Service Type</Label>
                      <div className="space-y-4">
                        {Object.entries(servicesByCategory).map(([category, services]) => (
                          <div key={category}>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {CATEGORY_LABELS[category]?.icon} {CATEGORY_LABELS[category]?.label || category}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {services.map(s => (
                                <div
                                  key={s.id}
                                  onClick={() => updateProject(project.id, { serviceTypeId: s.id })}
                                  className={`
                                    p-3 rounded-lg border-2 cursor-pointer transition-all
                                    ${project.serviceTypeId === s.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-gray-200 hover:border-gray-300'}
                                    ${balance < s.pineCost ? 'opacity-50' : ''}
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{s.name}</span>
                                    <Badge variant="secondary">{s.pineCost} 🌲</Badge>
                                  </div>
                                  {s.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Title */}
                    <div className="space-y-2">
                      <Label htmlFor={`title-${project.id}`}>Project Title *</Label>
                      <Input
                        id={`title-${project.id}`}
                        value={project.title}
                        onChange={(e) => updateProject(project.id, { title: e.target.value })}
                        placeholder="e.g., Product Launch Reel"
                      />
                    </div>

                    {/* Brief */}
                    <div className="space-y-2">
                      <Label htmlFor={`brief-${project.id}`}>Brief / Description</Label>
                      <Textarea
                        id={`brief-${project.id}`}
                        value={project.brief}
                        onChange={(e) => updateProject(project.id, { brief: e.target.value })}
                        placeholder="Describe what you need for this project..."
                        rows={3}
                      />
                    </div>

                    {/* Reference Links */}
                    <div className="space-y-2">
                      <Label htmlFor={`links-${project.id}`}>Reference Links</Label>
                      <Textarea
                        id={`links-${project.id}`}
                        value={project.referenceLinks}
                        onChange={(e) => updateProject(project.id, { referenceLinks: e.target.value })}
                        placeholder="Paste Google Drive, Dropbox, or example links..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Add Another Project */}
        <Button variant="outline" onClick={addProject} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Project
        </Button>

        {/* Order Summary & Submit */}
        <Card className="sticky bottom-4 bg-white shadow-lg border-2">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {projects.length} project{projects.length > 1 ? 's' : ''} • Total
                </p>
                <p className="text-2xl font-bold text-emerald-600">{totalPines} 🌲</p>
              </div>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!hasValidProjects || hasInsufficientFunds || submitting}
                className="min-w-[200px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Submit {projects.length > 1 ? `${projects.length} Projects` : 'Project'} — {totalPines} 🌲
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}