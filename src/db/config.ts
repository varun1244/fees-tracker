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

const config = (env: string): typeof commonDb => {
  // In case we want to alter config based on environment
  if (env === 'production') {
    return commonDb
  } else {
    return commonDb
  }
}

export default config