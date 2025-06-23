import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, MoreVertical, Archive, RotateCcw, Ban, CheckCircle, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  meta: { [key: string]: any };
}

interface SchemaField {
  key: string;
  type: string;
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
  const [totalRegistries, setTotalRegistries] = useState<number>(0);
  const [revokedRegistriesCount, setRevokedRegistriesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [globalUploadStatus, setGlobalUploadStatus] = useState<{
    isUploading: boolean;
    message: string;
    namespaceId: string;
  } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
  const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
  const [isRevokeAlertOpen, setIsRevokeAlertOpen] = useState(false);
  const [isReinstateAlertOpen, setIsReinstateAlertOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [createFormData, setCreateFormData] = useState<RegistryFormData>({
    name: '',
    description: '',
    schema: '',
    metadata: '',
    meta: {},
  });
  const [updateFormData, setUpdateFormData] = useState<RegistryFormData>({
    name: '',
    description: '',
    schema: '',
    metadata: '',
    meta: {},
  });
  const [delegateFormData, setDelegateFormData] = useState<DelegateFormData>({
    email: '',
    permission: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([{ key: '', type: 'string' }]);
  const [showCreateMetadata, setShowCreateMetadata] = useState(false);
  const [showUpdateMetadata, setShowUpdateMetadata] = useState(false);
  const [selectedSchemaType, setSelectedSchemaType] = useState<string>('blank');
  const [showSchemaBuilder, setShowSchemaBuilder] = useState(false);

  // Check for ongoing upload on component mount
  useEffect(() => {
    const savedUploadStatus = localStorage.getItem('bulkUploadStatus');
    if (savedUploadStatus) {
      try {
        const uploadStatus = JSON.parse(savedUploadStatus);
        if (uploadStatus.isUploading) {
          setGlobalUploadStatus(uploadStatus);
        }
      } catch (error) {
        localStorage.removeItem('bulkUploadStatus');
      }
    }
  }, []);

  // Save upload status to localStorage whenever it changes
  useEffect(() => {
    if (globalUploadStatus) {
      localStorage.setItem('bulkUploadStatus', JSON.stringify(globalUploadStatus));
    } else {
      localStorage.removeItem('bulkUploadStatus');
    }
  }, [globalUploadStatus]);

  useEffect(() => {
    if (namespaceId) {
      fetchRegistries();
      fetchRevokedRegistriesCount();
    }
  }, [namespaceId]);

  const fetchRegistries = async () => {
    try {
      console.log('🔄 Fetching registries...');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: NamespaceQueryResponse = await response.json();
      console.log('📊 Registries API response:', result);
      
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
        setTotalRegistries(result.data.total_registries);
        console.log('✅ Registries updated:', uniqueRegistries.length, 'registries');
      } else {
        console.error('❌ Failed to fetch registries:', result.message);
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch registries',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching registries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch registries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Separate function for refreshing registries without affecting main loading state
  const refreshRegistries = async () => {
    try {
      console.log('🔄 Refreshing registries (silent)...');
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: NamespaceQueryResponse = await response.json();
      console.log('📊 Silent refresh API response:', result);
      
      if (result.message === "Resource retrieved successfully") {
        // Group registries by registry_id and keep only the latest version of each
        const registryMap = new Map<string, Registry>();
        
        result.data.registries.forEach(registry => {
          const existingRegistry = registryMap.get(registry.registry_id);
          
          if (!existingRegistry) {
            registryMap.set(registry.registry_id, registry);
          } else {
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
        setTotalRegistries(result.data.total_registries);
        console.log('✅ Registries silently refreshed:', uniqueRegistries.length, 'registries');
        
        // Also refresh revoked registries count
        await fetchRevokedRegistriesCount();
        
        return true;
      } else {
        console.error('❌ Failed to refresh registries:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error refreshing registries:', error);
      return false;
    }
  };

  const fetchRevokedRegistriesCount = async () => {
    try {
      console.log('🔄 Fetching revoked registries count...');
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}?status=revoked`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: NamespaceQueryResponse = await response.json();
      console.log('📊 Revoked registries API response:', result);
      
      if (result.message === "Resource retrieved successfully") {
        setRevokedRegistriesCount(result.data.total_registries);
        console.log('✅ Revoked registries count updated:', result.data.total_registries);
      } else {
        console.log('ℹ️ No revoked registries found or API error:', result.message);
        setRevokedRegistriesCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching revoked registries count:', error);
      setRevokedRegistriesCount(0);
    }
  };

  const handleCreateRegistry = async () => {
    if (createLoading) return; // Prevent multiple submissions
    
    try {
      setCreateLoading(true);
      
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

      // Handle schema based on selected type
      let parsedSchema: { [key: string]: string } = {};
      
      if (selectedSchemaType === 'blank') {
        // Validate schema fields for blank schema
        const validSchemaFields = schemaFields.filter(field => field.key.trim() !== '');
        if (validSchemaFields.length === 0) {
          toast({
            title: 'Validation Error',
            description: 'At least one schema field is required',
            variant: 'destructive',
          });
          return;
        }

        // Check for duplicate keys
        const keys = validSchemaFields.map(field => field.key.trim());
        const uniqueKeys = new Set(keys);
        if (keys.length !== uniqueKeys.size) {
          toast({
            title: 'Validation Error',
            description: 'Schema field keys must be unique',
            variant: 'destructive',
          });
          return;
        }

        // Convert schema fields to an object with string keys and string values.
        parsedSchema = validSchemaFields.reduce((acc, field) => {
          acc[field.key.trim()] = String(field.type);
          return acc;
        }, {} as { [key: string]: string });
      } else if (selectedSchemaType === 'membership') {
        // Predefined membership schema
        parsedSchema = {
          'member_id': 'string',
          'member_name': 'string',
          'membership_type': 'string',
          'join_date': 'string',
          'status': 'string'
        };
      } else if (selectedSchemaType === 'certificate') {
        // Predefined certificate schema
        parsedSchema = {
          'certificate_id': 'string',
          'holder_name': 'string',
          'certificate_type': 'string',
          'issue_date': 'string',
          'expiry_date': 'string',
          'issuer': 'string'
        };
      } else if (selectedSchemaType === 'xyz') {
        // Predefined XYZ schema
        parsedSchema = {
          'id': 'string',
          'name': 'string',
          'type': 'string',
          'value': 'string'
        };
      }

      // Parse metadata (optional)
      let parsedMeta = {};
      if (showCreateMetadata && Object.keys(createFormData.meta).length > 0) {
        parsedMeta = createFormData.meta;
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

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
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
          ...(Object.keys(parsedMeta).length > 0 && { meta: parsedMeta })
        }),
      });

      const result = await response.json();

      if (result.message === "Registry created") {
        toast({
          title: 'Success',
          description: 'Registry created successfully',
        });
        setIsCreateModalOpen(false);
        setCreateFormData({ name: '', description: '', schema: '', metadata: '', meta: {} });
        setSchemaFields([{ key: '', type: 'string' }]);
        setShowCreateMetadata(false);
        setSelectedSchemaType('blank');
        setShowSchemaBuilder(false);
        // Refresh the registries list
        await refreshRegistries();
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
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenUpdateModal = (registry: Registry) => {
    setSelectedRegistry(registry);
    
    // Handle metadata properly - only show if it exists and has content
    let metaObj = {};
    let hasMetadata = false;
    if (registry.meta && typeof registry.meta === 'object' && Object.keys(registry.meta).length > 0) {
      // Check if meta has actual content (not just empty object)
      const hasContent = Object.values(registry.meta).some(value => 
        value !== null && value !== undefined && value !== '' && 
        (typeof value !== 'object' || Object.keys(value).length > 0)
      );
      if (hasContent) {
        metaObj = registry.meta;
        hasMetadata = true;
      }
    }
    
    setUpdateFormData({
      name: registry.registry_name,
      description: registry.description,
      schema: '', // Remove schema from update form
      metadata: '',
      meta: metaObj,
    });
    setShowUpdateMetadata(hasMetadata);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateRegistry = async () => {
    if (!selectedRegistry || updateLoading) return;
    
    try {
      setUpdateLoading(true);
      
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
      if (showUpdateMetadata && Object.keys(updateFormData.meta).length > 0) {
        parsedMeta = updateFormData.meta;
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

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/update-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          description: updateFormData.description.trim(),
          ...(Object.keys(parsedMeta).length > 0 && { meta: parsedMeta })
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
        await refreshRegistries();
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
    } finally {
      setUpdateLoading(false);
    }
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
    setActionLoading(true);
    try {
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to archive the registry',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/archive-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}), 
      });

      const result = await response.json();

      if (response.ok && result.message === "Registry has been archived") {
        toast({
          title: '🎉 Success!',
          description: `Registry "${selectedRegistry.registry_name}" archived successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        // Refresh the registries list to show updated status
        await refreshRegistries();
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

  const handleOpenRestoreAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsRestoreAlertOpen(true);
  };

  const handleRestoreRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to restore the registry',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/restore-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.message === "Registry has been restored") {
        toast({
          title: '🎉 Success!',
          description: `Registry "${selectedRegistry.registry_name}" restored successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        // Refresh the registries list to show updated status
        await refreshRegistries();
      } else {
        const errorMessage = result.message || (response.status === 500 ? 'Internal Server Error' : 'Failed to restore registry');
        toast({
          title: 'Restore Error',
          description: errorMessage,
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

  const handleOpenRevokeAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsRevokeAlertOpen(true);
  };

  const handleRevokeRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to revoke the registry',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/revoke-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok ) {
        toast({
          title: '🎉 Success!',
          description: `Registry "${selectedRegistry.registry_name}" revoked successfully.`,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        
        // Refresh the registries list to show updated status
        await refreshRegistries();
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

  const handleOpenReinstateAlert = (registry: Registry) => {
    setSelectedRegistry(registry);
    setIsReinstateAlertOpen(true);
  };

  const handleReinstateRegistry = async () => {
    if (!selectedRegistry) return;
    setActionLoading(true);
    try {
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to reinstate the registry',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${selectedRegistry.registry_name}/reinstate-registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
        await refreshRegistries();
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

  const handleBulkUpload = async () => {
    if (uploadLoading) return; // Prevent multiple submissions
    
    try {
      if (!selectedFiles?.length) {
        toast({
          title: 'Error',
          description: 'Please select files to upload',
          variant: 'destructive',
        });
        return;
      }

      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to upload files',
          variant: 'destructive',
        });
        return;
      }

      setUploadLoading(true);
      setUploadProgress(['Starting upload...']);
      
      // Set global upload status
      setGlobalUploadStatus({
        isUploading: true,
        message: `Uploading ${selectedFiles.length} file(s)...`,
        namespaceId: namespaceId || ''
      });

      // Create FormData
      const formData = new FormData();
      formData.append('namespace', namespaceId || '');
      
      // Add all selected files
      Array.from(selectedFiles).forEach((file) => {
        formData.append('file', file);
      });

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Upload response:', response);
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        try {
          // Process streaming response line by line as it arrives
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line.trim());
                  console.log('Upload stream data:', data);
                  
                  if (data.message) {
                    // Update progress in real-time (for modal log)
                    setUploadProgress(prev => [...prev, data.message]);
                    
                    // Check for completion FIRST
                    if (data.status === 'success' && data.message === 'Bulk upload complete') {
                      console.log('✅ Upload completed! Processing completion...');
                      
                      setGlobalUploadStatus(null); // Clear global progress notification
                      
                      toast({
                        title: '🎉 Upload Complete',
                        description: 'All files have been uploaded successfully!',
                        duration: 5000,
                        className: 'border-green-200 bg-green-50 text-green-900',
                      });
                      
                      setTimeout(async () => {
                        try {
                          console.log('🔄 Refreshing registries...');
                          await refreshRegistries();
                          console.log('✅ Registries refreshed successfully');
                        } catch (error) {
                          console.error('❌ Failed to refresh registries:', error);
                          toast({
                            title: 'Warning',
                            description: 'Upload completed but failed to refresh list. Please refresh manually.',
                            variant: 'destructive',
                          });
                        }
                      }, 1000);
                      
                      setTimeout(() => {
                        setIsBulkUploadModalOpen(false);
                        setSelectedFiles(null);
                      }, 3000);
                      
                      // reader.releaseLock() will be handled by the finally block
                      return; // Exit handleBulkUpload function as upload is fully complete
                    }
                    
                    // Check for errors SECOND
                    if (data.status === 'error' || 
                        data.message.toLowerCase().includes('error') || 
                        data.message.toLowerCase().includes('failed')) {
                      console.log('❌ Upload error detected:', data.message);
                      setGlobalUploadStatus(null);
                      toast({
                        title: 'Upload Error',
                        description: data.message,
                        variant: 'destructive',
                        duration: 7000,
                      });
                      // reader.releaseLock() will be handled by the finally block
                      return; // Exit handleBulkUpload function on error
                    }

                    // If not complete and not an error, and still uploading, update global notification message
                    if (data.status === 'success' && globalUploadStatus?.isUploading) {
                      setGlobalUploadStatus(prevStatus => prevStatus ? ({
                        ...prevStatus,
                        message: data.message, // Dynamically update progress message
                      }) : null);
                    }
                  }
                } catch (e) {
                  console.warn('Failed to parse line:', line);
                }
              }
            }
          }
          
          // Process any remaining buffer after stream ends
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer.trim());
              console.log('Upload stream data (final):', data);
              
              if (data.message) {
                setUploadProgress(prev => [...prev, data.message]);
                
                // Check for completion FIRST (also in final buffer)
                if (data.status === 'success' && data.message === 'Bulk upload complete') {
                  console.log('✅ Upload completed (final buffer)! Processing completion...');
                  
                  setGlobalUploadStatus(null);
                  toast({
                    title: '🎉 Upload Complete',
                    description: 'All files have been uploaded successfully!',
                    duration: 5000,
                    className: 'border-green-200 bg-green-50 text-green-900',
                  });
                  
                  setTimeout(async () => {
                    try {
                      console.log('🔄 Refreshing registries...');
                      await refreshRegistries();
                      console.log('✅ Registries refreshed successfully');
                    } catch (error) {
                      console.error('❌ Failed to refresh registries:', error);
                      toast({
                        title: 'Warning',
                        description: 'Upload completed but failed to refresh list. Please refresh manually.',
                        variant: 'destructive',
                      });
                    }
                  }, 1000);
                  
                  setTimeout(() => {
                    setIsBulkUploadModalOpen(false);
                    setSelectedFiles(null);
                  }, 3000);
                  // reader.releaseLock() will be handled by the finally block
                  return; // Exit handleBulkUpload
                }

                // Check for errors SECOND (also in final buffer)
                if (data.status === 'error' ||
                    data.message.toLowerCase().includes('error') ||
                    data.message.toLowerCase().includes('failed')) {
                    console.log('❌ Upload error detected (final buffer):', data.message);
                    setGlobalUploadStatus(null);
                    toast({
                        title: 'Upload Error',
                        description: data.message,
                        variant: 'destructive',
                        duration: 7000,
                    });
                    // reader.releaseLock() will be handled by the finally block
                    return; // Exit handleBulkUpload on error
                }
                
                // If not complete and not an error, and still uploading, update global notification message
                if (data.status === 'success' && globalUploadStatus?.isUploading) {
                  setGlobalUploadStatus(prevStatus => prevStatus ? ({
                    ...prevStatus,
                    message: data.message, // Dynamically update progress message
                  }) : null);
                }
              }
            } catch (e) {
              console.warn('Failed to parse final buffer:', buffer);
            }
          }
          
        } finally {
          reader.releaseLock();
        }
      }

      // If we reach here, the stream ended without explicit completion
      console.log('⚠️ Stream ended without completion message');
      setGlobalUploadStatus(null);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setGlobalUploadStatus(null); // Clear global status on error
      toast({
        title: 'Error',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
        duration: 7000,
      });
      setUploadProgress(prev => [...prev, 'Upload failed. Please try again.']);
    } finally {
      setUploadLoading(false);
      console.log('🔧 Upload process cleanup completed');
      
      // Clear local progress after some time if modal is still open
      setTimeout(() => {
        if (!uploadLoading) {
          setUploadProgress([]);
          console.log('🧹 Upload progress cleared');
        }
      }, 10000);
    }
  };

  const handleRegistryClick = (registry: Registry) => {
    navigate(`/${namespaceId}/${registry.registry_name}`);
  };

  const addSchemaField = () => {
    setSchemaFields(prev => [...prev, { key: '', type: 'string' }]);
  };

  const removeSchemaField = (index: number) => {
    setSchemaFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateSchemaField = (index: number, field: 'key' | 'type', value: string) => {
    setSchemaFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleCreateMetaChange = (key: string, value: any) => {
    setCreateFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [key]: value,
      },
    }));
  };

  const handleUpdateMetaChange = (key: string, value: any) => {
    setUpdateFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [key]: value,
      },
    }));
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
      {/* Global Upload Progress Notification */}
      {globalUploadStatus?.isUploading && (
        <div className="fixed top-4 right-4 z-50 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md shadow-lg max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Bulk Upload in Progress
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {globalUploadStatus.message}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                You'll be notified when complete
              </p>
              <button
                onClick={() => setGlobalUploadStatus(null)}
                className="text-xs text-blue-700 hover:text-blue-900 mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
          Manage and organize your registries in this namespace ({totalRegistries} total registries, {registries.filter(r => !r.is_revoked && !r.is_archived).length} active registries)
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button onClick={() => {
            setIsCreateModalOpen(true);
            setSelectedSchemaType('blank');
            setShowSchemaBuilder(false);
            setCreateFormData({ name: '', description: '', schema: '', metadata: '', meta: {} });
            setSchemaFields([{ key: '', type: 'string' }]);
            setShowCreateMetadata(false);
          }} className="px-8 py-6 text-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Registry
          </Button>
          <Button variant="outline" onClick={() => setIsBulkUploadModalOpen(true)} className="px-8 py-6 text-lg">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/namespaces/${namespaceId}/revoked`)} 
          className="px-8 py-6 text-lg relative"
        >
          <Ban className="mr-2 h-4 w-4" />
          Revoked Registries
          {revokedRegistriesCount > 0 && (
            <Badge variant="destructive" className="ml-2 px-2 py-1 text-xs">
              {revokedRegistriesCount}
            </Badge>
          )}
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
              onClick={() => handleRegistryClick(registry)}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{registry.registry_name}</CardTitle>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenuItem 
                              disabled
                              className="cursor-not-allowed opacity-50"
                            >
                              Delegate
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Feature coming in next version</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuSeparator />
                    {registry.is_archived ? (
                      <DropdownMenuItem onClick={() => handleOpenRestoreAlert(registry)} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleOpenArchiveAlert(registry)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    {registry.is_revoked ? (
                      <DropdownMenuItem onClick={() => handleOpenReinstateAlert(registry)} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Reinstate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleOpenRevokeAlert(registry)} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50">
                        <Ban className="mr-2 h-4 w-4" />
                        Revoke
                      </DropdownMenuItem>
                    )}
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
                {(registry.is_archived || registry.is_revoked) && (
                  <div className="mt-2 flex gap-2">
                    {registry.is_archived && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Archive className="mr-1 h-3 w-3" />
                        Archived
                      </span>
                    )}
                    {registry.is_revoked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Ban className="mr-1 h-3 w-3" />
                        Revoked
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Registry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={createFormData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow alphanumeric characters, hyphens, and underscores
                  const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
                  setCreateFormData({ ...createFormData, name: filteredValue });
                }}
                placeholder="Enter registry name (alphanumeric, _, - only)"
              />
              <p className="text-xs text-muted-foreground">Only letters, numbers, underscores (_), and hyphens (-) are allowed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description *</Label>
              <Textarea
                id="create-description"
                value={createFormData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    setCreateFormData({ ...createFormData, description: value });
                  }
                }}
                placeholder="Enter registry description"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Maximum 200 characters</span>
                <span className={`${
                  createFormData.description.length > 180 
                    ? 'text-red-500' 
                    : createFormData.description.length > 160 
                    ? 'text-yellow-500' 
                    : 'text-muted-foreground'
                }`}>
                  {createFormData.description.length}/200
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Schema *</Label>
              
              {/* Schema Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:border-primary hover:shadow-md ${
                    selectedSchemaType === 'blank' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedSchemaType('blank');
                    setShowSchemaBuilder(true);
                  }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-sm font-medium">Blank Schema</p>
                </div>
                
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:border-primary hover:shadow-md ${
                    selectedSchemaType === 'membership' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSchemaType('membership')}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Membership</p>
                </div>
                
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:border-primary hover:shadow-md ${
                    selectedSchemaType === 'certificate' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSchemaType('certificate')}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                    <Archive className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Certificate</p>
                </div>
                
                <div 
                  className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:border-primary hover:shadow-md ${
                    selectedSchemaType === 'xyz' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSchemaType('xyz')}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Info className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">XYZ</p>
                </div>
              </div>

              {/* Schema Builder - Only show for Blank Schema */}
              {selectedSchemaType === 'blank' && showSchemaBuilder && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Schema Fields</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSchemaField}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {schemaFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Field name (alphanumeric, _, - only)"
                          value={field.key}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow alphanumeric characters, hyphens, and underscores
                            const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
                            updateSchemaField(index, 'key', filteredValue);
                          }}
                          className="flex-1"
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateSchemaField(index, 'type', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">string</SelectItem>
                            <SelectItem value="integer">integer</SelectItem>
                            <SelectItem value="float">float</SelectItem>
                            <SelectItem value="bool">bool</SelectItem>
                          </SelectContent>
                        </Select>
                        {schemaFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSchemaField(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview for other schema types */}
              {selectedSchemaType !== 'blank' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    {selectedSchemaType === 'membership' && 'Membership schema template will be applied'}
                    {selectedSchemaType === 'certificate' && 'Certificate schema template will be applied'}
                    {selectedSchemaType === 'xyz' && 'XYZ schema template will be applied'}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Metadata (Optional)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs p-2 text-sm">
                          <p className="font-bold">Customizable Metadata</p>
                          <p className="my-2">
                            These are the customizable fields where you can define your own data types as per your application needs.
                          </p>
                          <p className="font-semibold">Example:</p>
                          <div className="ml-2">
                            <p>
                              <code className="font-mono text-xs">"bg-card-image"</code>: <code className="font-mono text-xs">"ImageUrl"</code>
                            </p>
                          </div>
                          <p className="my-2 text-xs text-slate-50">
                              You can use this image URL as per your app requirement.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  checked={showCreateMetadata}
                  onCheckedChange={setShowCreateMetadata}
                />
              </div>
              {showCreateMetadata && (
                <div className="grid gap-4">
                  {Object.keys(createFormData.meta).map((key, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const value = createFormData.meta[key];
                          setCreateFormData(prev => {
                            const newMeta = { ...prev.meta };
                            delete newMeta[key];
                            if (newKey) {
                              newMeta[newKey] = value;
                            }
                            return { ...prev, meta: newMeta };
                          });
                        }}
                        placeholder="key"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={typeof createFormData.meta[key] === 'string' ? createFormData.meta[key] : JSON.stringify(createFormData.meta[key])}
                          onChange={(e) => {
                            let value: any = e.target.value;
                            // Try to parse as JSON if it looks like an object
                            if (value.startsWith('{') || value.startsWith('[')) {
                              try {
                                value = JSON.parse(value);
                              } catch {
                                // Keep as string if parsing fails
                              }
                            }
                            handleCreateMetaChange(key, value);
                          }}
                          placeholder="value"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCreateFormData(prev => {
                              const newMeta = { ...prev.meta };
                              delete newMeta[key];
                              return { ...prev, meta: newMeta };
                            });
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateFormData(prev => ({
                        ...prev,
                        meta: { ...prev.meta, "": "" }
                      }));
                    }}
                  >
                    Add Metadata Field
                  </Button>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={handleCreateRegistry} disabled={createLoading}>
              {createLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create'
              )}
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
                readOnly
                disabled
                className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                placeholder="Registry name cannot be changed"
              />
              <p className="text-xs text-muted-foreground">Registry name cannot be modified after creation</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-description">Description *</Label>
              <Textarea
                id="update-description"
                value={updateFormData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    setUpdateFormData({ ...updateFormData, description: value });
                  }
                }}
                placeholder="Enter registry description"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Maximum 200 characters</span>
                <span className={`${
                  updateFormData.description.length > 180 
                    ? 'text-red-500' 
                    : updateFormData.description.length > 160 
                    ? 'text-yellow-500' 
                    : 'text-muted-foreground'
                }`}>
                  {updateFormData.description.length}/200
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Metadata (Optional)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs p-2 text-sm">
                          <p className="font-bold">Customizable Metadata</p>
                          <p className="my-2">
                            These are the customizable fields where you can define your own data types as per your application needs.
                          </p>
                          <p className="font-semibold">Example:</p>
                          <div className="ml-2">
                            <p>
                              <code className="font-mono text-xs">"bg-card-image"</code>: <code className="font-mono text-xs">"ImageUrl"</code>
                            </p>
                          </div>
                          <p className="my-2 text-xs text-slate-50">
                              You can use this image URL as per your app requirement.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  checked={showUpdateMetadata}
                  onCheckedChange={setShowUpdateMetadata}
                />
              </div>
              {showUpdateMetadata && (
                <div className="grid gap-4">
                  {Object.keys(updateFormData.meta).map((key, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const value = updateFormData.meta[key];
                          setUpdateFormData(prev => {
                            const newMeta = { ...prev.meta };
                            delete newMeta[key];
                            if (newKey) {
                              newMeta[newKey] = value;
                            }
                            return { ...prev, meta: newMeta };
                          });
                        }}
                        placeholder="key"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={typeof updateFormData.meta[key] === 'string' ? updateFormData.meta[key] : JSON.stringify(updateFormData.meta[key])}
                          onChange={(e) => {
                            let value: any = e.target.value;
                            // Try to parse as JSON if it looks like an object
                            if (value.startsWith('{') || value.startsWith('[')) {
                              try {
                                value = JSON.parse(value);
                              } catch {
                                // Keep as string if parsing fails
                              }
                            }
                            handleUpdateMetaChange(key, value);
                          }}
                          placeholder="value"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setUpdateFormData(prev => {
                              const newMeta = { ...prev.meta };
                              delete newMeta[key];
                              return { ...prev, meta: newMeta };
                            });
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUpdateFormData(prev => ({
                        ...prev,
                        meta: { ...prev.meta, "": "" }
                      }));
                    }}
                  >
                    Add Metadata Field
                  </Button>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={handleUpdateRegistry} disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Registry'
              )}
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
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)} disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveRegistry} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
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
            <AlertDialogAction onClick={handleRestoreRegistry} className="bg-green-600 hover:bg-green-700" disabled={actionLoading}>
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

      <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to revoke this registry?</AlertDialogTitle>
            {selectedRegistry && (
              <AlertDialogDescription>
                This action will revoke the registry "{selectedRegistry.registry_name}". This will make the registry inactive and prevent its use.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRegistry(null)} disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeRegistry} className="bg-orange-600 hover:bg-orange-700" disabled={actionLoading}>
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

      <Dialog open={isBulkUploadModalOpen} onOpenChange={(open) => {
        // Allow closing the modal even during upload
        if (!open) {
          setIsBulkUploadModalOpen(false);
          if (!uploadLoading) {
            setUploadProgress([]);
            setSelectedFiles(null);
          }
        } else {
          setIsBulkUploadModalOpen(true);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload</DialogTitle>
            <DialogDescription>
              Upload multiple files to create registries in bulk
            </DialogDescription>
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
                disabled={uploadLoading}
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>
            
            {uploadProgress.length > 0 && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-md text-sm">
                  {uploadProgress.map((message, index) => (
                    <div key={index} className="text-gray-700 mb-1">
                      {message}
                    </div>
                  ))}
                </div>
                {uploadLoading && (
                  <p className="text-sm text-blue-600">
                    ℹ️ You can close this modal and continue working. Upload will continue in the background.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBulkUploadModalOpen(false);
                  if (!uploadLoading) {
                    setUploadProgress([]);
                    setSelectedFiles(null);
                  }
                }}
                className="flex-1"
              >
                {uploadLoading ? 'Continue Working' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleBulkUpload}
                disabled={uploadLoading || !selectedFiles?.length}
                className="flex-1"
              >
                {uploadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}