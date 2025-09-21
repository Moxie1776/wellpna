import { Title } from 'react-admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Dashboard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Dashboard</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Welcome to the dashboard!</p>
    </CardContent>
  </Card>
);