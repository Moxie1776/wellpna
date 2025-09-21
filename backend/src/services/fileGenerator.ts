import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

export async function generatePdf(data: any): Promise<Buffer> {
  const doc = new jsPDF();
  (doc as any).autoTable({
    head: [['Column 1', 'Column 2']],
    body: data.map((row: any) => [row.col1, row.col2]),
  });
  return Buffer.from(doc.output('arraybuffer'));
}

export async function generateExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  
  // Add columns
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
  }

  // Add rows
  worksheet.addRows(data);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}
