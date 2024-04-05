'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('txn_history', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      txn_id: {
        type: Sequelize.STRING
      },
      fees_eth: {
        type: Sequelize.FLOAT
      },
      fees_usdt: {
        type: Sequelize.FLOAT
      },
      timestamp: {
        type: Sequelize.TIME
      },
      details: {
        type: Sequelize.JSON
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('txn_history');
  }
};
