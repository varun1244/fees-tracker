const commonDb = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ?? 5432,
  dialect: 'postgres',
  poolMin: process.env.DB_CONNECTIONS_POOL_MIN ?? 2,
  poolMax: process.env.DB_CONNECTIONS_POOL_MAX ?? 20
}

module.exports = {
  development: {
    ...commonDb,
    startOver: true,
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: commonDb.host,
    port: commonDb.port,
    dialect: commonDb.dialect,
    startOver: true,
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  production: {
    ...commonDb,
    dialectOptions: {
      bigNumberStrings: true
    }
  }
}
