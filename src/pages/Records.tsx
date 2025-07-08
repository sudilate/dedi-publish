import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, MoreVertical, Eye, Info } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  arrayFields: { [key: string]: any[] }; // Add array fields support
}

// Interface for add record API response
interface AddRecordApiResponse {
  message: string;
  data: {
    record_id: string;
  };
}

// Define array field configurations based on schema
const arrayFieldConfigs: { [key: string]: { [key: string]: string } } = {
  previousKeys: {
    publicKey: 'string',
    keyType: 'string', 
    keyFormat: 'string'
  }
};

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
    arrayFields: {},
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
      console.log('📊 Response status:', response.status);
      console.log('📊 Response OK:', response.ok);
      
      if (response.ok && result.message === "Resource retrieved successfully") {
        setRecords(result.data.records || []);
        setSchema(result.data.schema || {});
        setNamespaceName(result.data.namespace_name || 'Loading...');
        setRegistryDisplayName(result.data.registry_name || 'Loading...');
        setTotalRecords(result.data.total_records || 0);
        console.log('✅ Records updated:', result.data.records?.length || 0, 'records');
        console.log('🏷️ Namespace name from API:', result.data.namespace_name);
        console.log('📁 Registry name from API:', result.data.registry_name);
        console.log('📊 Schema from API:', result.data.schema);
        console.log('📊 Records from API:', result.data.records);
      } else {
        console.error('❌ Failed to fetch records:', result.message);
        console.error('❌ Full error response:', result);
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
    console.log('🔧 Opening add modal with schema:', schema);
    console.log('🔧 Array field configs:', arrayFieldConfigs);
    
    // Initialize form with empty details based on schema
    const initialDetails: { [key: string]: string } = {};
    const initialArrayFields: { [key: string]: any[] } = {};
    
    Object.keys(schema).forEach(field => {
      console.log(`🔧 Processing field: ${field}, type: ${schema[field]}`);
      
      if (schema[field].toLowerCase() === 'array' && arrayFieldConfigs[field]) {
        console.log(`🔧 ${field} is an array field with config:`, arrayFieldConfigs[field]);
        // Initialize array fields with one empty item
        const emptyItem: { [key: string]: string } = {};
        Object.keys(arrayFieldConfigs[field]).forEach(itemKey => {
          emptyItem[itemKey] = '';
        });
        initialArrayFields[field] = [emptyItem];
      } else {
        console.log(`🔧 ${field} is a regular field`);
        initialDetails[field] = '';
      }
    });
    
    console.log('🔧 Initial details:', initialDetails);
    console.log('🔧 Initial array fields:', initialArrayFields);
    
    setAddFormData({
      record_name: '',
      description: '',
      details: initialDetails,
      meta: {},
      arrayFields: initialArrayFields,
    });
    setShowAddMetadata(false);
    setIsAddModalOpen(true);
  };

  // Array field management functions
  const addArrayItem = (fieldKey: string) => {
    const config = arrayFieldConfigs[fieldKey];
    if (!config) return;
    
    const emptyItem: { [key: string]: string } = {};
    Object.keys(config).forEach(itemKey => {
      emptyItem[itemKey] = '';
    });
    
    setAddFormData(prev => ({
      ...prev,
      arrayFields: {
        ...prev.arrayFields,
        [fieldKey]: [...(prev.arrayFields[fieldKey] || []), emptyItem]
      }
    }));
  };

  const removeArrayItem = (fieldKey: string, index: number) => {
    setAddFormData(prev => ({
      ...prev,
      arrayFields: {
        ...prev.arrayFields,
        [fieldKey]: prev.arrayFields[fieldKey]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateArrayItem = (fieldKey: string, index: number, itemKey: string, value: string) => {
    setAddFormData(prev => ({
      ...prev,
      arrayFields: {
        ...prev.arrayFields,
        [fieldKey]: prev.arrayFields[fieldKey]?.map((item, i) => 
          i === index ? { ...item, [itemKey]: value } : item
        ) || []
      }
    }));
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

      // Validate required schema fields
      const missingFields = Object.keys(schema).filter(field => {
        if (schema[field].toLowerCase() === 'array') {
          // For array fields, check if at least one valid item exists
          const arrayItems = addFormData.arrayFields[field] || [];
          const validItems = arrayItems.filter(item => 
            Object.values(item).some(val => val && String(val).trim() !== '')
          );
          return validItems.length === 0;
        } else {
          // For regular fields, check if value exists
          return !addFormData.details[field] || !addFormData.details[field].trim();
        }
      });

      if (missingFields.length > 0) {
        toast({
          title: 'Validation Error',
          description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      // Prepare details with array fields
      const finalDetails: { [key: string]: string | any[] } = { ...addFormData.details };
      
      // Process array fields
      Object.keys(addFormData.arrayFields).forEach(fieldKey => {
        const arrayItems = addFormData.arrayFields[fieldKey] || [];
        const validItems = arrayItems.filter(item => 
          Object.values(item).some(val => val && String(val).trim() !== '')
        );
        if (validItems.length > 0) {
          finalDetails[fieldKey] = validItems; // Send as actual array, not JSON string
        }
      });

      // Prepare metadata (optional)
      let parsedMeta = {};
      if (showAddMetadata && Object.keys(addFormData.meta).length > 0) {
        parsedMeta = addFormData.meta;
      }

      // Get auth tokens
      const { accessToken } = getAuthTokens();
      if (!accessToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to add a record',
          variant: 'destructive',
        });
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'https://dev.dedi.global';
      const response = await fetch(`${API_BASE_URL}/dedi/${namespaceId}/${registryName}/add-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          record_name: addFormData.record_name.trim(),
          description: addFormData.description.trim(),
          details: finalDetails,
          ...(Object.keys(parsedMeta).length > 0 && { meta: parsedMeta })
        }),
      });

      const result: AddRecordApiResponse = await response.json();
      console.log('📝 Add record API response:', result);
      console.log('📝 Response status:', response.status);

      if (response.ok && (result.message === "Record created" || result.message === "Record created successfully")) {
        toast({
          title: 'Success',
          description: 'Record added successfully',
        });
        setIsAddModalOpen(false);
        setAddFormData({
          record_name: '',
          description: '',
          details: {},
          meta: {},
          arrayFields: {},
        });
        setShowAddMetadata(false);
        // Refresh the records list
        await fetchRecords();
      } else {
        console.error('❌ API Error:', result);
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
    
    const value = record.details[column];
    
    // Handle array fields
    if (Array.isArray(value)) {
      return `${value.length} item(s)`;
    }
    
    // Handle object fields (for arrays stored as JSON strings)
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return `${parsed.length} item(s)`;
        }
        return 'Object';
      } catch {
        // If parsing fails, return the string as is
        return value;
      }
    }
    
    return value || '';
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  variant="outline" 
                  disabled
                  className="px-8 py-6 text-lg cursor-not-allowed opacity-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Feature coming in next version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
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
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow alphanumeric characters, hyphens, and underscores
                      const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
                      setAddFormData(prev => ({ ...prev, record_name: filteredValue }));
                    }}
                    placeholder="Enter record name (alphanumeric, _, - only)"
                  />
                  <p className="text-xs text-muted-foreground">Only letters, numbers, underscores (_), and hyphens (-) are allowed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description">Description *</Label>
                  <Textarea
                    id="add-description"
                    value={addFormData.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 200) {
                        setAddFormData(prev => ({ ...prev, description: value }));
                      }
                    }}
                    placeholder="Enter record description"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Maximum 200 characters</span>
                    <span className={`${
                      addFormData.description.length > 180 
                        ? 'text-red-500' 
                        : addFormData.description.length > 160 
                        ? 'text-yellow-500' 
                        : 'text-muted-foreground'
                    }`}>
                      {addFormData.description.length}/200
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Record Details</h3>
              <div className="grid gap-4">
                {Object.keys(schema).map((field) => {
                  const fieldType = schema[field].toLowerCase();
                  const isNumeric = fieldType === 'integer' || fieldType === 'int' || fieldType === 'float' || fieldType === 'double' || fieldType === 'number';
                  const isBoolean = fieldType === 'boolean' || fieldType === 'bool';
                  const isArray = fieldType === 'array' && arrayFieldConfigs[field];
                  
                  if (isArray) {
                    const config = arrayFieldConfigs[field];
                    const arrayItems = addFormData.arrayFields[field] || [];
                    
                    return (
                      <div key={field} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>
                            {field} 
                            <span className="text-muted-foreground ml-1">({schema[field]})</span>
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem(field)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add {field.slice(0, -1)} {/* Remove 's' from plural name */}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {arrayItems.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-sm">{field.slice(0, -1)} {index + 1}</h5>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeArrayItem(field, index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  ×
                                </Button>
                              </div>
                              <div className="grid gap-3">
                                {Object.keys(config).map((itemKey) => (
                                  <div key={itemKey} className="space-y-1">
                                    <Label htmlFor={`${field}-${index}-${itemKey}`} className="text-sm">
                                      {itemKey}
                                      <span className="text-muted-foreground ml-1">({config[itemKey]})</span>
                                    </Label>
                                    <Input
                                      id={`${field}-${index}-${itemKey}`}
                                      value={item[itemKey] || ''}
                                      onChange={(e) => updateArrayItem(field, index, itemKey, e.target.value)}
                                      placeholder={`Enter ${itemKey}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`add-detail-${field}`}>
                        {field} 
                        <span className="text-muted-foreground ml-1">({schema[field]})</span>
                      </Label>
                      {isBoolean ? (
                        <Select
                          value={addFormData.details[field] || ''}
                          onValueChange={(value: string) => handleDetailsChange(field, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select true or false" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`add-detail-${field}`}
                          type={isNumeric ? 'number' : 'text'}
                          value={addFormData.details[field] || ''}
                          onChange={(e) => handleDetailsChange(field, e.target.value)}
                          placeholder={
                            isNumeric 
                              ? `Enter ${field} (${fieldType === 'integer' || fieldType === 'int' ? 'whole number' : 'number'})`
                              : `Enter ${field}`
                          }
                          step={fieldType === 'float' || fieldType === 'double' || fieldType === 'number' ? 'any' : undefined}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                  <h3 className="text-lg font-medium">Metadata (Optional)</h3>
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