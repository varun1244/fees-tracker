import { DataTypes, type HasManyGetAssociationsMixin, Model } from 'sequelize'
import dbService from '../index'
import TransactionHistory from './transactionHistory'

export default class TokenPair extends Model {
  declare id: number
  declare name: string
  declare contractAddress: string
  declare startBlock: bigint

  declare getTransaction: HasManyGetAssociationsMixin<TransactionHistory>

  getContractAddress = (): string => {
    return this.contractAddress
  }
}

TokenPair.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: DataTypes.STRING,
  contractAddress: DataTypes.STRING,
  active: DataTypes.BOOLEAN,
  startBlock: DataTypes.BIGINT
}, {
  sequelize: dbService.sequelize,
  underscored: true,
  tableName: 'token_pair',
  timestamps: true
})

TokenPair.hasMany(TransactionHistory, {
  as: 'transaction'
})

TransactionHistory.belongsTo(TokenPair)
