import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

// Mock data for registries - will be replaced with API data later
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

interface RegistryFormData {
  name: string;
  description: string;
  schema: string;
  metadata: string;
}

export function NamespaceDetailsPage() {
  const { namespaceId } = useParams();
  const { toast } = useToast();
  const [registries, setRegistries] = useState(mockRegistries);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState<RegistryFormData>({
    name: '',
    description: '',
    schema: '',
    metadata: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    // Fetch registries for the namespace - will be implemented later
    console.log('Fetching registries for namespace:', namespaceId);
  }, [namespaceId]);

  const handleCreateRegistry = async () => {
    try {
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'Registry created successfully',
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', schema: '', metadata: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create registry',
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

      // API call will be added here later
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Your Registries</h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your registries in this namespace
        </p>
      </div>

      <div className="flex justify-start gap-4 mb-8">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Registry
        </Button>
        <Button variant="outline" onClick={() => setIsBulkUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registries.map((registry) => (
          <Card key={registry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{registry.name}</CardTitle>
              <CardDescription>{registry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created on {new Date(registry.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Registry Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Registry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter registry name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter registry description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schema</label>
              <Textarea
                value={formData.schema}
                onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
                placeholder="Enter schema in JSON format"
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
            <Button className="w-full" onClick={handleCreateRegistry}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Files</label>
              <Input
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