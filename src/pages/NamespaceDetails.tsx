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

const mockRegistries = [
  {
    id: 1,
    name: 'Frontend Components',
    description: 'Reusable React components library',
    schema: '{"type": "component"}',
    metadata: '{"framework": "react"}',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'API Services',
    description: 'Backend API services and endpoints',
    schema: '{"type": "service"}',
    metadata: '{"language": "typescript"}',
    createdAt: '2024-01-20',
  },
];

interface Registry {
  id: number;
  name: string;
  description: string;
  schema: string;
  metadata: string;
  createdAt: string;
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

export function NamespaceDetailsPage() {
  const { namespaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registries, setRegistries] = useState<Registry[]>(mockRegistries);
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
    console.log('Fetching registries for namespace:', namespaceId);
  }, [namespaceId]);

  const handleCreateRegistry = async () => {
    try {
      console.log('Creating registry:', createFormData);
      toast({
        title: 'Success',
        description: 'Registry created successfully',
      });
      setIsCreateModalOpen(false);
      setCreateFormData({ name: '', description: '', schema: '', metadata: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create registry',
        variant: 'destructive',
      });
    }
  };

  const handleOpenUpdateModal = (registry: Registry) => {
    setSelectedRegistry(registry);
    setUpdateFormData({
      name: registry.name,
      description: registry.description,
      schema: registry.schema,
      metadata: registry.metadata,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateRegistry = async () => {
    if (!selectedRegistry) return;
    try {
      console.log('Updating registry:', selectedRegistry.id, updateFormData);
      toast({
        title: 'Success',
        description: 'Registry updated successfully',
      });
      setIsUpdateModalOpen(false);
      setSelectedRegistry(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update registry',
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
      console.log('Delegating registry:', selectedRegistry.id, delegateFormData);
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
      console.log('Archiving registry:', selectedRegistry.id);
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

  const handleRegistryClick = (registryId: number) => {
    navigate(`/registries/${registryId}/records`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registries.map((registry) => (
          <Card 
            key={registry.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleRegistryClick(registry.id)}
          >
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{registry.name}</CardTitle>
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
              <p className="text-sm text-muted-foreground">
                Created on {new Date(registry.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Registry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="Enter registry name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Enter registry description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-schema">Schema</Label>
              <Textarea
                id="create-schema"
                value={createFormData.schema}
                onChange={(e) => setCreateFormData({ ...createFormData, schema: e.target.value })}
                placeholder="Enter schema in JSON format"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-metadata">Metadata</Label>
              <Textarea
                id="create-metadata"
                value={createFormData.metadata}
                onChange={(e) => setCreateFormData({ ...createFormData, metadata: e.target.value })}
                placeholder="Enter metadata in JSON format"
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
            {selectedRegistry && <DialogDescription>Updating {selectedRegistry.name}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-name">Name</Label>
              <Input
                id="update-name"
                value={updateFormData.name}
                onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                placeholder="Enter registry name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-description">Description</Label>
              <Textarea
                id="update-description"
                value={updateFormData.description}
                onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                placeholder="Enter registry description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-schema">Schema</Label>
              <Textarea
                id="update-schema"
                value={updateFormData.schema}
                onChange={(e) => setUpdateFormData({ ...updateFormData, schema: e.target.value })}
                placeholder="Enter schema in JSON format"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-metadata">Metadata</Label>
              <Textarea
                id="update-metadata"
                value={updateFormData.metadata}
                onChange={(e) => setUpdateFormData({ ...updateFormData, metadata: e.target.value })}
                placeholder="Enter metadata in JSON format"
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
            {selectedRegistry && <DialogDescription>For registry: {selectedRegistry.name}</DialogDescription>}
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
                This action will archive the registry "{selectedRegistry.name}". You may be able to unarchive it later, but it will be hidden from normal view. 
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