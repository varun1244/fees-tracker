import { type EtherscanConfig } from '../worker/tracker/etherscan'
import type TokenPair from '../db/models/tokenPair'

const config = (tokenPair: TokenPair): EtherscanConfig => ({
  tokenPair,
  apiKey: process.env.ETHERSCAN_API_KEY ?? '',
  pollTimeout: 2000
})

export default config
