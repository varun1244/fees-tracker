'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('txn_history', [{
      txn_id: '0xfb6059b8a759783217d35797d1e98a3496aae0e797e271f4d34116ae54cbf133',
      token_pair_id: 1,
      fees_eth: 0.004412730076932832,
      fees_usdt: 14.65,
      timestamp: new Date(1712255603),
      details: JSON.stringify({
        blockNumber: '19586590',
        from: '0x1111111254eeb25477b68fb85ed929f73a960582',
        value: '759985437513886825',
        gas: '522218',
        gasPrice: '13490709328',
        gasUsed: '327094',
        cumulativeGasUsed: '7546838'
      })
    }, {
      txn_id: '0x59d338054a24643ea6bf4d4c527719d6fbaeca8f3e69e05ee9015dadc1e05b45',
      token_pair_id: 1,
      fees_eth: 0.003627624808810992,
      fees_usdt: 12.04,
      timestamp: new Date(1712255603),
      details: JSON.stringify({
        blockNumber: '19586590',
        from: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        value: '1261889110251882770',
        gas: '322759',
        gasPrice: '15440709328',
        gasUsed: '234939',
        cumulativeGasUsed: '3923025'
      })
    }])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('txn_history', null, {})
  }
}
