import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ban, MoreVertical, CheckCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

export function RevokedRegistriesPage() {
  const { namespaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [allRegistries, setAllRegistries] = useState<Registry[]>([]);
  const [namespaceName, setNamespaceName] = useState<string>('Loading...');
  const [totalRegistries, setTotalRegistries] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [isReinstateAlertOpen, setIsReinstateAlertOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

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
    console.log("✅ Filtered revoked registries:", filteredRegistries.length, "registries found");
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

  const fetchRevokedRegistries = useCallback(async () => {
    try {
      console.log('🔄 Fetching revoked registries...');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}?status=revoked`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: NamespaceQueryResponse = await response.json();
      console.log('📊 Revoked registries API response:', result);
      
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
        setAllRegistries(uniqueRegistries); // Store all registries for search filtering
        setNamespaceName(result.data.namespace_name);
        setTotalRegistries(result.data.total_registries);
        console.log('✅ Revoked registries updated:', uniqueRegistries.length, 'registries');
      } else {
        console.log('ℹ️ No revoked registries found:', result.message);
        setRegistries([]);
        setTotalRegistries(0);
      }
    } catch (error) {
      console.error('❌ Error fetching revoked registries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch revoked registries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [namespaceId, toast]);

  useEffect(() => {
    if (namespaceId) {
      fetchRevokedRegistries();
    }
  }, [namespaceId, fetchRevokedRegistries]);

  const handleRegistryClick = (registry: Registry) => {
    navigate(`/${namespaceId}/${registry.registry_name}`);
  };

  const handleOpenReinstateAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsReinstateAlertOpen(true);
  };

  const handleReinstateRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      // Cookie authentication is handled automatically by credentials: 'include'

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/reinstate-registry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.message === "Registry has been reinstated") {
        toast({
          title: '🎉 Success!',
          description: `Registry "${selectedRegistry.registry_name}" reinstated successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        // Refresh the registries list to show updated status
        await fetchRevokedRegistries();
      } else {
        toast({
          title: 'Reinstate Error',
          description: result.message || 'Failed to reinstate registry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error reinstating registry:', error);
      toast({
        title: 'Reinstate Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReinstateAlertOpen(false);
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
            <p className="mt-4 text-muted-foreground">Loading revoked registries...</p>
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
            <BreadcrumbPage>Revoked Registries</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Revoked Registries</h1>
        <p className="text-muted-foreground mt-2">
          View and manage revoked registries in this namespace ({totalRegistries} revoked registries)
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search revoked registries..."
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
          <Ban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No revoked registries found</h3>
          <p className="text-muted-foreground">
            All registries in this namespace are currently active
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
                    <DropdownMenuItem onClick={() => handleOpenReinstateAlert(registry)} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reinstate
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Ban className="mr-1 h-3 w-3" />
                    Revoked
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={isReinstateAlertOpen} onOpenChange={setIsReinstateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reinstate this registry?</AlertDialogTitle>
            {selectedRegistry && (
              <AlertDialogDescription>
                This action will reinstate the registry "{selectedRegistry.registry_name}", making it active again.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)} disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReinstateRegistry} className="bg-blue-600 hover:bg-blue-700" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reinstating...
                </>
              ) : (
                'Reinstate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 