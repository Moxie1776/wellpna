import { prismaTest } from './setup';

describe('Location Model CRUD Operations', () => {
  describe('Create', () => {
    it('should create a location', async () => {
      const location = await prismaTest.location.create({
        data: {
          api: '1234567899',
          county: 'Test County',
          latitude: 40.7128,
          longitude: -74.006,
          sectionNo: '1',
          blockNo: 'A',
          survey: 'Test Survey',
          abstractNo: '123',
          distanceFromTown: '5 miles north',
        },
      });

      expect(location.api).toBe('1234567899');
      expect(location.county).toBe('Test County');
      expect(location.latitude).toBe(40.7128);
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.location.create({
        data: {
          api: '1234567800',
          county: 'Another County',
          latitude: 41.8781,
          longitude: -87.6298,
          distanceFromTown: '10 miles south',
        },
      });
    });

    it('should find location by API', async () => {
      const location = await prismaTest.location.findUnique({
        where: { api: '1234567800' },
      });

      expect(location?.county).toBe('Another County');
    });
  });

  describe('Update', () => {
    beforeEach(async () => {
      await prismaTest.location.create({
        data: {
          api: '1234567801',
          county: 'Update County',
        },
      });
    });

    it('should update location', async () => {
      const updatedLocation = await prismaTest.location.update({
        where: { api: '1234567801' },
        data: { county: 'Updated County' },
      });

      expect(updatedLocation.county).toBe('Updated County');
    });
  });

  describe('Delete', () => {
    beforeEach(async () => {
      await prismaTest.location.create({
        data: {
          api: '1234567802',
          county: 'Delete County',
        },
      });
    });

    it('should delete location', async () => {
      await prismaTest.location.delete({
        where: { api: '1234567802' },
      });

      const deletedLocation = await prismaTest.location.findUnique({
        where: { api: '1234567802' },
      });

      expect(deletedLocation).toBeNull();
    });
  });
});

describe('Operator Model CRUD Operations', () => {
  describe('Create', () => {
    it('should create an operator', async () => {
      const operator = await prismaTest.operator.create({
        data: {
          operatorNo: 'OP002',
          name: 'Another Test Operator',
          rrcOperatorNo: 'RRC002',
        },
      });

      expect(operator.operatorNo).toBe('OP002');
      expect(operator.name).toBe('Another Test Operator');
    });

    it('should create operator with contacts', async () => {
      const operator = await prismaTest.operator.create({
        data: {
          operatorNo: 'OP003',
          name: 'Operator with Contacts',
          rrcOperatorNo: 'RRC003',
          operatorContact: {
            create: {
              name: 'John Doe',
              phoneNumber: '123-456-7890',
              email: 'john@example.com',
            },
          },
        },
        include: {
          operatorContact: true,
        },
      });

      expect(operator.operatorContact.length).toBe(1);
      expect(operator.operatorContact[0].name).toBe('John Doe');
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.operator.create({
        data: {
          operatorNo: 'OP004',
          name: 'Read Test Operator',
          rrcOperatorNo: 'RRC004',
        },
      });
    });

    it('should find operator by operatorNo', async () => {
      const operator = await prismaTest.operator.findUnique({
        where: { operatorNo: 'OP004' },
      });

      expect(operator?.name).toBe('Read Test Operator');
    });
  });

  describe('Update', () => {
    beforeEach(async () => {
      await prismaTest.operator.create({
        data: {
          operatorNo: 'OP005',
          name: 'Update Test Operator',
          rrcOperatorNo: 'RRC005',
        },
      });
    });

    it('should update operator', async () => {
      const updatedOperator = await prismaTest.operator.update({
        where: { operatorNo: 'OP005' },
        data: { name: 'Updated Operator Name' },
      });

      expect(updatedOperator.name).toBe('Updated Operator Name');
    });
  });

  describe('Delete', () => {
    beforeEach(async () => {
      await prismaTest.operator.create({
        data: {
          operatorNo: 'OP006',
          name: 'Delete Test Operator',
          rrcOperatorNo: 'RRC006',
        },
      });
    });

    it('should delete operator', async () => {
      await prismaTest.operator.delete({
        where: { operatorNo: 'OP006' },
      });

      const deletedOperator = await prismaTest.operator.findUnique({
        where: { operatorNo: 'OP006' },
      });

      expect(deletedOperator).toBeNull();
    });
  });
});
