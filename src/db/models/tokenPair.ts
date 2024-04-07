import { DataTypes, Model } from 'sequelize'
import dbService from '../index'

export default class TokenPair extends Model {
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
