import { DataTypes } from "sequelize";
import dbService from "../index";

const TransactionHistory = dbService.sequelize.define('TransactionHistory', {
  txnId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  }
}, {
  underscored: true,
  tableName: "txn_history"
})

export default TransactionHistory
