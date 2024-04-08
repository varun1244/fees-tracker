'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('txn_history', 'txn_id')

    await queryInterface.addColumn('txn_history', 'txn_id', {
      type: Sequelize.TEXT,
      allowNull: false,
    })

    await queryInterface.changeColumn('txn_history', 'timestamp', {
      type: 'TIMESTAMPTZ',
      allowNull: false,
    })

    await queryInterface.addIndex('txn_history', ['timestamp', 'txn_id'], {
      unique: true,
      name: 'unique_timestamp_txn_id'
    });
    return queryInterface.sequelize.query("SELECT create_hypertable('txn_history', 'timestamp')")
  },

  async down(queryInterface, Sequelize) {
    // No op
  }
};
