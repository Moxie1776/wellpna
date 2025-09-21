export function generateWellboreDiagram(data: any): string {
  // Placeholder for SVG generation logic
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="400" height="600" fill="#f0f0f0" />
      <text x="50" y="50" font-family="Roboto, sans-serif" font-size="20" fill="#012d6c">
        Wellbore Diagram
      </text>
      <text x="50" y="80" font-family="Open Sans, sans-serif" font-size="14" fill="#c51230">
        (Placeholder for well: ${data.name})
      </text>
    </svg>
  `;
  return svg;
}