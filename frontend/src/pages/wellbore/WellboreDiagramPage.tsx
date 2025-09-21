import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateWellboreDiagram } from '@/services/wellboreDiagram';

const WellboreDiagramPage = () => {
  const wellData = { name: 'Sample Well' }; // Placeholder data
  const svgString = generateWellboreDiagram(wellData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellbore Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <div dangerouslySetInnerHTML={{ __html: svgString }} />
      </CardContent>
    </Card>
  );
};

export default WellboreDiagramPage;