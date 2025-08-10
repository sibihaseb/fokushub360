import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Users, Filter, Target, Plus, Trash2, Edit, Save } from 'lucide-react';

interface EmailSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  userCount: number;
  lastUpdated: string;
}

interface SegmentCriteria {
  role?: string[];
  verificationStatus?: string[];
  campaignParticipation?: {
    min?: number;
    max?: number;
  };
  earnings?: {
    min?: number;
    max?: number;
  };
  joinDate?: {
    after?: string;
    before?: string;
  };
  lastActivity?: {
    after?: string;
    before?: string;
  };
  demographics?: {
    ageRange?: {
      min: number;
      max: number;
    };
    location?: string[];
    gender?: string[];
    interests?: string[];
  };
  behaviorMetrics?: {
    responseRate?: {
      min?: number;
      max?: number;
    };
    qualityScore?: {
      min?: number;
      max?: number;
    };
    punctualityScore?: {
      min?: number;
      max?: number;
    };
  };
  customFields?: {
    [key: string]: any;
  };
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verificationStatus: string;
  joinDate: string;
  lastActivity: string;
  totalEarnings: number;
  campaignCount: number;
  responseRate: number;
  qualityScore: number;
  punctualityScore: number;
  profile?: {
    age?: number;
    location?: string;
    gender?: string;
    interests?: string[];
  };
}

