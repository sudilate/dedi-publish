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

// Mock data for namespaces - will be replaced with API data later
const mockNamespaces = [
  {
    id: 1,
    name: 'Personal Projects',
    description: 'Personal development projects and experiments',
    metadata: '{"type": "personal"}',
    createdAt: '2024-01-15',
    verified: false,
    dnsTxt: null,
  },
  {
    id: 2,
    name: 'Work Projects',
    description: 'Professional work-related projects',
    metadata: '{"type": "work"}',
    createdAt: '2024-01-20',
    verified: true,
    dnsTxt: 'xyz123',
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
  const [isDnsTxtModalOpen, setIsDnsTxtModalOpen] = useState(false);
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

  const handleGenerateDnsTxt = (namespace: typeof mockNamespaces[0]) => {
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
        ns.id === selectedNamespace.id ? { ...ns, dnsTxt: selectedNamespace.dnsTxt } : ns
      ));
    }
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

      <Button className="mb-8 px-8 py-6 text-lg" onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="mr-2 h-5 w-5" />
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
                  {!namespace.dnsTxt && (
                    <DropdownMenuItem onClick={() => handleGenerateDnsTxt(namespace)}>
                      Generate DNS txt
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created on {new Date(namespace.createdAt).toLocaleDateString()}
              </p>
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
                      handleVerify(namespace.id);
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
  );
}