import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, MoreVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

interface RecordDetails {
  [key: string]: string | number;
}

interface Record {
  digest: string;
  record_name: string;
  record_id: string;
  description: string;
  details: RecordDetails;
  created_at: string;
  updated_at: string;
  created_by: string;
  version_count: number;
  version: string;
  meta: any;
  is_revoked: boolean | null;
  is_archived: boolean | null;
}

interface RecordsApiResponse {
  message: string;
  data: {
    namespace_id: string;
    namespace_name: string;
    registry_name: string;
    registry_id: string;
    schema: { [key: string]: string };
    created_by: string;
    created_at: string;
    updated_at: string;
    total_records: number;
    records: Record[];
  };
}

// Interface for add record form data
interface AddRecordFormData {
  record_name: string;
  description: string;
  details: { [key: string]: string };
  meta: { [key: string]: any };
}

// Interface for add record API response
interface AddRecordApiResponse {
  message: string;
  data: {
    record_id: string;
  };
}

export function RecordsPage() {
  const { namespaceId, registryName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAuthTokens } = useAuth();
  
  const [records, setRecords] = useState<Record[]>([]);
  const [schema, setSchema] = useState<{ [key: string]: string }>({});
  const [namespaceName, setNamespaceName] = useState<string>('Loading...');
  const [registryDisplayName, setRegistryDisplayName] = useState<string>('Loading...');
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showAddMetadata, setShowAddMetadata] = useState(false);
  const [addFormData, setAddFormData] = useState<AddRecordFormData>({
    record_name: '',
    description: '',
    details: {},
    meta: {},
  });

  useEffect(() => {
    if (namespaceId && registryName) {
      fetchRecords();
    }
  }, [namespaceId, registryName]);

  const fetchRecords = async () => {
    try {
      console.log('🔄 Fetching records...');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/query/${namespaceId}/${registryName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: RecordsApiResponse = await response.json();
      console.log('📊 Records API response:', result);
      
      if (result.message === "Resource retrieved successfully") {
        setRecords(result.data.records);
        setSchema(result.data.schema);
        setNamespaceName(result.data.namespace_name);
        setRegistryDisplayName(result.data.registry_name);
        setTotalRecords(result.data.total_records);
        console.log('✅ Records updated:', result.data.records.length, 'records');
        console.log('🏷️ Namespace name from API:', result.data.namespace_name);
        console.log('📁 Registry name from API:', result.data.registry_name);
      } else {
        console.error('❌ Failed to fetch records:', result.message);
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch records',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record: Record) => {
    navigate(`/${namespaceId}/${registryName}/${record.record_name}`);
  };

  const handleOpenAddModal = () => {
    // Initialize form with empty details based on schema
    const initialDetails: { [key: string]: string } = {};
    Object.keys(schema).forEach(field => {
      initialDetails[field] = '';
    });
    
    setAddFormData({
      record_name: '',
      description: '',
      details: initialDetails,
      meta: {},
    });
    setShowAddMetadata(false);
    setIsAddModalOpen(true);
  };

  const handleAddRecord = async () => {
    if (addLoading) return; // Prevent multiple submissions
    
    try {
      setAddLoading(true);
      
      // Validate required fields
      if (!addFormData.record_name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Record name is required',
          variant: 'destructive',
        });
        return;
      }

      if (!addFormData.description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Description is required',
          variant: 'destructive',
        });
        return;
      }

      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to add records',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const currentNamespaceId = namespaceId || '';
      const currentRegistryName = registryName || '';
      
      console.log('Add Record API URL:', `${API_BASE_URL}/dedi/${currentNamespaceId}/${currentRegistryName}/add-record`);
      
      const response = await fetch(`${API_BASE_URL}/dedi/${currentNamespaceId}/${currentRegistryName}/add-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          record_name: addFormData.record_name.trim(),
          description: addFormData.description.trim(),
          details: addFormData.details,
          ...(showAddMetadata && Object.keys(addFormData.meta).length > 0 && { meta: addFormData.meta }),
        }),
      });

      const result: AddRecordApiResponse = await response.json();
      console.log('Add Record API response:', result);

      if (response.ok && result.message === "record created") {
        toast({
          title: 'Success',
          description: 'Record added successfully',
        });
        setIsAddModalOpen(false);
        // Refresh the records list
        await fetchRecords();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to add record',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: 'Error',
        description: 'Failed to add record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleDetailsChange = (key: string, value: string) => {
    setAddFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value,
      },
    }));
  };

  const handleMetaChange = (key: string, value: any) => {
    setAddFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [key]: value,
      },
    }));
  };

  const handleBulkUpload = async () => {
    try {
      console.log('Starting bulk upload...');
      toast({
        title: 'Success',
        description: 'Bulk upload completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload records',
        variant: 'destructive',
      });
    }
  };

  // Get column headers from schema plus the record name column
  const getColumnHeaders = () => {
    const headers = ['Record Name', ...Object.keys(schema)];
    return headers;
  };

  // Get cell value for a record and column
  const getCellValue = (record: Record, column: string) => {
    if (column === 'Record Name') {
      return record.record_name;
    }
    return record.details[column] || '';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading records...</p>
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
            <BreadcrumbPage>{registryDisplayName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Records</h1>
        <p className="text-muted-foreground mt-2">
          Manage records in {registryDisplayName} ({totalRecords} total records)
        </p>
      </div>

      <div className="flex justify-start gap-4 mb-8">
        <Button onClick={handleOpenAddModal} className="px-8 py-6 text-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
        <Button variant="outline" onClick={handleBulkUpload} className="px-8 py-6 text-lg">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg font-medium mb-2">No records found</div>
          <p className="text-muted-foreground">
            Get started by adding your first record
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registry Records</CardTitle>
            <CardDescription>
              Showing {records.length} of {totalRecords} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getColumnHeaders().map((header) => (
                      <TableHead key={header} className="font-medium">
                        {header}
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow 
                      key={record.record_id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(record)}
                    >
                      {getColumnHeaders().map((column) => (
                        <TableCell key={column}>
                          {getCellValue(record, column)}
                        </TableCell>
                      ))}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleRowClick(record)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Record Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Record</DialogTitle>
            <DialogDescription>
              Create a new record in {registryDisplayName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-record-name">Record Name *</Label>
                  <Input
                    id="add-record-name"
                    value={addFormData.record_name}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, record_name: e.target.value }))}
                    placeholder="Enter record name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description">Description *</Label>
                  <Textarea
                    id="add-description"
                    value={addFormData.description}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter record description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Record Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Record Details</h3>
              <div className="grid gap-4">
                {Object.keys(schema).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={`add-detail-${field}`}>
                      {field} ({schema[field]})
                    </Label>
                    <Input
                      id={`add-detail-${field}`}
                      value={addFormData.details[field] || ''}
                      onChange={(e) => handleDetailsChange(field, e.target.value)}
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Metadata (Optional)</h3>
                <Switch
                  checked={showAddMetadata}
                  onCheckedChange={setShowAddMetadata}
                />
              </div>
              {showAddMetadata && (
                <div className="grid gap-4">
                  {Object.keys(addFormData.meta).map((key, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const value = addFormData.meta[key];
                          setAddFormData(prev => {
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
                          value={typeof addFormData.meta[key] === 'string' ? addFormData.meta[key] : JSON.stringify(addFormData.meta[key])}
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
                            handleMetaChange(key, value);
                          }}
                          placeholder="value"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setAddFormData(prev => {
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
                      setAddFormData(prev => ({
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddRecord} disabled={addLoading}>
              {addLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 