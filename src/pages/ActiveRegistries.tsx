import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, 
  MoreVertical, 
  Archive, 
  RotateCcw, 
  Ban, 
  AlertCircle,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { useToast } from '@/hooks/use-toast';
import { TruncatedText } from '@/components/ui/truncated-text';

// Updated interface to match API response
interface Registry {
  digest: string;
  registry_id: string;
  registry_name: string;
  description: string;
  created_by: string;
  schema: unknown;
  created_at: string;
  updated_at: string;
  record_count: number;
  version_count: number;
  version: string;
  query_allowed: boolean;
  is_revoked: boolean;
  is_archived: boolean;
  delegates: unknown[];
  meta: unknown;
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

export function ActiveRegistriesPage() {
  const { namespaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [allRegistries, setAllRegistries] = useState<Registry[]>([]);
  const [namespaceName, setNamespaceName] = useState<string>('Loading...');
  const [totalRegistries, setTotalRegistries] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
  const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
  const [isRevokeAlertOpen, setIsRevokeAlertOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState<string>("");


  // Search function for filtering registries
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Reset to show all registries
      setRegistries(allRegistries);
      return;
    }

    // Filter registries based on search query
    const filteredRegistries = allRegistries.filter(registry => 
      registry.registry_name.toLowerCase().includes(query.toLowerCase()) ||
      registry.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setRegistries(filteredRegistries);
    console.log("✅ Filtered active registries:", filteredRegistries.length, "registries found");
  }, [allRegistries]);

  // Handle search input change with debouncing
  const handleSearchInputChange = (value: string) => {
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300); // 300ms debounce

    // Cleanup function to clear timeout
    return () => clearTimeout(timeoutId);
  };

  // Clear search results
  const clearSearch = () => {
    setSearchQuery("");
    setRegistries(allRegistries);
  };

  const fetchActiveRegistries = useCallback(async () => {
    try {
      console.log('🔄 Fetching active registries...');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: NamespaceQueryResponse = await response.json();
      console.log('📊 Active registries API response:', result);
      
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
        
        // Convert map back to array and filter for active registries only
        const uniqueRegistries = Array.from(registryMap.values())
          .filter(registry => !registry.is_revoked)
          .sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        
        setRegistries(uniqueRegistries);
        setAllRegistries(uniqueRegistries); // Store all registries for search filtering
        setNamespaceName(result.data.namespace_name);
        setTotalRegistries(uniqueRegistries.length);
        console.log('✅ Active registries updated:', uniqueRegistries.length, 'registries');
      } else {
        console.log('ℹ️ No active registries found:', result.message);
        setRegistries([]);
        setTotalRegistries(0);
      }
    } catch (error) {
      console.error('❌ Error fetching active registries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch active registries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [namespaceId, toast]);

  useEffect(() => {
    if (namespaceId) {
      fetchActiveRegistries();
    }
  }, [namespaceId, fetchActiveRegistries]);

  const handleRegistryClick = (registry: Registry) => {
    navigate(`/${namespaceId}/${registry.registry_name}`);
  };

  const handleOpenArchiveAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsArchiveAlertOpen(true);
  };

  const handleOpenRestoreAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsRestoreAlertOpen(true);
  };

  const handleOpenRevokeAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsRevokeAlertOpen(true);
  };

  const handleArchiveRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/archive-registry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.message === "Registry has been archived") {
        toast({
          title: '📦 Success!',
          description: `Registry "${selectedRegistry.registry_name}" archived successfully.`,
          className: 'border-orange-200 bg-orange-50 text-orange-900',
        });
        
        await fetchActiveRegistries();
      } else {
        toast({
          title: 'Archive Error',
          description: result.message || 'Failed to archive registry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error archiving registry:', error);
      toast({
        title: 'Archive Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsArchiveAlertOpen(false);
      setSelectedRegistry(null);
      setActionLoading(false);
    }
  };

  const handleRestoreRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/restore-registry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.message === "Registry has been restored") {
        toast({
          title: '🔄 Success!',
          description: `Registry "${selectedRegistry.registry_name}" restored successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        await fetchActiveRegistries();
      } else {
        toast({
          title: 'Restore Error',
          description: result.message || 'Failed to restore registry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error restoring registry:', error);
      toast({
        title: 'Restore Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoreAlertOpen(false);
      setSelectedRegistry(null);
      setActionLoading(false);
    }
  };

  const handleRevokeRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/revoke-registry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.message === "Registry has been revoked") {
        toast({
          title: '🚫 Success!',
          description: `Registry "${selectedRegistry.registry_name}" revoked successfully.`,
          className: 'border-red-200 bg-red-50 text-red-900',
        });
        
        await fetchActiveRegistries();
      } else {
        toast({
          title: 'Revoke Error',
          description: result.message || 'Failed to revoke registry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error revoking registry:', error);
      toast({
        title: 'Revoke Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRevokeAlertOpen(false);
      setSelectedRegistry(null);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading active registries...</p>
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
            <BreadcrumbLink href={`/namespaces/${namespaceId}`}>{namespaceName}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Active Registries</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Active Registries</h1>
        <p className="text-muted-foreground mt-2">
          View and manage active registries in this namespace ({totalRegistries} active registries)
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search active registries..."
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {registries.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No active registries found</h3>
          <p className="text-muted-foreground">
            No active registries found. Get started by creating your first registry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registries.map((registry) => (
            <Card 
              key={registry.registry_id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleRegistryClick(registry)}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{registry.registry_name}</CardTitle>
                  <CardDescription>
                    <TruncatedText text={registry.description} maxLength={100} />
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="ml-auto">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem>
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Add Delegate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {registry.is_archived ? (
                      <DropdownMenuItem onClick={() => handleOpenRestoreAlert(registry)} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleOpenArchiveAlert(registry)} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50">
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleOpenRevokeAlert(registry)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Ban className="mr-2 h-4 w-4" />
                      Revoke
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
                  <p className="text-sm text-muted-foreground">
                    Records: {registry.record_count || 0}
                  </p>
                </div>
                <div className="mt-2">
                  {registry.is_archived ? (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      <Archive className="mr-1 h-3 w-3" />
                      Archived
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Archive Alert Dialog */}
      <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this registry?</AlertDialogTitle>
            {selectedRegistry && (
              <AlertDialogDescription>
                This action will archive the registry "{selectedRegistry.registry_name}". Archived registries can be restored later.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)} disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveRegistry} className="bg-orange-600 hover:bg-orange-700" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Archiving...
                </>
              ) : (
                'Archive'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Alert Dialog */}
      <AlertDialog open={isRestoreAlertOpen} onOpenChange={setIsRestoreAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to restore this registry?</AlertDialogTitle>
            {selectedRegistry && (
              <AlertDialogDescription>
                This action will restore the registry "{selectedRegistry.registry_name}", making it active again.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)} disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreRegistry} className="bg-blue-600 hover:bg-blue-700" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Restoring...
                </>
              ) : (
                'Restore'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Alert Dialog */}
      <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to revoke this registry?</AlertDialogTitle>
            {selectedRegistry && (
              <AlertDialogDescription>
                This action will revoke the registry "{selectedRegistry.registry_name}". This action is permanent and cannot be undone.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)} disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeRegistry} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Revoking...
                </>
              ) : (
                'Revoke'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}