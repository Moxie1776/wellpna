import { minePdf, mineExcel } from '../services/dataMiner';
import PDFParser from 'pdf2json';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import { prisma } from '../prismaClient';

// Mock dependencies
jest.mock('pdf2json');
jest.mock('exceljs');
jest.mock('fs/promises');
jest.mock('../prismaClient');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPDFParser = PDFParser as jest.MockedClass<typeof PDFParser>;
const mockExcelJS = ExcelJS.Workbook as jest.MockedClass<typeof ExcelJS.Workbook>;

describe('DataMiner Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('minePdf', () => {
    it('should successfully mine PDF data', async () => {
      // Mock PDF parser
      const mockPdfData = {
        Pages: [
          {
            Texts: [
              { R: [{ T: 'API No.: 1234567890' }] },
              { R: [{ T: 'Well No.: Test Well' }] },
              { R: [{ T: 'District No.: 01' }] },
            ],
          },
        ],
      };

      const mockParserInstance = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'pdfParser_dataReady') {
            callback(mockPdfData);
          }
        }),
        loadPDF: jest.fn(),
      };

      mockPDFParser.mockImplementation(() => mockParserInstance as any);

      // Mock file read
      mockFs.readFile = jest.fn().mockResolvedValue(Buffer.from('pdf content'));

      // Mock database operations
      mockPrisma.well.upsert = jest.fn().mockResolvedValue({ api: '1234567890' });
      mockPrisma.wellInfo.upsert = jest.fn().mockResolvedValue({});
      mockPrisma.location.upsert = jest.fn().mockResolvedValue({});
      mockPrisma.casingEnum.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.casingEnum.create = jest.fn().mockResolvedValue({ id: 'casing-enum-id' });
      mockPrisma.casing.create = jest.fn().mockResolvedValue({});
      mockPrisma.perforation.create = jest.fn().mockResolvedValue({});
      mockPrisma.mechanicalIsolationEnum.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.mechanicalIsolationEnum.create = jest.fn().mockResolvedValue({ id: 'mech-iso-id' });
      mockPrisma.plugSchedule.create = jest.fn().mockResolvedValue({});

      const result = await minePdf('/path/to/test.pdf');

      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/test.pdf');
      expect(mockPrisma.well.upsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle PDF parsing errors', async () => {
      const mockParserInstance = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'pdfParser_dataError') {
            callback({ parserError: new Error('PDF parsing failed') });
          }
        }),
        loadPDF: jest.fn(),
      };

      mockPDFParser.mockImplementation(() => mockParserInstance as any);

      await expect(minePdf('/path/to/test.pdf')).rejects.toThrow('Failed to mine PDF');
    });

    it('should handle file read errors', async () => {
      mockFs.readFile = jest.fn().mockRejectedValue(new Error('File not found'));

      await expect(minePdf('/path/to/test.pdf')).rejects.toThrow('Failed to mine PDF');
    });
  });

  describe('mineExcel', () => {
    it('should successfully mine Excel data', async () => {
      // Mock Excel workbook
      const mockWorksheet = {
        getRow: jest.fn().mockReturnValue({
          eachCell: jest.fn().mockImplementation((callback) => {
            // Mock headers
            callback({ value: 'API No' }, 1);
            callback({ value: 'Well No' }, 2);
          }),
        }),
        eachRow: jest.fn().mockImplementation((callback) => {
          // Mock data row
          callback({
            eachCell: jest.fn().mockImplementation((callback) => {
              callback({ value: '1234567891' }, 1);
              callback({ value: 'Test Well 2' }, 2);
            }),
          }, 2);
        }),
      };

      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
        },
        getWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      };

      mockExcelJS.mockImplementation(() => mockWorkbook as any);

      // Mock database operations
      mockPrisma.well.upsert = jest.fn().mockResolvedValue({ api: '1234567891' });
      mockPrisma.wellInfo.upsert = jest.fn().mockResolvedValue({});
      mockPrisma.location.upsert = jest.fn().mockResolvedValue({});
      mockPrisma.casingEnum.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.casingEnum.create = jest.fn().mockResolvedValue({ id: 'casing-enum-id' });
      mockPrisma.casing.create = jest.fn().mockResolvedValue({});
      mockPrisma.perforation.create = jest.fn().mockResolvedValue({});
      mockPrisma.mechanicalIsolationEnum.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.mechanicalIsolationEnum.create = jest.fn().mockResolvedValue({ id: 'mech-iso-id' });
      mockPrisma.plugSchedule.create = jest.fn().mockResolvedValue({});

      const result = await mineExcel('/path/to/test.xlsx');

      expect(mockWorkbook.xlsx.readFile).toHaveBeenCalledWith('/path/to/test.xlsx');
      expect(mockPrisma.well.upsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle Excel file without worksheet', async () => {
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockResolvedValue(undefined),
        },
        getWorksheet: jest.fn().mockReturnValue(null),
      };

      mockExcelJS.mockImplementation(() => mockWorkbook as any);

      await expect(mineExcel('/path/to/test.xlsx')).rejects.toThrow('Failed to mine Excel');
    });

    it('should handle Excel read errors', async () => {
      const mockWorkbook = {
        xlsx: {
          readFile: jest.fn().mockRejectedValue(new Error('Excel read failed')),
        },
      };

      mockExcelJS.mockImplementation(() => mockWorkbook as any);

      await expect(mineExcel('/path/to/test.xlsx')).rejects.toThrow('Failed to mine Excel');
    });
  });
});