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
