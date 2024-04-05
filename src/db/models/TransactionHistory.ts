import { DataTypes, Model, Sequelize } from "sequelize";

export default class TransactionHistory {
  constructor(sequelize: Sequelize) {
    sequelize.define('TransactionHistory', {
      txnId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      }
    }, {
      underscored: true,
      tableName: "txn_history"
    })
  }
}

