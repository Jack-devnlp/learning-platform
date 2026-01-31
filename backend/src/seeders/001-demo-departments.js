const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('departments', [
      { id: 1, name: '技术部', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: '前端组', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: '后端组', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: '人事部', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: '财务部', parentId: null, createdAt: new Date(), updatedAt: new Date() }
    ], {});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        passwordHash: adminPassword,
        name: '管理员',
        departmentId: null,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'zhangsan',
        passwordHash: userPassword,
        name: '张三',
        departmentId: 2,
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        username: 'lisi',
        passwordHash: userPassword,
        name: '李四',
        departmentId: 3,
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('departments', null, {});
  }
};
