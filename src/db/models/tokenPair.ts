import { DataTypes, type HasManyGetAssociationsMixin, Model } from 'sequelize'
import dbService from '../index'
import TransactionHistory from './transactionHistory'

export default class TokenPair extends Model {
  declare getTransactions: HasManyGetAssociationsMixin<TransactionHistory>;

  getContractAddress = (): string => {
    return this.get('contractAddress') as string
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
  active: DataTypes.BOOLEAN
}, {
  sequelize: dbService.sequelize,
  underscored: true,
  tableName: 'token_pair',
  timestamps: true
})

TokenPair.hasMany(TransactionHistory)
TransactionHistory.belongsTo(TokenPair)
