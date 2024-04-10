'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert('token_pair', [{
        id: 1,
        name: 'ETH-USDC',
        contract_address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        start_block: 12376729
      }, {
        id: 2,
        name: 'XSGD-USDC',
        contract_address: '0x6279653c28f138c8b31b8a0f6f8cd2c58e8c1705',
        start_block: 12599036
      }])
    } catch (err) {
      // NO-OP
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('token_pair', null, {})
  }
}
