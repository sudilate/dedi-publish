import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, FileUp, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for records - will be replaced with API data later
const mockRecords = [
  {
    id: 1,
    name: 'John Doe',
    city: 'New York',
    job: 'Software Engineer',
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

export function RecordsPage() {
  const { registryId } = useParams();
  const navigate = useNavigate();

  const handleRowClick = (recordId: number) => {
    navigate(`/registries/${registryId}/records/${recordId}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Records</h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your records in this registry
        </p>
      </div>

      <div className="flex justify-between mb-8">
        <div className="flex gap-4">
          <Button onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <FileUp className="mr-2 h-4 w-4" />
            Import File
          </Button>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {}}>
            <Shield className="mr-2 h-4 w-4" />
            Manage Access
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <Users className="mr-2 h-4 w-4" />
            Subscribers
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
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
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.city}</TableCell>
                <TableCell>{record.job}</TableCell>
                <TableCell>{record.version}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}