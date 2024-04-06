'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the `id` column from the `txn_history` table
    // Added the id by mistake, need to remove this column
    await queryInterface.removeColumn('txn_history', 'id')

    await queryInterface.removeColumn('txn_history', 'timestamp')
    await queryInterface.addColumn('txn_history', 'timestamp', {
      type: Sequelize.DATE
    })

    // Make `txn_id` the primary key of the `txn_history` table
    await queryInterface.changeColumn('txn_history', 'txn_id', {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    })

    // Add a foreign key `pair_id` that references the `id` column in the `token_pair` table
    await queryInterface.addColumn('txn_history', 'token_pair_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'token_pair',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })

    // Add default value to `created_at`
    await queryInterface.changeColumn('txn_history', 'created_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    })

    // Add default value to `updated_at`
    await queryInterface.changeColumn('txn_history', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    })
  },

  async down(queryInterface, Sequelize) {
    // Remove the `pair_id` foreign key from the `txn_history` table
    await queryInterface.removeConstraint('txn_history', 'txn_history_pair_id_fkey')
    await queryInterface.removeColumn('txn_history', 'pair_id')

    // Remove the primary key constraint from the `txn_id` column in the `txn_history` table
    await queryInterface.removeConstraint('txn_history', 'txn_history_pkey')
    await queryInterface.changeColumn('txn_history', 'txn_id', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    })

    // Add the `id` column back to the `txn_history` table
    await queryInterface.addColumn('txn_history', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    })
  }
}
