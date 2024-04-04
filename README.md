# Fees-tracker
A NodeJs service to track the transaction fees of uniswap WETH/USDC contract in USDT.

### Installation

- Install [Docker](https://docs.docker.com/get-docker/) for your  operating system
- Create a new `.env` file in this directory and add the following variables:
    ```
    INFLUXDB_DB=<db name>
    INFLUXDB_USER=<username>
    INFLUXDB_PASSWORD=<password>
    ```

### Running the environment

Ensure docker is currently running and in a new terminal run the following command

```bash
docker-compose up
```

Navigate to `http://localhost:3000` to access the APIs
