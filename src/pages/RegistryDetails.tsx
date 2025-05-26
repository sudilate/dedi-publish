import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Activity, 
  Clock, 
  Calendar, 
  Users, 
  Database, 
  Settings, 
  Archive, 
  RotateCcw, 
  Ban, 
  CheckCircle,
  Plus,
  Upload,
  Eye,
  Edit,
  Trash2,
  GitBranch,
  Zap,
  Shield,
  Globe,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

// Activity types for the timeline
interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'archived' | 'restored' | 'revoked' | 'reinstated' | 'record_added' | 'record_updated' | 'record_deleted' | 'delegated' | 'bulk_upload';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  metadata?: {
    recordCount?: number;
    fileCount?: number;
    delegatedTo?: string;
    changes?: string[];
  };
}

// Registry interface
interface Registry {
  digest: string;
  registry_id: string;
  registry_name: string;
  description: string;
  created_by: string;
  schema: any;
  created_at: string;
  updated_at: string;
  record_count: number;
  version_count: number;
  version: string;
  query_allowed: boolean;
  is_revoked: boolean;
  is_archived: boolean;
  delegates: any[];
  meta: any;
}

// Generate dummy activity data
const generateDummyActivities = (registryName: string, daysBack: number): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  const now = new Date();
  
  const activityTypes = [
    { type: 'record_added' as const, title: 'Record Added', description: 'New record was added to the registry' },
    { type: 'record_updated' as const, title: 'Record Updated', description: 'Existing record was modified' },
    { type: 'record_deleted' as const, title: 'Record Deleted', description: 'Record was removed from registry' },
    { type: 'updated' as const, title: 'Registry Updated', description: 'Registry metadata was updated' },
    { type: 'delegated' as const, title: 'Access Delegated', description: 'Registry access was delegated to another user' },
    { type: 'bulk_upload' as const, title: 'Bulk Upload', description: 'Multiple records uploaded via bulk operation' },
  ];

  const users = ['john.doe@example.com', 'jane.smith@example.com', 'admin@company.com', 'developer@team.com'];

  for (let i = 0; i < Math.min(daysBack * 2, 50); i++) {
    const daysAgo = Math.floor(Math.random() * daysBack);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
    
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    let metadata = {};
    if (activityType.type === 'bulk_upload') {
      metadata = { fileCount: Math.floor(Math.random() * 10) + 1, recordCount: Math.floor(Math.random() * 50) + 5 };
    } else if (activityType.type === 'delegated') {
      metadata = { delegatedTo: users[Math.floor(Math.random() * users.length)] };
    } else if (activityType.type === 'updated') {
      metadata = { changes: ['description', 'metadata', 'schema'].slice(0, Math.floor(Math.random() * 3) + 1) };
    }

    activities.push({
      id: `activity-${i}`,
      type: activityType.type,
      title: activityType.title,
      description: `${activityType.description} in ${registryName}`,
      timestamp: timestamp.toISOString(),
      user,
      metadata
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'created': return <Plus className="h-4 w-4" />;
    case 'updated': return <Edit className="h-4 w-4" />;
    case 'archived': return <Archive className="h-4 w-4" />;
    case 'restored': return <RotateCcw className="h-4 w-4" />;
    case 'revoked': return <Ban className="h-4 w-4" />;
    case 'reinstated': return <CheckCircle className="h-4 w-4" />;
    case 'record_added': return <Plus className="h-4 w-4" />;
    case 'record_updated': return <Edit className="h-4 w-4" />;
    case 'record_deleted': return <Trash2 className="h-4 w-4" />;
    case 'delegated': return <Users className="h-4 w-4" />;
    case 'bulk_upload': return <Upload className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'created': return 'bg-green-500';
    case 'updated': return 'bg-blue-500';
    case 'archived': return 'bg-yellow-500';
    case 'restored': return 'bg-green-500';
    case 'revoked': return 'bg-red-500';
    case 'reinstated': return 'bg-blue-500';
    case 'record_added': return 'bg-emerald-500';
    case 'record_updated': return 'bg-cyan-500';
    case 'record_deleted': return 'bg-red-500';
    case 'delegated': return 'bg-purple-500';
    case 'bulk_upload': return 'bg-indigo-500';
    default: return 'bg-gray-500';
  }
};

export function RegistryDetailsPage() {
  const { namespaceId, registryName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAuthTokens } = useAuth();
  
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [namespaceName, setNamespaceName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'5days' | '1week' | '15days' | '1month'>('5days');

  useEffect(() => {
    if (namespaceId && registryName) {
      fetchRegistryDetails();
    }
  }, [namespaceId, registryName]);

  useEffect(() => {
    if (registryName) {
      const daysMap = {
        '5days': 5,
        '1week': 7,
        '15days': 15,
        '1month': 30
      };
      setActivities(generateDummyActivities(registryName, daysMap[selectedTimeframe]));
    }
  }, [registryName, selectedTimeframe]);

  const fetchRegistryDetails = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.message === "Resource retrieved successfully") {
        // Find the specific registry by name
        const foundRegistry = result.data.registries.find((reg: Registry) => reg.registry_name === registryName);
        if (foundRegistry) {
          setRegistry(foundRegistry);
          setNamespaceName(result.data.namespace_name);
        }
      }
    } catch (error) {
      console.error('Error fetching registry details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registry details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
              <p className="mt-4 text-purple-200">Loading registry details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2 text-white">Registry not found</h3>
            <p className="text-purple-200">The requested registry could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate('/dashboard')}
                className="text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-purple-300" />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate(`/namespaces/${namespaceId}`)}
                className="text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                {namespaceName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-purple-300" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">{registry.registry_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{registry.registry_name}</h1>
              <p className="text-purple-200 text-lg">{registry.description}</p>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex gap-2 mb-6">
            {registry.is_archived && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Archive className="mr-1 h-3 w-3" />
                Archived
              </Badge>
            )}
            {registry.is_revoked && (
              <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                <Ban className="mr-1 h-3 w-3" />
                Revoked
              </Badge>
            )}
            {!registry.is_archived && !registry.is_revoked && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate(`/${namespaceId}/${registryName}`)}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Records
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-400 text-purple-200 hover:bg-purple-500/20"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Total Records</CardTitle>
              <Database className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registry.record_count}</div>
              <p className="text-xs text-purple-300">Active records in registry</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Version</CardTitle>
              <GitBranch className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">v{registry.version}</div>
              <p className="text-xs text-purple-300">{registry.version_count} total versions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Query Access</CardTitle>
              <Globe className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registry.query_allowed ? 'Enabled' : 'Disabled'}</div>
              <p className="text-xs text-purple-300">Public query access</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Delegates</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registry.delegates?.length || 0}</div>
              <p className="text-xs text-purple-300">Delegated users</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Activity Timeline</CardTitle>
                  <CardDescription className="text-purple-200">
                    Recent activities and changes in this registry
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-purple-200">Live Updates</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
              <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10">
                <TabsTrigger value="5days" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  5 Days
                </TabsTrigger>
                <TabsTrigger value="1week" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  1 Week
                </TabsTrigger>
                <TabsTrigger value="15days" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  15 Days
                </TabsTrigger>
                <TabsTrigger value="1month" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  1 Month
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTimeframe} className="mt-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-200">No activities found for this timeframe</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{activity.title}</h4>
                            <span className="text-xs text-purple-300">{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                          <p className="text-purple-200 text-sm mb-2">{activity.description}</p>
                          <div className="flex items-center gap-4 text-xs text-purple-300">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {activity.user}
                            </span>
                            {activity.metadata?.recordCount && (
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {activity.metadata.recordCount} records
                              </span>
                            )}
                            {activity.metadata?.fileCount && (
                              <span className="flex items-center gap-1">
                                <Upload className="h-3 w-3" />
                                {activity.metadata.fileCount} files
                              </span>
                            )}
                            {activity.metadata?.delegatedTo && (
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                to {activity.metadata.delegatedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Registry Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Registry Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-purple-300">Created</label>
                <p className="text-white">{new Date(registry.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-purple-300">Last Updated</label>
                <p className="text-white">{new Date(registry.updated_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-purple-300">Created By</label>
                <p className="text-white">{registry.created_by}</p>
              </div>
              <div>
                <label className="text-sm text-purple-300">Registry ID</label>
                <p className="text-white font-mono text-sm">{registry.registry_id}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Schema & Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-purple-300">Schema Type</label>
                <p className="text-white">{registry.schema?.type || 'Object'}</p>
              </div>
              <div>
                <label className="text-sm text-purple-300">Digest</label>
                <p className="text-white font-mono text-sm break-all">{registry.digest}</p>
              </div>
              {registry.meta && Object.keys(registry.meta).length > 0 && (
                <div>
                  <label className="text-sm text-purple-300">Metadata</label>
                  <pre className="text-white text-xs bg-black/20 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(registry.meta, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 