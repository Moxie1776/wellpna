import PDFParser from 'pdf2json';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import { prisma } from '../prismaClient';

export async function minePdf(filePath: string): Promise<any> {
  try {
    const pdfParser = new PDFParser();
    
    // Convert the promise-based approach
    const pdfData = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        resolve(pdfData);
      });
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        if (errData && typeof errData === 'object' && 'parserError' in errData) {
          reject(new Error((errData as { parserError: Error }).parserError.message));
        } else {
          reject(new Error('Unknown error occurred while parsing PDF'));
        }
      });
      
      pdfParser.loadPDF(filePath);
    });
    
    // Extract text from PDF data
    const text = extractTextFromPdfData(pdfData);
    
    // Extract structured data from PDF text
    const extractedData = extractDataFromPdfText(text);
    
    // Save extracted data to database using prisma
    const savedData = await saveDataToDatabase(extractedData);
    
    return savedData;
  } catch (error) {
    console.error('Error mining PDF:', error);
    throw new Error('Failed to mine PDF');
  }
}

export async function mineExcel(filePath: string): Promise<any> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    // Extract structured data from Excel
    const extractedData = extractDataFromExcel(workbook);
    
    // Save extracted data to database using prisma
    const savedData = await saveDataToDatabase(extractedData);
    
    return savedData;
  } catch (error) {
    console.error('Error mining Excel:', error);
    throw new Error('Failed to mine Excel: ' + (error as Error).message);
  }
}

function extractDataFromExcel(workbook: ExcelJS.Workbook): any {
  // Initialize data object
  const data: any = {
    wellInfo: {},
    location: {},
    casings: [],
    perforations: [],
    plugSchedules: []
  };
  
  // Get the first worksheet
  const worksheet = workbook.getWorksheet(1);
  
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file');
  }
  
  // Get headers from the first row
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers.push(cell.value as string);
  });
  
  // Process each row
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value;
      });
      
      // Extract API Number
      if (rowData['API No'] || rowData['API']) {
        data.wellInfo.api = rowData['API No'] || rowData['API'];
      }
      
      // Extract Well Number
      if (rowData['Well No'] || rowData['Well']) {
        data.wellInfo.wellNo = rowData['Well No'] || rowData['Well'];
      }
      
      // Extract District Number
      if (rowData['District No'] || rowData['District']) {
        data.wellInfo.districtNo = rowData['District No'] || rowData['District'];
      }
      
      // Extract Drilling Permit Number
      if (rowData['Drilling Permit No'] || rowData['Permit No']) {
        data.wellInfo.drillingPermitNo = rowData['Drilling Permit No'] || rowData['Permit No'];
      }
      
      // Extract Field Name
      if (rowData['Field Name'] || rowData['Field']) {
        data.wellInfo.field = rowData['Field Name'] || rowData['Field'];
      }
      
      // Extract Lease Name
      if (rowData['Lease Name'] || rowData['Lease']) {
        data.wellInfo.lease = rowData['Lease Name'] || rowData['Lease'];
      }
      
      // Extract Type of Completion
      if (rowData['Type of completion'] || rowData['Completion Type']) {
        data.wellInfo.completionType = rowData['Type of completion'] || rowData['Completion Type'];
      }
      
      // Extract Total Depth
      if (rowData['Total depth'] || rowData['Total Depth']) {
        data.wellInfo.totalDepth = parseInt(rowData['Total depth'] || rowData['Total Depth'], 10);
      }
      
      // Extract Type of Well
      if (rowData['Type of well'] || rowData['Well Type']) {
        data.wellInfo.wellType = rowData['Type of well'] || rowData['Well Type'];
      }
      
      // Extract County
      if (rowData['County of Well Site'] || rowData['County']) {
        data.location.county = rowData['County of Well Site'] || rowData['County'];
      }
      
      // Extract Section No
      if (rowData['Section No'] || rowData['Section']) {
        data.location.sectionNo = rowData['Section No'] || rowData['Section'];
      }
      
      // Extract Block No
      if (rowData['Block No'] || rowData['Block']) {
        data.location.blockNo = rowData['Block No'] || rowData['Block'];
      }
      
      // Extract Survey
      if (rowData['Survey'] || rowData['Survey and Survey NoAbstract No']) {
        data.location.survey = rowData['Survey'] || rowData['Survey and Survey NoAbstract No'];
      }
      
      // Extract Distance from town
      if (rowData['Distance from town'] || rowData['Distance']) {
        data.location.distanceFromTown = rowData['Distance from town'] || rowData['Distance'];
      }
      
      // Extract Casing record
      if (rowData['Casing Size'] && rowData['Casing Diameter'] && rowData['Depth']) {
        data.casings.push({
          size: rowData['Casing Size'],
          diameter: rowData['Casing Diameter'],
          depth: parseInt(rowData['Depth'], 10),
          cement: rowData['Cement'] ? parseInt(rowData['Cement'], 10) : 0
        });
      }
      
      // Extract Perforation record
      if (rowData['Perf Top'] && rowData['Perf Bottom']) {
        data.perforations.push({
          stage: data.perforations.length + 1,
          topDepth: parseInt(rowData['Perf Top'], 10),
          bottomDepth: parseInt(rowData['Perf Bottom'], 10)
        });
      }
      
      // Extract Plug Schedule record
      if (rowData['Plug Top'] && rowData['Plug Bottom'] && rowData['Plug Type']) {
        data.plugSchedules.push({
          topDepth: parseInt(rowData['Plug Top'], 10),
          bottomDepth: parseInt(rowData['Plug Bottom'], 10),
          type: rowData['Plug Type']
        });
      }
    }
  });
  
  return data;
}

