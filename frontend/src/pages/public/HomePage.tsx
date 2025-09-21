import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const HomePage = () => (
  <Card>
    <CardHeader>
      <CardTitle>Public Home Page</CardTitle>
    </CardHeader>
    <CardContent>
      <p>This page is accessible to everyone.</p>
    </CardContent>
  </Card>
);

export default HomePage;