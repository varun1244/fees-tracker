import swaggerJSDoc, { SwaggerDefinition } from 'swagger-jsdoc'
import config from './config'

const swaggerDefinition: SwaggerDefinition = {
  failOnErrors: true,
  openapi: '3.0.0',
  info: {
    title: 'Fees tracker',
    version: '1.0.0',
    description: 'Track fees of various token pairs'
  },
  basePath: config.baseApiPath,
  host: config.host
}

const options = {
  swaggerDefinition,
  apis: ['./routes/*.ts', './index.ts'] // Path to the API routes in your Node.js application //
}

export default swaggerJSDoc(options)
