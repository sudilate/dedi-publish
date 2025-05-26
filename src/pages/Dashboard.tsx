import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, AlertCircle, MoreVertical, Copy } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

// Interface for namespace data from API
interface Namespace {
  digest: string;
  name: string;
  namespace_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  version_count: number;
  version: string;
  registry_count: number;
  ttl: number;
  meta: {
    [key: string]: any;
  };
  verified?: boolean;
  dnsTxt?: string | null;
}

interface NamespaceFormData {
  name: string;
  description: string;
  metadata: string;
}

export function DashboardPage() {
  const { user, isAuthenticated, getAuthTokens } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDnsTxtModalOpen, setIsDnsTxtModalOpen] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState<Namespace | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<NamespaceFormData>({
    name: '',
    description: '',
    metadata: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchNamespaces();
    }
  }, [isAuthenticated, navigate]);

  const fetchNamespaces = async () => {
    try {
      setLoading(true);
      const { creatorId, accessToken } = getAuthTokens();
      
      if (!creatorId) {
        toast({
          title: 'Error',
          description: 'Creator ID not found. Please login again.',
          variant: 'destructive',
        });
        return;
      }

      if (!accessToken) {
        toast({
          title: 'Error',
          description: 'Access token not found. Please login again.',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/${creatorId}/get-namepace-by-creator`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      
      if (result.message === "Resource retrieved successfully") {
        // Filter to get only the latest version of each namespace
        const namespacesMap = new Map<string, Namespace>();
        
        result.data.forEach((namespace: Namespace) => {
          const existingNamespace = namespacesMap.get(namespace.namespace_id);
          
          if (!existingNamespace) {
            // If this namespace_id doesn't exist in map, add it
            namespacesMap.set(namespace.namespace_id, namespace);
          } else {
            // If namespace_id already exists, compare updated_at timestamps
            const existingDate = new Date(existingNamespace.updated_at);
            const currentDate = new Date(namespace.updated_at);
            
            // Keep the one with the latest updated_at timestamp
            if (currentDate > existingDate) {
              namespacesMap.set(namespace.namespace_id, namespace);
            }
          }
        });
        
        // Convert map values back to array and add UI properties
        const latestNamespaces = Array.from(namespacesMap.values()).map((namespace: Namespace) => ({
          ...namespace,
          verified: false, // Default to false, can be updated based on business logic
          dnsTxt: null, // Default to null
        }));
        
        setNamespaces(latestNamespaces);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch namespaces',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch namespaces. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while user data is being set or while fetching namespaces
  if (!isAuthenticated || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateNamespace = async () => {
    try {
      setIsCreating(true);
      const { creatorId, accessToken } = getAuthTokens();
      
      if (!creatorId) {
        toast({
          title: 'Error',
          description: 'Creator ID not found. Please login again.',
          variant: 'destructive',
        });
        return;
      }

      if (!accessToken) {
        toast({
          title: 'Error',
          description: 'Access token not found. Please login again.',
          variant: 'destructive',
        });
        return;
      }

      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Name and description are required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare meta field
      let meta;
      try {
        if (formData.metadata.trim()) {
          meta = JSON.parse(formData.metadata);
        } else {
          meta = { additionalProp1: {} };
        }
      } catch (error) {
        toast({
          title: 'Validation Error',
          description: 'Invalid JSON format in metadata field.',
          variant: 'destructive',
        });
        return;
      }

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        meta: meta
      };

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/create-namespace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.message === "Namespace created successfully") {
        toast({
          title: '🎉 Success!',
          description: `Namespace "${formData.name}" has been created successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        // Store the namespace_id if needed for future API calls
        console.log('Created namespace ID:', result.data.namespace_id);
        
        // Close modal and reset form
        setIsCreateModalOpen(false);
        setFormData({ name: '', description: '', metadata: '' });
        
        // Refresh the namespaces list
        await fetchNamespaces();
      } else {
        // Handle API error response
        const errorMessage = result.message || result.error || 'Failed to create namespace';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating namespace:', error);
      toast({
        title: 'Error',
        description: 'Failed to create namespace. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateNamespace = async () => {
    try {
      setIsUpdating(true);
      const { accessToken } = getAuthTokens();
      
      if (!accessToken) {
        toast({
          title: 'Error',
          description: 'Access token not found. Please login again.',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedNamespace) {
        toast({
          title: 'Error',
          description: 'No namespace selected for update.',
          variant: 'destructive',
        });
        return;
      }

      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Name and description are required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare meta field
      let meta;
      try {
        if (formData.metadata.trim()) {
          meta = JSON.parse(formData.metadata);
        } else {
          meta = { additionalProp1: {} };
        }
      } catch (error) {
        toast({
          title: 'Validation Error',
          description: 'Invalid JSON format in metadata field.',
          variant: 'destructive',
        });
        return;
      }

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        meta: meta
      };

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/${selectedNamespace.namespace_id}/update-namespace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.message === "namespace updated") {
        toast({
          title: '🎉 Success!',
          description: `Namespace "${formData.name}" has been updated successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        // Close modal and reset form
        setIsUpdateModalOpen(false);
        setSelectedNamespace(null);
        setFormData({ name: '', description: '', metadata: '' });
        
        // Refresh the namespaces list
        await fetchNamespaces();
      } else {
        // Handle API error response
        const errorMessage = result.message || result.error || 'Failed to update namespace';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating namespace:', error);
      toast({
        title: 'Error',
        description: 'Failed to update namespace. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerify = (namespaceId: string) => {
    setNamespaces(namespaces.map(ns => 
      ns.namespace_id === namespaceId ? { ...ns, verified: true } : ns
    ));
  };

  const handleGenerateDnsTxt = (namespace: Namespace) => {
    setSelectedNamespace({
      ...namespace,
      dnsTxt: Math.random().toString(36).substring(7)
    });
    setIsDnsTxtModalOpen(true);
  };

  const handleCopyDnsTxt = () => {
    if (selectedNamespace?.dnsTxt) {
      navigator.clipboard.writeText(selectedNamespace.dnsTxt);
      toast({
        title: 'Success',
        description: 'DNS TXT record copied to clipboard',
      });
      setIsDnsTxtModalOpen(false);
      setNamespaces(namespaces.map(ns =>
        ns.namespace_id === selectedNamespace.namespace_id ? { ...ns, dnsTxt: selectedNamespace.dnsTxt } : ns
      ));
    }
  };

  const openUpdateModal = (namespace: Namespace) => {
    setSelectedNamespace(namespace);
    setFormData({
      name: namespace.name,
      description: namespace.description,
      metadata: JSON.stringify(namespace.meta, null, 2),
    });
    setIsUpdateModalOpen(true);
  };

  const handleNamespaceClick = (namespaceId: string) => {
    navigate(`/namespaces/${namespaceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Your Namespaces</h1>
          <p className="text-emerald-200 mt-2 text-lg">
            Manage and organize your projects in dedicated namespaces
          </p>
        </div>

        <Button 
          className="mb-8 px-8 py-6 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Namespace
        </Button>

        {namespaces.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-white">No namespaces found</h3>
            <p className="text-emerald-200">
              Get started by creating your first namespace
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {namespaces.map((namespace) => (
              <Card 
                key={namespace.namespace_id} 
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => handleNamespaceClick(namespace.namespace_id)}
              >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">{namespace.name}</CardTitle>
                  <CardDescription className="text-emerald-200">{namespace.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => openUpdateModal(namespace)}>
                      Update
                    </DropdownMenuItem>
                    {!namespace.dnsTxt && (
                      <DropdownMenuItem onClick={() => handleGenerateDnsTxt(namespace)}>
                        Generate DNS txt
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-emerald-300">
                    Created: {new Date(namespace.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-emerald-300">
                    Updated: {new Date(namespace.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  {namespace.verified ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerify(namespace.namespace_id);
                      }}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Namespace Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Namespace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter namespace name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter namespace description"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Metadata (Optional)</label>
              <Textarea
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                placeholder='Enter metadata in JSON format (e.g., {"key": "value"})'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default metadata structure
              </p>
            </div>
            <Button className="w-full" onClick={handleCreateNamespace} disabled={isCreating}>
              {isCreating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Namespace Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Namespace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter namespace name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter namespace description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Metadata</label>
              <Textarea
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                placeholder="Enter metadata in JSON format"
              />
            </div>
            <Button className="w-full" onClick={handleUpdateNamespace} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DNS TXT Modal */}
      <Dialog open={isDnsTxtModalOpen} onOpenChange={setIsDnsTxtModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>DNS TXT Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={selectedNamespace?.dnsTxt || ''}
                readOnly
                className="font-mono"
              />
              <Button onClick={handleCopyDnsTxt} size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}