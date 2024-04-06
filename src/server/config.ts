const config = {
  baseApiPath: process.env.API_BASE_PATH ?? '/api/v1',
  host: process.env.HOST ?? 'http://localhost:3000',
  port: parseInt(process.env.PORT ?? '3000')
}

export default config
