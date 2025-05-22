import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
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

// Mock data for record details - will be replaced with API data later
const mockRecordDetails = {
  id: 1,
  name: 'John Doe',
  city: 'New York',
  job: 'Software Engineer',
  version: '1.0.0',
  description: 'Senior Software Engineer',
  details: 'Experienced in full-stack development',
  metadata: '{"experience": "10 years"}',
  additionalInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
};

export function RecordDetailsPage() {
  const { recordId } = useParams();
  const { toast } = useToast();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
  const [isRevokeAlertOpen, setIsRevokeAlertOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: mockRecordDetails.name,
    description: mockRecordDetails.description,
    details: mockRecordDetails.details,
    metadata: mockRecordDetails.metadata,
  });

  const handleUpdate = async () => {
    try {
      // API call will be added here later
      toast({
        title: 'Success',
        description: 'Record updated successfully',
      });
      setIsUpdateModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update record',
        variant: 'destructive',
      });
    }
  };

  // Handler to open the archive alert
  const handleOpenArchiveAlert = () => {
    setIsArchiveAlertOpen(true);
  };

  // Handler for the archive action
  const handleArchiveRecord = async () => {
    try {
      // In a real app, you'd make an API call here
      console.log('Archiving record:', mockRecordDetails.id);
      toast({
        title: 'Success',
        description: `Record "${mockRecordDetails.name}" archived successfully.`,
      });
      setIsArchiveAlertOpen(false);
      // Optionally, navigate away or update UI to reflect archived state
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive record.',
        variant: 'destructive',
      });
    }
  };

  // Handler to open the revoke alert
  const handleOpenRevokeAlert = () => {
    setIsRevokeAlertOpen(true);
  };

  // Handler for the revoke action
  const handleRevokeRecord = async () => {
    try {
      // In a real app, you'd make an API call here
      console.log('Revoking record:', mockRecordDetails.id);
      toast({
        title: 'Success',
        description: `Record "${mockRecordDetails.name}" revoked successfully.`,
      });
      setIsRevokeAlertOpen(false);
      // Optionally, navigate away or update UI to reflect revoked state
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke record.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Entry</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <Button 
          className="px-8 py-6 text-lg" 
          onClick={() => setIsUpdateModalOpen(true)}
        >
          Update
        </Button>
        <Button 
          variant="outline" 
          className="px-8 py-6 text-lg text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleOpenRevokeAlert}
        >
          Revoke
        </Button>
        <Button 
          variant="outline" 
          className="px-8 py-6 text-lg text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleOpenArchiveAlert}
        >
          Archive
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">View</h2>
          <div className="space-y-4">
            {Object.entries(mockRecordDetails).map(([key, value]) => (
              key !== 'additionalInfo' && (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium capitalize">{key}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{value}</p>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{mockRecordDetails.additionalInfo}</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={updateForm.name}
                onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={updateForm.description}
                onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                value={updateForm.details}
                onChange={(e) => setUpdateForm({ ...updateForm, details: e.target.value })}
                placeholder="Enter details"
              />
            </div>
            <div className="space-y-2">
              <Label>Metadata</Label>
              <Textarea
                value={updateForm.metadata}
                onChange={(e) => setUpdateForm({ ...updateForm, metadata: e.target.value })}
                placeholder="Enter metadata"
              />
            </div>
            <Button className="w-full" onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will archive the record "{mockRecordDetails.name}". 
              You may be able to restore it later, but it will be hidden from normal view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsArchiveAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveRecord} className="bg-red-600 hover:bg-red-700">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to revoke this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will revoke the record "{mockRecordDetails.name}". 
              You may be able to reintstate it later, but it will be hidden from normal view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRevokeAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeRecord} className="bg-red-600 hover:bg-red-700">
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}