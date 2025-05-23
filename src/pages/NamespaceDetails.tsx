import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Updated interface to match API response
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

interface RegistryFormData {
  name: string;
  description: string;
  schema: string;
  metadata: string;
}

interface DelegateFormData {
  email: string;
  permission: string;
}

// Interface for API response
interface NamespaceQueryResponse {
  message: string;
  data: {
    namespace_id: string;
    namespace_name: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    total_registries: number;
    registries: Registry[];
    ttl: number;
  };
}

export function NamespaceDetailsPage() {
  const { namespaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAuthTokens } = useAuth();
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [namespaceName, setNamespaceName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [createFormData, setCreateFormData] = useState<RegistryFormData>({
    name: '',
    description: '',
    schema: '',
    metadata: '',
  });
  const [updateFormData, setUpdateFormData] = useState<RegistryFormData>({
    name: '',
    description: '',
    schema: '',
    metadata: '',
  });
  const [delegateFormData, setDelegateFormData] = useState<DelegateFormData>({
    email: '',
    permission: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (namespaceId) {
      fetchRegistries();
    }
  }, [namespaceId]);

  const fetchRegistries = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: NamespaceQueryResponse = await response.json();
      
      if (result.message === "Resource retrieved successfully") {
        // Group registries by registry_id and keep only the latest version of each
        const registryMap = new Map<string, Registry>();
        
        result.data.registries.forEach(registry => {
          const existingRegistry = registryMap.get(registry.registry_id);
          
          if (!existingRegistry) {
            // First time seeing this registry_id, add it
            registryMap.set(registry.registry_id, registry);
          } else {
            // Registry already exists, keep the one with latest updated_at
            const existingDate = new Date(existingRegistry.updated_at).getTime();
            const currentDate = new Date(registry.updated_at).getTime();
            
            if (currentDate > existingDate) {
              registryMap.set(registry.registry_id, registry);
            }
          }
        });
        
        // Convert map back to array and sort by updated_at in descending order
        const uniqueRegistries = Array.from(registryMap.values()).sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        
        setRegistries(uniqueRegistries);
        setNamespaceName(result.data.namespace_name);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch registries',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching registries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch registries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegistry = async () => {
    try {
      // Validate required fields
      if (!createFormData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Registry name is required',
          variant: 'destructive',
        });
        return;
      }

      if (!createFormData.description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Description is required',
          variant: 'destructive',
        });
        return;
      }

      if (!createFormData.schema.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Schema is required',
          variant: 'destructive',
        });
        return;
      }

      // Parse schema
      let parsedSchema;
      try {
        parsedSchema = JSON.parse(createFormData.schema);
      } catch (error) {
        toast({
          title: 'Validation Error',
          description: 'Schema must be valid JSON',
          variant: 'destructive',
        });
        return;
      }

      // Parse metadata (optional)
      let parsedMeta = {};
      if (createFormData.metadata.trim()) {
        try {
          parsedMeta = JSON.parse(createFormData.metadata);
        } catch (error) {
          toast({
            title: 'Validation Error',
            description: 'Metadata must be valid JSON',
            variant: 'destructive',
          });
          return;
        }
      }

      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to create a registry',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/create-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          registry_name: createFormData.name.trim(),
          description: createFormData.description.trim(),
          schema: parsedSchema,
          query_allowed: true,
          ...(createFormData.metadata.trim() && { meta: parsedMeta })
        }),
      });

      const result = await response.json();

      if (result.message === "Registry created") {
        toast({
          title: 'Success',
          description: 'Registry created successfully',
        });
        setIsCreateModalOpen(false);
        setCreateFormData({ name: '', description: '', schema: '', metadata: '' });
        // Refresh the registries list
        await fetchRegistries();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create registry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating registry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create registry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenUpdateModal = (registry: Registry) => {
    setSelectedRegistry(registry);
    
    // Handle metadata properly - only show if it exists and has content
    let metadataString = '';
    if (registry.meta && typeof registry.meta === 'object' && Object.keys(registry.meta).length > 0) {
      // Check if meta has actual content (not just empty object)
      const hasContent = Object.values(registry.meta).some(value => 
        value !== null && value !== undefined && value !== '' && 
        (typeof value !== 'object' || Object.keys(value).length > 0)
      );
      if (hasContent) {
        metadataString = JSON.stringify(registry.meta, null, 2);
      }
    }
    
    setUpdateFormData({
      name: registry.registry_name,
      description: registry.description,
      schema: '', // Remove schema from update form
      metadata: metadataString,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateRegistry = async () => {
    if (!selectedRegistry) return;
    
    try {
      // Validate required fields
      if (!updateFormData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Registry name is required',
          variant: 'destructive',
        });
        return;
      }

      if (!updateFormData.description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Description is required',
          variant: 'destructive',
        });
        return;
      }

      // Parse metadata (optional)
      let parsedMeta = {};
      if (updateFormData.metadata.trim()) {
        try {
          parsedMeta = JSON.parse(updateFormData.metadata);
        } catch (error) {
          toast({
            title: 'Validation Error',
            description: 'Metadata must be valid JSON',
            variant: 'destructive',
          });
          return;
        }
      }

      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to update the registry',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/update-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          new_registry_name: updateFormData.name.trim(),
          description: updateFormData.description.trim(),
          ...(updateFormData.metadata.trim() && { meta: parsedMeta })
        }),
      });

      const result = await response.json();

      if (result.message === "Registry updated") {
        toast({
          title: 'Success',
          description: 'Registry updated successfully',
        });
        setIsUpdateModalOpen(false);
        setSelectedRegistry(null);
        // Refresh the registries list
        await fetchRegistries();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update registry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating registry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update registry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDelegateModal = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsDelegateModalOpen(true);
  };

  const handleDelegateRegistry = async () => {
    if (!selectedRegistry) return;
    try {
      console.log('Delegating registry:', selectedRegistry.registry_id, delegateFormData);
      toast({
        title: 'Success',
        description: 'Registry delegation initiated successfully',
      });
      setIsDelegateModalOpen(false);
      setSelectedRegistry(null);
      setDelegateFormData({ email: '', permission: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delegate registry',
        variant: 'destructive',
      });
    }
  };

  const handleOpenArchiveAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsArchiveAlertOpen(true);
  };

  const handleArchiveRegistry = async () => {
    if (!selectedRegistry) return;
    try {
      console.log('Archiving registry:', selectedRegistry.registry_id);
      toast({
        title: 'Success',
        description: 'Registry archived successfully',
      });
      setIsArchiveAlertOpen(false);
      setSelectedRegistry(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive registry',
        variant: 'destructive',
      });
    }
  };

  const handleBulkUpload = async () => {
    try {
      if (!selectedFiles?.length) {
        toast({
          title: 'Error',
          description: 'Please select files to upload',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Files uploaded successfully',
      });
      setIsBulkUploadModalOpen(false);
      setSelectedFiles(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    }
  };

  const handleRegistryClick = (registryId: string) => {
    navigate(`/registries/${registryId}/records`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading registries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{namespaceName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Registries</h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your registries in this namespace
        </p>
      </div>

      <div className="flex justify-start gap-4 mb-8">
        <Button onClick={() => setIsCreateModalOpen(true)} className="px-8 py-6 text-lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Registry
        </Button>
        <Button variant="outline" onClick={() => setIsBulkUploadModalOpen(true)} className="px-8 py-6 text-lg">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </div>

      {registries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg font-medium mb-2">No registries found</div>
          <p className="text-muted-foreground">
            Get started by creating your first registry
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registries.map((registry) => (
            <Card 
              key={registry.registry_id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleRegistryClick(registry.registry_id)}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{registry.registry_name}</CardTitle>
                  <CardDescription>{registry.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="ml-auto">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleOpenUpdateModal(registry)}>
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenDelegateModal(registry)}>
                      Delegate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenArchiveAlert(registry)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(registry.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Updated: {new Date(registry.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Registry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="Enter registry name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description *</Label>
              <Textarea
                id="create-description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Enter registry description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-schema">Schema *</Label>
              <Textarea
                id="create-schema"
                value={createFormData.schema}
                onChange={(e) => setCreateFormData({ ...createFormData, schema: e.target.value })}
                placeholder='Enter schema in JSON format, e.g., {"type": "object", "properties": {"name": {"type": "string"}}}'
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-metadata">Metadata (optional)</Label>
              <Textarea
                id="create-metadata"
                value={createFormData.metadata}
                onChange={(e) => setCreateFormData({ ...createFormData, metadata: e.target.value })}
                placeholder='Enter metadata in JSON format, e.g., {"category": "component", "version": "1.0"}'
                rows={3}
              />
            </div>
            <Button className="w-full" onClick={handleCreateRegistry}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Registry</DialogTitle>
            {selectedRegistry && <DialogDescription>Updating {selectedRegistry.registry_name}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-name">Name *</Label>
              <Input
                id="update-name"
                value={updateFormData.name}
                onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                placeholder="Enter registry name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-description">Description *</Label>
              <Textarea
                id="update-description"
                value={updateFormData.description}
                onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                placeholder="Enter registry description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-metadata">Metadata (optional)</Label>
              <Textarea
                id="update-metadata"
                value={updateFormData.metadata}
                onChange={(e) => setUpdateFormData({ ...updateFormData, metadata: e.target.value })}
                placeholder='Enter metadata in JSON format, e.g., {"category": "component", "version": "1.0"}'
                rows={3}
              />
            </div>
            <Button className="w-full" onClick={handleUpdateRegistry}>
              Update Registry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDelegateModalOpen} onOpenChange={setIsDelegateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delegate Registry Access</DialogTitle>
            {selectedRegistry && <DialogDescription>For registry: {selectedRegistry.registry_name}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delegate-email">Email</Label>
              <Input
                id="delegate-email"
                type="email"
                value={delegateFormData.email}
                onChange={(e) => setDelegateFormData({ ...delegateFormData, email: e.target.value })}
                placeholder="Enter user's email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delegate-permission">Permission</Label>
              <Input
                id="delegate-permission"
                value={delegateFormData.permission}
                onChange={(e) => setDelegateFormData({ ...delegateFormData, permission: e.target.value })}
                placeholder="e.g., read, write, admin"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDelegateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleDelegateRegistry}>Delegate</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this registry?</AlertDialogTitle>
            {selectedRegistry && (
              <AlertDialogDescription>
                This action will archive the registry "{selectedRegistry.registry_name}". You may be able to unarchive it later, but it will be hidden from normal view. 
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveRegistry} className="bg-red-600 hover:bg-red-700">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-upload-files">Select Files</Label>
              <Input
                id="bulk-upload-files"
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="cursor-pointer"
              />
            </div>
            <Button className="w-full" onClick={handleBulkUpload}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}