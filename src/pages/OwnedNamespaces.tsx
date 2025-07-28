import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getNamespacesByProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TruncatedText } from "@/components/ui/truncated-text";

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
    [key: string]: unknown;
  };
  is_verified: boolean;
  verified?: boolean;
  dnsTxt?: string | null;
}

export function OwnedNamespacesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ownedNamespaces, setOwnedNamespaces] = useState<Namespace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNamespaces = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🔄 Fetching owned namespaces from API...");
      const result = await getNamespacesByProfile();
      console.log("📊 API response:", result);

      if (result.message === "User namespaces retrieved successfully") {
        // Process owned namespaces
        const ownedNamespacesWithProps = (result.data.owned_namespaces || []).map(
          (namespace: Namespace) => ({
            ...namespace,
            verified: false,
            dnsTxt: null,
          })
        );

        console.log("✅ Setting owned namespaces in state:", ownedNamespacesWithProps);
        setOwnedNamespaces(ownedNamespacesWithProps);
      } else {
        if (result.message !== "No namespaces found") {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch namespaces",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching namespaces:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch namespaces. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    } else if (!isLoading && isAuthenticated) {
      fetchNamespaces();
    }
  }, [fetchNamespaces, isAuthenticated, isLoading, navigate]);

  if (isLoading || loading) {
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

  const handleNamespaceClick = (namespaceId: string) => {
    navigate(`/namespaces/${namespaceId}`);
  };

  const handleVerifyNamespace = async (namespace: Namespace) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || "https://dev.dedi.global";
      const response = await fetch(`${API_BASE_URL}/dedi/verify-domain`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namespace_id: namespace.namespace_id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOwnedNamespaces(prev =>
          prev.map((ns) =>
            ns.namespace_id === namespace.namespace_id
              ? { ...ns, verified: true }
              : ns
          )
        );

        toast({
          title: "✅ Verification Successful!",
          description: result.message || "Domain has been successfully verified.",
          className: "border-green-200 bg-green-50 text-green-900",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Failed to verify domain.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying namespace:", error);
      toast({
        title: "Error",
        description: "Failed to verify domain. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Namespaces</h1>
            <p className="text-muted-foreground mt-2">
              All your owned namespaces ({ownedNamespaces.length} total)
            </p>
          </div>
        </div>
      </div>

      {ownedNamespaces.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No owned namespaces found</h3>
          <p className="text-muted-foreground">
            You don't have any owned namespaces yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownedNamespaces.map((namespace) => (
            <Card
              key={namespace.namespace_id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNamespaceClick(namespace.namespace_id)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{namespace.name}</CardTitle>
                  <CardDescription>
                    <TruncatedText text={namespace.description} maxLength={100} />
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem>
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Generate DNS TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(namespace.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Updated: {new Date(namespace.updated_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registries: {namespace.registry_count || 0}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  {namespace.is_verified ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This namespace is verified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleVerifyNamespace(namespace);
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
    </div>
  );
}