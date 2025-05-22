import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for record details - will be replaced with API data later
const mockRecordDetails = {
  id: 1,
  name: 'John Doe',
  city: 'New York',
  job: 'Software Engineer',
  version: '1.0.0',
  additionalInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
};

export function RecordDetailsPage() {
  const { recordId } = useParams();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Entry</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <Button onClick={() => {}}>Update</Button>
        <Button variant="outline" onClick={() => {}}>Revoke</Button>
        <Button variant="outline" onClick={() => {}}>Archive</Button>
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
    </div>
  );
}