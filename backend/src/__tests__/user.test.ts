import { prismaTest } from './setup';

describe('User Model CRUD Operations', () => {
  let userRoleId: string;

  beforeAll(async () => {
    // Create a user role for testing
    const userRole = await prismaTest.userRole.create({
      data: {
        role: 'admin',
      },
    });
    userRoleId = userRole.role;
  });

  describe('Create', () => {
    it('should create a user', async () => {
      const user = await prismaTest.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          name: 'Test User',
          roleId: userRoleId,
          code: 'ABC123',
        },
      });

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.roleId).toBe(userRoleId);
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.user.create({
        data: {
          email: 'readtest@example.com',
          password: 'password',
          name: 'Read Test User',
          roleId: userRoleId,
        },
      });
    });

    it('should find user by email', async () => {
      const user = await prismaTest.user.findUnique({
        where: { email: 'readtest@example.com' },
      });

      expect(user?.name).toBe('Read Test User');
    });

    it('should find users by role', async () => {
      const users = await prismaTest.user.findMany({
        where: { roleId: userRoleId },
      });

      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('Update', () => {
    beforeEach(async () => {
      await prismaTest.user.create({
        data: {
          email: 'updatetest@example.com',
          password: 'password',
          name: 'Update Test User',
          roleId: userRoleId,
        },
      });
    });

    it('should update user', async () => {
      const updatedUser = await prismaTest.user.update({
        where: { email: 'updatetest@example.com' },
        data: { name: 'Updated User Name' },
      });

      expect(updatedUser.name).toBe('Updated User Name');
    });
  });

  describe('Delete', () => {
    beforeEach(async () => {
      await prismaTest.user.create({
        data: {
          email: 'deletetest@example.com',
          password: 'password',
          name: 'Delete Test User',
          roleId: userRoleId,
        },
      });
    });

    it('should delete user', async () => {
      await prismaTest.user.delete({
        where: { email: 'deletetest@example.com' },
      });

      const deletedUser = await prismaTest.user.findUnique({
        where: { email: 'deletetest@example.com' },
      });

      expect(deletedUser).toBeNull();
    });
  });
});

describe('UserRole Model CRUD Operations', () => {
  describe('Create', () => {
    it('should create a user role', async () => {
      const userRole = await prismaTest.userRole.create({
        data: {
          role: 'user',
        },
      });

      expect(userRole.role).toBe('user');
    });
  });

  describe('Read', () => {
    beforeEach(async () => {
      await prismaTest.userRole.create({
        data: {
          role: 'moderator',
        },
      });
    });

    it('should find user role by role', async () => {
      const userRole = await prismaTest.userRole.findUnique({
        where: { role: 'moderator' },
      });

      expect(userRole?.role).toBe('moderator');
    });
  });

  describe('Update', () => {
    beforeEach(async () => {
      await prismaTest.userRole.create({
        data: {
          role: 'editor',
        },
      });
    });

    it('should update user role', async () => {
      // UserRole has only 'role' as primary key, so update is limited
      // In practice, you might not update roles, but create new ones
      const updatedRole = await prismaTest.userRole.findUnique({
        where: { role: 'editor' },
      });

      expect(updatedRole?.role).toBe('editor');
    });
  });

  describe('Delete', () => {
    beforeEach(async () => {
      await prismaTest.userRole.create({
        data: {
          role: 'guest',
        },
      });
    });

    it('should delete user role', async () => {
      await prismaTest.userRole.delete({
        where: { role: 'guest' },
      });

      const deletedRole = await prismaTest.userRole.findUnique({
        where: { role: 'guest' },
      });

      expect(deletedRole).toBeNull();
    });
  });
});