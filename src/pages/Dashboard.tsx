import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Check, AlertCircle } from 'lucide-react';
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

// Mock data for namespaces - will be replaced with API data later
const mockNamespaces = [
  {
    id: 1,
    name: 'Personal Projects',
    description: 'Personal development projects and experiments',
    metadata: '{"type": "personal"}',
    createdAt: '2024-01-15',
    verified: false,
  },
  {
    id: 2,
    name: 'Work Projects',
    description: 'Professional work-related projects',
    metadata: '{"type": "work"}',
    createdAt: '2024-01-20',
    verified: true,
  },
];

interface NamespaceFormData {
  name: string;
  description: string;
  metadata: string;
}

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [namespaces, setNamespaces] = useState(mockNamespaces);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState<typeof mockNamespaces[0] | null>(null);
  const [formData, setFormData] = useState<NamespaceFormData>({
    name: '',
    description: '',
    metadata: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleCreateNamespace = async () => {
    try {
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'Namespace created successfully',
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', metadata: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create namespace',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateNamespace = async () => {
    try {
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'Namespace updated successfully',
      });
      setIsUpdateModalOpen(false);
      setSelectedNamespace(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update namespace',
        variant: 'destructive',
      });
    }
  };

  const handleVerify = (id: number) => {
    setNamespaces(namespaces.map(ns => 
      ns.id === id ? { ...ns, verified: true } : ns
    ));
  };

  const openUpdateModal = (namespace: typeof mockNamespaces[0]) => {
    setSelectedNamespace(namespace);
    setFormData({
      name: namespace.name,
      description: namespace.description,
      metadata: namespace.metadata,
    });
    setIsUpdateModalOpen(true);
  };

  const handleNamespaceClick = (namespaceId: number) => {
    navigate(`/namespaces/${namespaceId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Namespaces</h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your projects in dedicated namespaces
        </p>
      </div>

      <Button className="mb-8" onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Namespace
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {namespaces.map((namespace) => (
          <Card 
            key={namespace.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleNamespaceClick(namespace.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{namespace.name}</CardTitle>
                <CardDescription>{namespace.description}</CardDescription>
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
                  <DropdownMenuItem>
                    Generate DNS txt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created on {new Date(namespace.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className={namespace.verified ? 'text-green-500' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    !namespace.verified && handleVerify(namespace.id);
                  }}
                >
                  {namespace.verified ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Namespace Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Namespace</DialogTitle>
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
            <Button className="w-full" onClick={handleCreateNamespace}>
              Create
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
            <Button className="w-full" onClick={handleUpdateNamespace}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}