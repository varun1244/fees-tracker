const swaggerJSDoc = require('swagger-jsdoc')

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fees tracker',
    version: '1.0.0',
    description: 'Track fees of token pair ',
  },
}

const options = {
  swaggerDefinition,
  apis: ['./routes/*.ts'], // Path to the API routes in your Node.js application //
}

export default swaggerJSDoc(options)
