import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, FileUp, Users, Shield, Search, Key, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from 'react-router-dom';

// Mock data for records - will be replaced with API data later
const mockRecords = [
  {
    id: 1,
    name: 'John Doe with a very long name that should be truncated',
    city: 'New York City, New York, United States of America',
    job: 'Senior Software Engineer with extensive experience',
    version: '1.0.0',
  },
  {
    id: 2,
    name: 'Jane Smith',
    city: 'San Francisco',
    job: 'Product Manager',
    version: '1.0.0',
  },
];

// Mock data for subscribers
const mockSubscribers = [
  {
    username: 'john_doe',
    apiKey: 'sk_test_123456789',
    addedOn: '2024-01-15',
    lastUsed: '2024-02-01',
  },
];

// Mock data for users with access
const mockUsers = [
  { email: 'user1@example.com', role: 'admin' },
  { email: 'user2@example.com', role: 'viewer' },
];

export function RecordsPage() {
  const { registryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isManageAccessModalOpen, setIsManageAccessModalOpen] = useState(false);
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isPrivateAccess, setIsPrivateAccess] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [recordForm, setRecordForm] = useState({
    name: '',
    description: '',
    details: '',
    metadata: '',
  });

  const handleRowClick = (recordId: number) => {
    navigate(`/registries/${registryId}/records/${recordId}`);
  };

  const handleAddRecord = async () => {
    try {
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'Record added successfully',
      });
      setIsAddRecordModalOpen(false);
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
      if (!selectedFiles?.length) {
        toast({
          title: 'Error',
          description: 'Please select files to upload',
          variant: 'destructive',
        });
        return;
      }
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'Files uploaded successfully',
      });
      setIsBulkUploadModalOpen(false);
      setSelectedFiles(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    }
  };

  const handleAddUser = async () => {
    try {
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'User added successfully',
      });
      setNewUserEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add user',
        variant: 'destructive',
      });
    }
  };

  const placeholderNamespaceId = 'your-namespace-id'; // e.g., from useParams()
  const placeholderNamespaceName = 'Namespace Name'; // e.g., fetched or from props
  const placeholderRegistryId = 'your-registry-id'; // e.g., from useParams()
  const placeholderRegistryName = 'Registry Name'; // e.g., fetched or from props
  const placeholderRecordName = 'Record Name'; // e.g., fetched or from props

  const { recordId } = useParams<{ recordId?: string }>();
  const isViewingSpecificRecord = !!recordId;

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/namespaces/${placeholderNamespaceId}`}>{placeholderNamespaceName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {isViewingSpecificRecord ? (
              <BreadcrumbLink asChild>
                <Link to={`/namespaces/${placeholderNamespaceId}/registries/${placeholderRegistryId}/records`}>{placeholderRegistryName}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{placeholderRegistryName}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {isViewingSpecificRecord && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{placeholderRecordName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Records</h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your records in this registry
        </p>
      </div>

      <div className="flex justify-between mb-8">
        <div className="flex flex-col gap-4">
          <Button className="px-8 py-6 text-lg" onClick={() => setIsAddRecordModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Add Record
          </Button>
          <Button variant="outline" className="px-8 py-6 text-lg" onClick={() => setIsBulkUploadModalOpen(true)}>
            <Upload className="mr-2 h-5 w-5" />
            Bulk Upload
          </Button>
          <Button variant="outline" className="px-8 py-6 text-lg">
            <FileUp className="mr-2 h-5 w-5" />
            Import File
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="px-8 py-6 text-lg" onClick={() => setIsManageAccessModalOpen(true)}>
            <Shield className="mr-2 h-5 w-5" />
            Manage Access
          </Button>
          <Button variant="outline" className="px-8 py-6 text-lg" onClick={() => setIsSubscribersModalOpen(true)}>
            <Users className="mr-2 h-5 w-5" />
            Subscribers
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Sr. No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecords.map((record, index) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(record.id)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{record.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{record.city}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{record.job}</TableCell>
                  <TableCell>{record.version}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Add Record Modal */}
      <Dialog open={isAddRecordModalOpen} onOpenChange={setIsAddRecordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={recordForm.name}
                onChange={(e) => setRecordForm({ ...recordForm, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={recordForm.description}
                onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                value={recordForm.details}
                onChange={(e) => setRecordForm({ ...recordForm, details: e.target.value })}
                placeholder="Enter details"
              />
            </div>
            <div className="space-y-2">
              <Label>Metadata</Label>
              <Textarea
                value={recordForm.metadata}
                onChange={(e) => setRecordForm({ ...recordForm, metadata: e.target.value })}
                placeholder="Enter metadata"
              />
            </div>
            <Button className="w-full" onClick={handleAddRecord}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Files</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="cursor-pointer"
              />
            </div>
            <Button className="w-full" onClick={handleBulkUpload}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Access Modal */}
      <Dialog open={isManageAccessModalOpen} onOpenChange={setIsManageAccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Button
                variant={!isPrivateAccess ? 'default' : 'outline'}
                onClick={() => setIsPrivateAccess(false)}
              >
                Public
              </Button>
              <Button
                variant={isPrivateAccess ? 'default' : 'outline'}
                onClick={() => setIsPrivateAccess(true)}
              >
                Private
              </Button>
            </div>
            {isPrivateAccess && (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add user"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                  <Button onClick={handleAddUser}>Add</Button>
                </div>
                <ScrollArea className="h-[200px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscribers Modal */}
      <Dialog open={isSubscribersModalOpen} onOpenChange={setIsSubscribersModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4 items-center">
              <div className="flex flex-grow items-center space-x-2 p-2 border rounded-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search subscribers" 
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow p-0 h-auto"
                />
              </div>
              <Button>
                <Key className="mr-2 h-4 w-4" />
                New Key
              </Button>
            </div>
            <div className="space-y-4">
              {mockSubscribers.map((subscriber) => (
                <Card key={subscriber.username}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-medium">{subscriber.username}</p>
                        <p className="text-sm text-muted-foreground">{subscriber.apiKey}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Added on: {subscriber.addedOn}</p>
                          <p>Last used: {subscriber.lastUsed}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}