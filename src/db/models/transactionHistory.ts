import { DataTypes, Model } from 'sequelize'
import dbService from '../index'
import TokenPair from './tokenPair'

export interface TransactionModel {
  txnId: string
  feesEth: string
  feesUsdt: string
  timestamp: Date
  details: Record<string, any>
  tokenPairId: string
}

export default class TransactionHistory extends Model<TransactionModel> { }

TransactionHistory.init({
  txnId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  feesUsdt: DataTypes.FLOAT,
  feesEth: DataTypes.FLOAT,
  timestamp: DataTypes.DATE,
  details: DataTypes.JSON,
  tokenPairId: {
    type: DataTypes.INTEGER,
    field: 'token_pair_id'
  }
}, {
  sequelize: dbService.sequelize,
  underscored: true,
  tableName: 'txn_history',
  timestamps: true
})
