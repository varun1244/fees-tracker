import { TransactionBlock } from "../../src/worker/transformer/bulkTransactionHandler";

export function getMockTransactions(): TransactionBlock[] {
  return [
    {
      "blockNumber": "19605212",
      "timeStamp": "1712509811",
      "hash": "0xcde876ccf8881a3b43d8c35d72938ec500aaf72813aa84e6e721e5c7e008d833",
      "nonce": "138",
      "blockHash": "0x02dc566ffa191b12f86477cd14eed8350bd9b88092822215c88cce1ccc7b7133",
      "from": "0x50e4ca77ba8e5de01a9c6df5f354b1b618494592",
      "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "to": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "value": "150000000",
      "tokenName": "USDC",
      "tokenSymbol": "USDC",
      "tokenDecimal": "6",
      "transactionIndex": "145",
      "gas": "200000",
      "gasPrice": "30000000000",
      "gasUsed": "220000",
      "cumulativeGasUsed": "11953931",
      "input": "deprecated",
      "confirmations": "4"
    }, {
      "blockNumber": "19605210",
      "timeStamp": "1712509787",
      "hash": "0x60e71f6976348289ed068778655facdff842a70304d6002c31647e0f1098d06d",
      "nonce": "6838",
      "blockHash": "0x056b829a9b1489cb09528da5c5314d99688c66e4a979de1b955237b4a25700ff",
      "from": "0xa7733d4c849d8c1b19c73eeac9c54127a17be542",
      "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "to": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "value": "978805169",
      "tokenName": "USDC",
      "tokenSymbol": "USDC",
      "tokenDecimal": "6",
      "transactionIndex": "2",
      "gas": "1816008",
      "gasPrice": "20000000000",
      "gasUsed": "10000",
      "cumulativeGasUsed": "3092067",
      "input": "deprecated",
      "confirmations": "1"
    }
  ]
}
