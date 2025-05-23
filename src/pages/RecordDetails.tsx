import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

// Interface for breadcrumb API response
interface BreadcrumbApiResponse {
  message: string;
  data: {
    namespace_id: string;
    namespace_name: string;
    registry_name: string;
    registry_id: string;
  };
}

// Interface for record details API response
interface RecordDetailsApiResponse {
  message: string;
  data: {
    namespace: string;
    namespace_id: string;
    registry_id: string;
    registry_name: string;
    record_id: string;
    record_name: string;
    description: string;
    digest: string;
    schema: { [key: string]: string };
    version_count: number;
    version: string;
    details: { [key: string]: string };
    meta: any;
    created_at: string;
    last_updated_at: string;
    created_by: string;
    is_revoked: boolean | null;
    is_archived: boolean | null;
    ttl: string;
  };
}

export function RecordDetailsPage() {
  const { namespaceId, registryName, recordName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAuthTokens } = useAuth();
  
  const [breadcrumbData, setBreadcrumbData] = useState<BreadcrumbApiResponse['data'] | null>(null);
  const [recordDetails, setRecordDetails] = useState<RecordDetailsApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordLoading, setRecordLoading] = useState(true);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
  const [isRevokeAlertOpen, setIsRevokeAlertOpen] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);

  useEffect(() => {
    if (namespaceId && registryName && recordName) {
      fetchRecordDetails();
    }
  }, [namespaceId, registryName, recordName]);

  const fetchRecordDetails = async () => {
    try {
      setRecordLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      // Properly encode URL parameters
      const encodedNamespace = namespaceId || '';
      const encodedRegistry = registryName || '';
      const encodedRecord = recordName || '';
      
      const response = await fetch(`${API_BASE_URL}/dedi/lookup/${encodedNamespace}/${encodedRegistry}/${encodedRecord}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: RecordDetailsApiResponse = await response.json();
      console.log('Record details API response:', result);
      
      if (result.message === "Resource retrieved successfully") {
        setRecordDetails(result.data);
        // Set breadcrumb data from record details instead of separate API call
        setBreadcrumbData({
          namespace_id: result.data.namespace_id,
          namespace_name: result.data.namespace || 'Namespace',
          registry_name: result.data.registry_name,
          registry_id: result.data.registry_id,
        });
      } else {
        console.error('Failed to fetch record details:', result.message);
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch record details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch record details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRecordLoading(false);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      console.log('Updating record...');
      toast({
        title: 'Success',
        description: 'Record updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update record',
        variant: 'destructive',
      });
    }
  };

  const handleOpenArchiveAlert = () => {
    setIsArchiveAlertOpen(true);
  };

  const handleArchiveRecord = async () => {
    if (archiveLoading) return; // Prevent multiple submissions
    
    try {
      setArchiveLoading(true);
      
      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to archive records',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      // Properly encode URL parameters
      const currentNamespaceId = namespaceId || '';
      const currentRegistryName = registryName || '';
      const currentRecordName = recordName || '';
      
      console.log('Archive API URL:', `${API_BASE_URL}/dedi/${currentNamespaceId}/${currentRegistryName}/${currentRecordName}/archive-record`);
      
      const response = await fetch(`${API_BASE_URL}/dedi/${currentNamespaceId}/${currentRegistryName}/${currentRecordName}/archive-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      console.log('Archive API response:', result);

      if (response.ok && result.message === "Record has been archived") {
        toast({
          title: 'Success',
          description: 'Record archived successfully',
        });
        setIsArchiveAlertOpen(false);
        // Refresh record details to show updated status
        await fetchRecordDetails();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to archive record',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error archiving record:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleOpenRevokeAlert = () => {
    setIsRevokeAlertOpen(true);
  };

  const handleRevokeRecord = async () => {
    if (revokeLoading) return; // Prevent multiple submissions
    
    try {
      setRevokeLoading(true);
      
      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to revoke records',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
      // Properly encode URL parameters
      const currentNamespaceId = namespaceId || '';
      const currentRegistryName = registryName || '';
      const currentRecordName = recordName || '';
      
      console.log('Revoke API URL:', `${API_BASE_URL}/dedi/${currentNamespaceId}/${currentRegistryName}/${currentRecordName}/revoke-record`);
      
      const response = await fetch(`${API_BASE_URL}/dedi/${currentNamespaceId}/${currentRegistryName}/${currentRecordName}/revoke-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      console.log('Revoke API response:', result);

      if (response.ok && result.message === "Record has been revoked") {
        toast({
          title: 'Success',
          description: 'Record revoked successfully',
        });
        setIsRevokeAlertOpen(false);
        // Refresh record details to show updated status
        await fetchRecordDetails();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to revoke record',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error revoking record:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRevokeLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!recordDetails) return 'Unknown';
    
    if (recordDetails.is_revoked) return 'Revoked';
    if (recordDetails.is_archived) return 'Archived';
    return 'Active';
  };

  const getStatusColor = () => {
    if (!recordDetails) return 'text-gray-500';
    
    if (recordDetails.is_revoked) return 'text-red-600';
    if (recordDetails.is_archived) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Show loading state
  if (loading || recordLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading record details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if record details couldn't be loaded
  if (!recordDetails) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="mx-auto h-32 w-32 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load record</h3>
            <p className="text-muted-foreground mb-4">
              The record details could not be retrieved.
            </p>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/namespaces/${namespaceId}`)}>
                {breadcrumbData?.namespace_name || 'Namespace'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/${namespaceId}/${registryName}`)}>
                {breadcrumbData?.registry_name || registryName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{recordDetails.record_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Record Information */}
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{recordDetails.record_name}</CardTitle>
              <CardDescription>{recordDetails.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleUpdate}>
                  Update
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleOpenArchiveAlert} className="text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50">
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenRevokeAlert} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  Revoke
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Record ID</h3>
                  <p className="text-sm font-mono break-all">{recordDetails.record_id}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Digest</h3>
                  <p className="text-sm font-mono break-all">{recordDetails.digest}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Version</h3>
                  <p className="text-sm font-mono break-all">{recordDetails.version}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Version Count</h3>
                  <p className="text-sm">{recordDetails.version_count}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                  <p className="text-sm">{formatDate(recordDetails.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                  <p className="text-sm">{formatDate(recordDetails.last_updated_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Created By</h3>
                  <p className="text-sm font-mono break-all">{recordDetails.created_by}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                  <p className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusDisplay()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record Details */}
        <Card>
          <CardHeader>
            <CardTitle>Record Details</CardTitle>
            <CardDescription>
              Detailed information based on the registry schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(recordDetails.details).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="font-medium text-sm text-muted-foreground mb-1 sm:mb-0">
                    {key}
                  </div>
                  <div className="text-sm font-mono break-all sm:text-right">
                    {value || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schema Information */}
        <Card>
          <CardHeader>
            <CardTitle>Schema</CardTitle>
            <CardDescription>
              Data structure definition for this record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(recordDetails.schema).map(([field, type]) => (
                <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="font-medium text-sm text-muted-foreground mb-1 sm:mb-0">
                    {field}
                  </div>
                  <div className="text-sm font-mono">
                    {type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        {recordDetails.meta && Object.keys(recordDetails.meta).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Additional metadata associated with this record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(recordDetails.meta, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Archive Alert Dialog */}
      <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will archive the record "{recordDetails.record_name}". You may be able to unarchive it later, but it will be hidden from normal view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchiveRecord} 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={archiveLoading}
            >
              {archiveLoading ? (
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

      {/* Revoke Alert Dialog */}
      <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to revoke this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will revoke the record "{recordDetails.record_name}". This action may not be reversible and will mark the record as invalid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevokeRecord} 
              className="bg-red-600 hover:bg-red-700"
              disabled={revokeLoading}
            >
              {revokeLoading ? (
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