export default function EmailSegmentation() {
  const [editingSegment, setEditingSegment] = useState<EmailSegment | null>(null);
  const [newSegment, setNewSegment] = useState<Omit<EmailSegment, 'id' | 'userCount' | 'lastUpdated'>>({
    name: '',
    description: '',
    criteria: {}
  });
  const [previewUsers, setPreviewUsers] = useState<User[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing segments
  const { data: segments = [], isLoading } = useQuery<EmailSegment[]>({
    queryKey: ["/api/admin/email-segments"],
  });

  // Fetch all users for segmentation
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users-detailed"],
  });

  // Create/Update segment mutation
  const saveSegmentMutation = useMutation({
    mutationFn: (segment: Omit<EmailSegment, 'id' | 'userCount' | 'lastUpdated'>) => 
      editingSegment
        ? apiRequest(`/api/admin/email-segments/${editingSegment.id}`, "PUT", segment)
        : apiRequest("/api/admin/email-segments", "POST", segment),
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Segment ${editingSegment ? 'updated' : 'created'} successfully`,
      });
      setEditingSegment(null);
      setNewSegment({ name: '', description: '', criteria: {} });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-segments"] });
    },
  });

  // Delete segment mutation
  const deleteSegmentMutation = useMutation({
    mutationFn: (segmentId: string) => 
      apiRequest(`/api/admin/email-segments/${segmentId}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-segments"] });
    },
  });

  // Preview segment mutation
  const previewSegmentMutation = useMutation({
    mutationFn: (criteria: SegmentCriteria) => 
      apiRequest("/api/admin/email-segments/preview", "POST", { criteria }),
    onSuccess: (data) => {
      setPreviewUsers(data.users);
      setShowPreview(true);
    },
  });

  const handleSaveSegment = () => {
    const segmentData = editingSegment ? {
      ...editingSegment,
      ...newSegment
    } : newSegment;

    saveSegmentMutation.mutate(segmentData);
  };

  const handleEditSegment = (segment: EmailSegment) => {
    setEditingSegment(segment);
    setNewSegment({
      name: segment.name,
      description: segment.description,
      criteria: segment.criteria
    });
  };

  const handlePreviewSegment = () => {
    previewSegmentMutation.mutate(newSegment.criteria);
  };

  const updateCriteria = (key: string, value: any) => {
    setNewSegment(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: value
      }
    }));
  };

  const predefinedSegments = [
    {
      name: 'High-Value Participants',
      description: 'Top earning participants with high quality scores',
      criteria: {
        role: ['participant'],
        earnings: { min: 500 },
        behaviorMetrics: { 
          qualityScore: { min: 8 },
          responseRate: { min: 85 }
        }
      }
    },
    {
      name: 'New Clients',
      description: 'Clients who joined in the last 30 days',
      criteria: {
        role: ['client'],
        joinDate: { after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      }
    },
    {
      name: 'Inactive Users',
      description: 'Users who haven\'t been active in 60 days',
      criteria: {
        lastActivity: { before: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }
      }
    },
    {
      name: 'Unverified Participants',
      description: 'Participants who haven\'t completed verification',
      criteria: {
        role: ['participant'],
        verificationStatus: ['pending', 'rejected']
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Email Segmentation</h2>
        <Button
          onClick={() => setEditingSegment(null)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Segment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Builder */}
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingSegment ? 'Edit Segment' : 'Create New Segment'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Segment Name</Label>
              <Input
                value={newSegment.name}
                onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter segment name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Description</Label>
              <Input
                value={newSegment.description}
                onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Describe this segment"
              />
            </div>

            {/* User Role Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">User Roles</Label>
              <div className="flex flex-wrap gap-2">
                {['client', 'participant', 'manager', 'admin'].map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={newSegment.criteria.role?.includes(role)}
                      onCheckedChange={(checked) => {
                        const currentRoles = newSegment.criteria.role || [];
                        const updatedRoles = checked
                          ? [...currentRoles, role]
                          : currentRoles.filter(r => r !== role);
                        updateCriteria('role', updatedRoles);
                      }}
                    />
                    <Label htmlFor={role} className="text-slate-300 capitalize">{role}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">Verification Status</Label>
              <div className="flex flex-wrap gap-2">
                {['verified', 'pending', 'rejected'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={newSegment.criteria.verificationStatus?.includes(status)}
                      onCheckedChange={(checked) => {
                        const currentStatus = newSegment.criteria.verificationStatus || [];
                        const updatedStatus = checked
                          ? [...currentStatus, status]
                          : currentStatus.filter(s => s !== status);
                        updateCriteria('verificationStatus', updatedStatus);
                      }}
                    />
                    <Label htmlFor={status} className="text-slate-300 capitalize">{status}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Range Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">Earnings Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min earnings"
                  value={newSegment.criteria.earnings?.min || ''}
                  onChange={(e) => updateCriteria('earnings', {
                    ...newSegment.criteria.earnings,
                    min: parseInt(e.target.value) || undefined
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max earnings"
                  value={newSegment.criteria.earnings?.max || ''}
                  onChange={(e) => updateCriteria('earnings', {
                    ...newSegment.criteria.earnings,
                    max: parseInt(e.target.value) || undefined
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Campaign Participation Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">Campaign Participation</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min campaigns"
                  value={newSegment.criteria.campaignParticipation?.min || ''}
                  onChange={(e) => updateCriteria('campaignParticipation', {
                    ...newSegment.criteria.campaignParticipation,
                    min: parseInt(e.target.value) || undefined
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max campaigns"
                  value={newSegment.criteria.campaignParticipation?.max || ''}
                  onChange={(e) => updateCriteria('campaignParticipation', {
                    ...newSegment.criteria.campaignParticipation,
                    max: parseInt(e.target.value) || undefined
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Quality Score Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">Quality Score Range (1-10)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min score"
                  min="1"
                  max="10"
                  value={newSegment.criteria.behaviorMetrics?.qualityScore?.min || ''}
                  onChange={(e) => updateCriteria('behaviorMetrics', {
                    ...newSegment.criteria.behaviorMetrics,
                    qualityScore: {
                      ...newSegment.criteria.behaviorMetrics?.qualityScore,
                      min: parseInt(e.target.value) || undefined
                    }
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max score"
                  min="1"
                  max="10"
                  value={newSegment.criteria.behaviorMetrics?.qualityScore?.max || ''}
                  onChange={(e) => updateCriteria('behaviorMetrics', {
                    ...newSegment.criteria.behaviorMetrics,
                    qualityScore: {
                      ...newSegment.criteria.behaviorMetrics?.qualityScore,
                      max: parseInt(e.target.value) || undefined
                    }
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Age Range Filter */}
            <div className="space-y-2">
              <Label className="text-slate-200">Age Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min age"
                  min="13"
                  max="100"
                  value={newSegment.criteria.demographics?.ageRange?.min || ''}
                  onChange={(e) => updateCriteria('demographics', {
                    ...newSegment.criteria.demographics,
                    ageRange: {
                      ...newSegment.criteria.demographics?.ageRange,
                      min: parseInt(e.target.value) || undefined
                    }
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  min="13"
                  max="100"
                  value={newSegment.criteria.demographics?.ageRange?.max || ''}
                  onChange={(e) => updateCriteria('demographics', {
                    ...newSegment.criteria.demographics,
                    ageRange: {
                      ...newSegment.criteria.demographics?.ageRange,
                      max: parseInt(e.target.value) || undefined
                    }
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePreviewSegment}
                disabled={previewSegmentMutation.isPending}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                {previewSegmentMutation.isPending ? 'Loading...' : 'Preview'}
              </Button>
              <Button
                onClick={handleSaveSegment}
                disabled={saveSegmentMutation.isPending || !newSegment.name}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveSegmentMutation.isPending ? 'Saving...' : 'Save Segment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Segments */}
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Existing Segments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-slate-400">Loading segments...</div>
            ) : segments.length === 0 ? (
              <div className="text-slate-400">No segments created yet</div>
            ) : (
              segments.map((segment) => (
                <div key={segment.id} className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{segment.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditSegment(segment)}
                        variant="outline"
                        size="sm"
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => deleteSegmentMutation.mutate(segment.id)}
                        variant="outline"
                        size="sm"
                        className="bg-red-800 border-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{segment.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-blue-800 text-blue-200">
                      <Users className="w-3 h-3 mr-1" />
                      {segment.userCount} users
                    </Badge>
                    <span className="text-slate-400 text-xs">
                      Updated: {new Date(segment.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Predefined Segments */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Quick Start Templates</h4>
              <div className="space-y-2">
                {predefinedSegments.map((template, index) => (
                  <div key={index} className="bg-slate-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-white text-sm font-medium">{template.name}</h5>
                        <p className="text-slate-300 text-xs">{template.description}</p>
                      </div>
                      <Button
                        onClick={() => setNewSegment({
                          name: template.name,
                          description: template.description,
                          criteria: template.criteria
                        })}
                        variant="outline"
                        size="sm"
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Results */}
      {showPreview && (
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Segment Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant="secondary" className="bg-blue-800 text-blue-200">
                <Users className="w-4 h-4 mr-2" />
                {previewUsers.length} users match this segment
              </Badge>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {previewUsers.map((user) => (
                  <div key={user.id} className="bg-slate-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-xs mb-1">{user.email}</p>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Campaigns: {user.campaignCount}</span>
                      <span>Earnings: ${user.totalEarnings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}