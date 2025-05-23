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

  useEffect(() => {
    if (namespaceId && registryName) {
      fetchRecords();
    }
  }, [namespaceId, registryName]);

  const fetchRecords = async () => {
    try {
      console.log('🔄 Fetching records...');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_ENDPOINT || 'http://localhost:5106';
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

  const handleAddRecord = async () => {
    try {
      console.log('Adding new record...');
      toast({
        title: 'Success',
        description: 'Record added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add record',
        variant: 'destructive',
      });
    }
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
        <Button onClick={handleAddRecord} className="px-8 py-6 text-lg">
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
    </div>
  );
} 