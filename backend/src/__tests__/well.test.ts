import { prismaTest } from './setup';

describe('Well Model CRUD Operations', () => {
  describe('Create', () => {
    it('should create a new well', async () => {
      const well = await prismaTest.well.create({
        data: {
          api: '1234567890',
        },
      });

      expect(well.api).toBe('1234567890');
      expect(well.id).toBeDefined();
    });

    it('should create a well with related data', async () => {
      // Create operator first
      const operator = await prismaTest.operator.create({
        data: {
          operatorNo: 'OP001',
          name: 'Test Operator',
          rrcOperatorNo: 'RRC001',
        },
      });

      const well = await prismaTest.well.create({
        data: {
          api: '1234567891',
          operatorId: operator.id,
        },
        include: {
          operator: true,
        },
      });

      expect(well.api).toBe('1234567891');
      expect(well.operator?.name).toBe('Test Operator');
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.well.create({
        data: { api: '1234567892' },
      });
    });

    it('should find a well by API', async () => {
      const well = await prismaTest.well.findUnique({
        where: { api: '1234567892' },
      });

      expect(well?.api).toBe('1234567892');
    });

    it('should find all wells', async () => {
      const wells = await prismaTest.well.findMany();
      expect(wells.length).toBeGreaterThan(0);
    });
  });

  describe('Update', () => {
    let wellId: string;

    beforeEach(async () => {
      const well = await prismaTest.well.create({
        data: { api: '1234567893' },
      });
      wellId = well.api;
    });

    it('should update a well', async () => {
      const updatedWell = await prismaTest.well.update({
        where: { api: wellId },
        data: { geologyId: 'geo123' },
      });

      expect(updatedWell.geologyId).toBe('geo123');
    });
  });

  describe('Delete', () => {
    let wellId: string;

    beforeEach(async () => {
      const well = await prismaTest.well.create({
        data: { api: '1234567894' },
      });
      wellId = well.api;
    });

    it('should delete a well', async () => {
      await prismaTest.well.delete({
        where: { api: wellId },
      });

      const deletedWell = await prismaTest.well.findUnique({
        where: { api: wellId },
      });

      expect(deletedWell).toBeNull();
    });
  });
});

describe('WellInfo Model CRUD Operations', () => {
  describe('Create', () => {
    it('should create well info', async () => {
      const wellInfo = await prismaTest.wellInfo.create({
        data: {
          api: '1234567895',
          districtNo: '01',
          drillingPermitNo: 'DP001',
          wellNo: 'W001',
          field: 'Test Field',
          lease: 'Test Lease',
          completionType: 'Oil Well',
          totalDepth: 5000,
          wellType: 'Vertical',
        },
      });

      expect(wellInfo.api).toBe('1234567895');
      expect(wellInfo.totalDepth).toBe(5000);
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.wellInfo.create({
        data: {
          api: '1234567896',
          districtNo: '01',
          drillingPermitNo: 'DP002',
          wellNo: 'W002',
          field: 'Test Field 2',
          lease: 'Test Lease 2',
          completionType: 'Gas Well',
          totalDepth: 6000,
          wellType: 'Horizontal',
        },
      });
    });

    it('should find well info by API', async () => {
      const wellInfo = await prismaTest.wellInfo.findUnique({
        where: { api: '1234567896' },
      });

      expect(wellInfo?.field).toBe('Test Field 2');
    });
  });

  describe('Update', () => {
    beforeEach(async () => {
      await prismaTest.wellInfo.create({
        data: {
          api: '1234567897',
          districtNo: '01',
          drillingPermitNo: 'DP003',
          wellNo: 'W003',
          field: 'Test Field 3',
          lease: 'Test Lease 3',
          completionType: 'Oil Well',
          totalDepth: 7000,
          wellType: 'Vertical',
        },
      });
    });

    it('should update well info', async () => {
      const updatedWellInfo = await prismaTest.wellInfo.update({
        where: { api: '1234567897' },
        data: { totalDepth: 8000 },
      });

      expect(updatedWellInfo.totalDepth).toBe(8000);
    });
  });

  describe('Delete', () => {
    beforeEach(async () => {
      await prismaTest.wellInfo.create({
        data: {
          api: '1234567898',
          districtNo: '01',
          drillingPermitNo: 'DP004',
          wellNo: 'W004',
          field: 'Test Field 4',
          lease: 'Test Lease 4',
          completionType: 'Water Well',
          totalDepth: 3000,
          wellType: 'Vertical',
        },
      });
    });

    it('should delete well info', async () => {
      await prismaTest.wellInfo.delete({
        where: { api: '1234567898' },
      });

      const deletedWellInfo = await prismaTest.wellInfo.findUnique({
        where: { api: '1234567898' },
      });

      expect(deletedWellInfo).toBeNull();
    });
  });
});