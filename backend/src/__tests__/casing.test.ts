import { prismaTest } from './setup';

describe('Casing Model CRUD Operations', () => {
  let casingEnumId: string;
  let wellApi: string;

  beforeAll(async () => {
    // Create a casing enum for testing
    const casingEnum = await prismaTest.casingEnum.create({
      data: {
        internalDiameter: 5.5,
        externalDiameter: 6.0,
        tocDepth: 1000,
        weight: 20.0,
        grade: 'J55',
      },
    });
    casingEnumId = casingEnum.id;

    // Create a well for testing
    const well = await prismaTest.well.create({
      data: { api: '1234567803' },
    });
    wellApi = well.api;
  });

  describe('Create', () => {
    it('should create casing', async () => {
      const casing = await prismaTest.casing.create({
        data: {
          api: wellApi,
          casingEnumId: casingEnumId,
          topDepth: 0,
          bottomDepth: 1000,
          joints: 10,
          centralizer: true,
          shortJtTop: false,
        },
      });

      expect(casing.api).toBe(wellApi);
      expect(casing.topDepth).toBe(0);
      expect(casing.bottomDepth).toBe(1000);
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.casing.create({
        data: {
          api: wellApi,
          casingEnumId: casingEnumId,
          topDepth: 1000,
          bottomDepth: 2000,
        },
      });
    });

    it('should find casings by well API', async () => {
      const casings = await prismaTest.casing.findMany({
        where: { api: wellApi },
      });

      expect(casings.length).toBeGreaterThan(0);
      expect(casings[0].topDepth).toBe(1000);
    });
  });

  describe('Update', () => {
    let casingId: string;

    beforeEach(async () => {
      const casing = await prismaTest.casing.create({
        data: {
          api: wellApi,
          casingEnumId: casingEnumId,
          topDepth: 2000,
          bottomDepth: 3000,
        },
      });
      casingId = casing.id;
    });

    it('should update casing', async () => {
      const updatedCasing = await prismaTest.casing.update({
        where: { id: casingId },
        data: { joints: 15 },
      });

      expect(updatedCasing.joints).toBe(15);
    });
  });

  describe('Delete', () => {
    let casingId: string;

    beforeEach(async () => {
      const casing = await prismaTest.casing.create({
        data: {
          api: wellApi,
          casingEnumId: casingEnumId,
          topDepth: 3000,
          bottomDepth: 4000,
        },
      });
      casingId = casing.id;
    });

    it('should delete casing', async () => {
      await prismaTest.casing.delete({
        where: { id: casingId },
      });

      const deletedCasing = await prismaTest.casing.findUnique({
        where: { id: casingId },
      });

      expect(deletedCasing).toBeNull();
    });
  });
});

describe('Perforation Model CRUD Operations', () => {
  let wellApi: string;

  beforeAll(async () => {
    // Create a well for testing
    const well = await prismaTest.well.create({
      data: { api: '1234567804' },
    });
    wellApi = well.api;
  });

  describe('Create', () => {
    it('should create perforation', async () => {
      const perforation = await prismaTest.perforation.create({
        data: {
          api: wellApi,
          stage: 1,
          formation: 'Sandstone',
          topDepth: 5000,
          bottomDepth: 5020,
          datePerforated: new Date('2023-01-01'),
          notes: 'Test perforation',
        },
      });

      expect(perforation.api).toBe(wellApi);
      expect(perforation.stage).toBe(1);
      expect(perforation.topDepth).toBe(5000);
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.perforation.create({
        data: {
          api: wellApi,
          stage: 2,
          topDepth: 5100,
          bottomDepth: 5120,
        },
      });
    });

    it('should find perforations by well API', async () => {
      const perforations = await prismaTest.perforation.findMany({
        where: { api: wellApi },
      });

      expect(perforations.length).toBeGreaterThan(0);
      expect(perforations[0].stage).toBe(2);
    });
  });

  describe('Update', () => {
    let perforationId: string;

    beforeEach(async () => {
      const perforation = await prismaTest.perforation.create({
        data: {
          api: wellApi,
          stage: 3,
          topDepth: 5200,
          bottomDepth: 5220,
        },
      });
      perforationId = perforation.id;
    });

    it('should update perforation', async () => {
      const updatedPerforation = await prismaTest.perforation.update({
        where: { id: perforationId },
        data: { notes: 'Updated notes' },
      });

      expect(updatedPerforation.notes).toBe('Updated notes');
    });
  });

  describe('Delete', () => {
    let perforationId: string;

    beforeEach(async () => {
      const perforation = await prismaTest.perforation.create({
        data: {
          api: wellApi,
          stage: 4,
          topDepth: 5300,
          bottomDepth: 5320,
        },
      });
      perforationId = perforation.id;
    });

    it('should delete perforation', async () => {
      await prismaTest.perforation.delete({
        where: { id: perforationId },
      });

      const deletedPerforation = await prismaTest.perforation.findUnique({
        where: { id: perforationId },
      });

      expect(deletedPerforation).toBeNull();
    });
  });
});