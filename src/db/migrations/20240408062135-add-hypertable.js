'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('txn_history', 'txn_id')

    await queryInterface.addColumn('txn_history', 'txn_id', {
      type: Sequelize.TEXT,
      allowNull: false
    })

    await queryInterface.addColumn('txn_history', 'block_number', {
      type: Sequelize.BIGINT,
      allowNull: false
    })

    await queryInterface.changeColumn('txn_history', 'timestamp', {
      type: 'TIMESTAMPTZ',
      allowNull: false
    })

    await queryInterface.addIndex('txn_history', ['timestamp', 'txn_id'], {
      unique: true,
      name: 'unique_timestamp_txn_id'
    })

    await queryInterface.addColumn('token_pair', 'start_block', {
      type: Sequelize.BIGINT,
      allowNull: false
    })

    return await queryInterface.sequelize.query("SELECT create_hypertable('txn_history', 'timestamp')")
  },

  async down (queryInterface, Sequelize) {
    // No op
  }
}
