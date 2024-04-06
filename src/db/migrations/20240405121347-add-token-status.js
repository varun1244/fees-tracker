'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('token_pair', 'active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('token_pair', 'active')
  }
};