function extractTextFromPdfData(pdfData: any): string {
  // Extract text from pdf2json data structure
  let text = '';
  
  if (pdfData && pdfData.Pages) {
    for (const page of pdfData.Pages) {
      if (page.Texts) {
        for (const textItem of page.Texts) {
          // Decode the text (pdf2json encodes text in hex)
          text += decodeURIComponent(textItem.R[0].T);
        }
      }
    }
  }
  
  return text;
}

function extractDataFromPdfText(text: string): any {
  // Initialize data object
  const data: any = {
    wellInfo: {},
    location: {},
    casings: [],
    perforations: [],
    plugSchedules: []
  };
  
  // Extract API Number (line with "API No." followed by a number)
  const apiMatch = text.match(/API No\.\s*\n\s*([0-9]+)/);
  if (apiMatch) {
    data.wellInfo.api = apiMatch[1];
  }
  
  // Extract Well Number (line with "Well No." followed by text)
  const wellNoMatch = text.match(/Well No\.\s*\n\s*(.+)/);
  if (wellNoMatch) {
    data.wellInfo.wellNo = wellNoMatch[1].trim();
  }
  
  // Extract Operator Name (lines after "Operator's Name and Address")
  const operatorMatch = text.match(/Operator's Name and Address.*?\n\s*(.+?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (operatorMatch) {
    data.operatorName = operatorMatch[1].trim();
  }
  
  // Extract District Number
  const districtMatch = text.match(/District No\s*\.\s*\n\s*([0-9]+)/);
  if (districtMatch) {
    data.wellInfo.districtNo = districtMatch[1];
  }
  
  // Extract Drilling Permit Number
  const permitMatch = text.match(/Drilling Permit No\.\s*\n\s*([0-9]+)/);
  if (permitMatch) {
    data.wellInfo.drillingPermitNo = permitMatch[1];
  }
  
  // Extract Field Name
  const fieldMatch = text.match(/Field Name.*?\n\s*(.+?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (fieldMatch) {
    data.wellInfo.field = fieldMatch[1].trim();
  }
  
  // Extract Lease Name
  const leaseMatch = text.match(/Lease Name.*?\n\s*(.+?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (leaseMatch) {
    data.wellInfo.lease = leaseMatch[1].trim();
  }
  
  // Extract Type of Completion
  const completionMatch = text.match(/Type of completion\s*\n\s*(.+?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (completionMatch) {
    data.wellInfo.completionType = completionMatch[1].trim();
  }
  
  // Extract Total Depth
  const depthMatch = text.match(/Total depth\s*\n\s*([0-9]+)/);
  if (depthMatch) {
    data.wellInfo.totalDepth = parseInt(depthMatch[1], 10);
  }
  
  // Extract Type of Well
  const wellTypeMatch = text.match(/Type of well\s*\n\s*(.+?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (wellTypeMatch) {
    data.wellInfo.wellType = wellTypeMatch[1].trim();
  }
  
  // Extract County
  const countyMatch = text.match(/County of Well Site\s*\n\s*(.+?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (countyMatch) {
    data.location.county = countyMatch[1].trim();
  }
  
  // Extract Location details
  const locationMatch = text.match(/Location\s*\n\s*Section No\.\s*\n\s*(.+?)(?=\n\s*[A-Z])/s);
  if (locationMatch) {
    const locationText = locationMatch[1];
    // Extract Section No
    const sectionMatch = locationText.match(/Section No\.\s*\n\s*(.+?)(?=\n|$)/);
    if (sectionMatch) {
      data.location.sectionNo = sectionMatch[1].trim();
    }
    
    // Extract Block No
    const blockMatch = locationText.match(/Block No\s*\n\s*(.+?)(?=\n|$)/);
    if (blockMatch) {
      data.location.blockNo = blockMatch[1].trim();
    }
    
    // Extract Survey
    const surveyMatch = locationText.match(/Survey and Survey NoAbstract No\.\s*A-\s*\n\s*(.+?)(?=\n|$)/);
    if (surveyMatch) {
      data.location.survey = surveyMatch[1].trim();
    }
    
    // Extract Distance from town
    const distanceMatch = locationText.match(/Distance.*?town.*?\n\s*(.+?)(?=\n|$)/i);
    if (distanceMatch) {
      data.location.distanceFromTown = distanceMatch[1].trim();
    }
  }
  
  // Extract Casing record
  const casingMatch = text.match(/Casing record.*?WARNING:.*?by reviewing the online version\.(.*?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (casingMatch) {
    const casingText = casingMatch[1];
    // Extract individual casing records
    const casingRecords = casingText.match(/([0-9\/]+).*?([0-9\/]+).*?([0-9]+).*?([0-9]+)/g);
    if (casingRecords) {
      casingRecords.forEach(record => {
        const parts = record.split(/\s+/);
        if (parts.length >= 4) {
          data.casings.push({
            size: parts[0],
            diameter: parts[1],
            depth: parseInt(parts[2], 10),
            cement: parseInt(parts[3], 10)
          });
        }
      });
    }
  }
  
  // Extract Perforated intervals
  const perforationMatch = text.match(/Record of perforated intervals.*?WARNING:.*?by reviewing the online version\.(.*?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (perforationMatch) {
    const perforationText = perforationMatch[1];
    // Extract individual perforation records
    const perforationRecords = perforationText.match(/([0-9]+)\s+([0-9]+)/g);
    if (perforationRecords) {
      let stage = 1;
      perforationRecords.forEach(record => {
        const parts = record.split(/\s+/);
        if (parts.length >= 2) {
          data.perforations.push({
            stage: stage++,
            topDepth: parseInt(parts[0], 10),
            bottomDepth: parseInt(parts[1], 10)
          });
        }
      });
    }
  }
  
  // Extract Plugging proposal
  const plugMatch = text.match(/Plugging proposal.*?WARNING:.*?by reviewing the online version\.(.*?)(?=\n\s*\d+\.|\n\s*[A-Z])/s);
  if (plugMatch) {
    const plugText = plugMatch[1];
    // Extract individual plug records
    const plugRecords = plugText.match(/([0-9]+)\s+([0-9]+)\s+(.+?)(?=\n|$)/g);
    if (plugRecords) {
      plugRecords.forEach(record => {
        const parts = record.split(/\s+/);
        if (parts.length >= 3) {
          data.plugSchedules.push({
            topDepth: parseInt(parts[0], 10),
            bottomDepth: parseInt(parts[1], 10),
            type: parts.slice(2).join(' ')
          });
        }
      });
    }
  }
  
  return data;
}

async function saveDataToDatabase(data: any): Promise<any> {
  try {
    // Create or update Well
    let well;
    if (data.wellInfo.api) {
      well = await prisma.well.upsert({
        where: { api: data.wellInfo.api },
        update: {},
        create: { api: data.wellInfo.api }
      });
      
      // Create or update WellInfo
      if (Object.keys(data.wellInfo).length > 1) { // More than just API
        await prisma.wellInfo.upsert({
          where: { api: data.wellInfo.api },
          update: {
            districtNo: data.wellInfo.districtNo,
            drillingPermitNo: data.wellInfo.drillingPermitNo,
            wellNo: data.wellInfo.wellNo,
            field: data.wellInfo.field,
            lease: data.wellInfo.lease,
            completionType: data.wellInfo.completionType,
            totalDepth: data.wellInfo.totalDepth,
            wellType: data.wellInfo.wellType
          },
          create: {
            api: data.wellInfo.api,
            districtNo: data.wellInfo.districtNo,
            drillingPermitNo: data.wellInfo.drillingPermitNo,
            wellNo: data.wellInfo.wellNo,
            field: data.wellInfo.field,
            lease: data.wellInfo.lease,
            completionType: data.wellInfo.completionType,
            totalDepth: data.wellInfo.totalDepth,
            wellType: data.wellInfo.wellType
          }
        });
      }
      
      // Create or update Location
      if (Object.keys(data.location).length > 0) {
        await prisma.location.upsert({
          where: { api: data.wellInfo.api },
          update: {
            county: data.location.county,
            sectionNo: data.location.sectionNo,
            blockNo: data.location.blockNo,
            survey: data.location.survey,
            distanceFromTown: data.location.distanceFromTown
          },
          create: {
            api: data.wellInfo.api,
            county: data.location.county,
            sectionNo: data.location.sectionNo,
            blockNo: data.location.blockNo,
            survey: data.location.survey,
            distanceFromTown: data.location.distanceFromTown
          }
        });
      }
      
      // Create Casing records
      for (const casing of data.casings) {
        // First, create or get CasingEnum
        const casingDiameter = parseFloat(casing.diameter);
        const casingSize = parseFloat(casing.size);
        
        // Find existing CasingEnum with matching diameters
        let casingEnum = await prisma.casingEnum.findFirst({
          where: { 
            internalDiameter: casingDiameter,
            externalDiameter: casingSize
          }
        });
        
        // If not found, create a new one
        if (!casingEnum) {
          casingEnum = await prisma.casingEnum.create({
            data: { 
              internalDiameter: casingDiameter, 
              externalDiameter: casingSize,
              tocDepth: 0 // Default value, adjust as needed
            }
          });
        }
        
        // Then create Casing
        await prisma.casing.create({
          data: {
            api: data.wellInfo.api,
            casingEnumId: casingEnum.id,
            topDepth: casing.depth,
            bottomDepth: casing.depth, // Assuming same for simplicity
            joints: 0, // Default value
            centralizer: false // Default value
          }
        });
      }
      
      // Create Perforation records
      for (const perforation of data.perforations) {
        await prisma.perforation.create({
          data: {
            api: data.wellInfo.api,
            stage: perforation.stage,
            topDepth: perforation.topDepth,
            bottomDepth: perforation.bottomDepth
          }
        });
      }
      
      // Create PlugSchedule records
      for (const plugSchedule of data.plugSchedules) {
        // First, create or get MechanicalIsolationEnum
        let mechIsoEnum = await prisma.mechanicalIsolationEnum.findFirst({
          where: { type: plugSchedule.type }
        });
        
        // If not found, create a new one
        if (!mechIsoEnum) {
          mechIsoEnum = await prisma.mechanicalIsolationEnum.create({
            data: { type: plugSchedule.type }
          });
        }
        
        // Then create PlugSchedule
        await prisma.plugSchedule.create({
          data: {
            api: data.wellInfo.api,
            mechanicalIsolationEnumId: mechIsoEnum.id,
            summary: plugSchedule.type,
            topDepth: plugSchedule.topDepth,
            bottomDepth: plugSchedule.bottomDepth,
            description: plugSchedule.type
          }
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error saving data to database:', error);
    throw new Error('Failed to save data to database: ' + (error as Error).message);
  }
}
