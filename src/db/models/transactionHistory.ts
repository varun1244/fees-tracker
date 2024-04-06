import { DataTypes, Model } from 'sequelize'
import dbService from '../index'
import TokenPair from './tokenPair'

export default class TransactionHistory extends Model { }

TransactionHistory.init({
  txnId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  tokenPairId: {
    type: DataTypes.INTEGER,
    field: 'token_pair_id',
    references: {
      model: TokenPair,
      key: 'id'
    }
  },
  feesUsdt: DataTypes.FLOAT,
  feesEth: DataTypes.FLOAT,
  timestamp: DataTypes.DATE,
  details: DataTypes.JSON
}, {
  sequelize: dbService.sequelize,
  underscored: true,
  tableName: 'txn_history',
  timestamps: true,
})

TransactionHistory.belongsTo(TokenPair)
