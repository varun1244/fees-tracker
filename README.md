# Fees-tracker
A NodeJs service to track the transaction fees of uniswap WETH/USDC contract in USDT.

### Installation

- Install [Docker](https://docs.docker.com/get-docker/) for your  operating system
- Create a new `.env` file in this directory and add the following variables:
    ```
    POSTGRES_DB=<DB name>
    POSTGRES_USER=<DB username>
    POSTGRES_PASSWORD=<DB password>
    ETHERSCAN_API_KEY=<Ether scan API key>
    ```

### Running the environment

Ensure docker is currently running and in a new terminal run the following command

```bash
docker-compose up
```

Navigate to `http://localhost:3000` to access the APIs


### Running tests

Ensure docker is currently running and in a new terminal run the following command

```bash
docker-compose -f docker-compose.test.yml up
```
This runs the tests of different modules and provides an overall code coverage.


### APIs
Although I've tried to integrate swagger doc, the automatic parsing needs a little bit of tweaking. 
Here is the APi scheme:

- GET /api/v1/transaction -> Lists all the transactions
- GET /api/v1/transaction/:id -> Get info for a particular transaction hash

- GET /api/v1/token -> Lists all the registered token pair
- POST /api/v1/token -> Create a new token pair to setup and monitor

- GET /api/v1/token/:id -> Lists specific token pair by id
- PUT /api/v1/token/:id -> Update specific token pair by id
- DELETE /api/v1/token/:id -> Delete specific token pair by id

- GET /api/v1/token/:id/transaction -> Lists all transactions for a specific token pair

### Setup
- Using the `WORKER` env variable, we can schedule `live | old` transaction parsing. 
This allows for horizontal scaling wherein new pods can be created during high loads. 

- To test out the performance and reliability, you can start the process, kill it randomly and the process will resume from the last attempt point.

- Using priority queue, I've controlled the ingestion of live transactions at the highest priority

- I've used a timescale DB to automatically partition the DB by timeseries in order to make the queries optimal

- Currently for historical transactions, I'm using a small batch size of 4 entries, but this can be tweaked as per needs. 

- The DB schema:
    ```
    {
        "txnId": PRIMARY KEY,
        "feesUsdt": STRING,
        "feesEth": STRING,
        "timestamp": TIMESTAMPZ,
        "details": {
            "from": STRING,
            "value": STRING,
            "gas": STRING,
            "gasPrice": STRING,
            "rate": STRING, // This is the ETH/USDT price at the time of ingestion
            "swapRate": STRING // This is the ETH/USDT price at the time of Transaction
            "gasUsed": STRING
            "cumulativeGasUsed": STRING
        },
        "tokenPairId": TOKEN_PAIR.ID,
        "blockNumber": STRING,
        "createdAt": DATETIME,
        "updatedAt": DATETIME,
    },
    ```
