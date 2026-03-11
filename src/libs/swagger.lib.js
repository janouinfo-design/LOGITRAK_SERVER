const swaggerDocs = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const { version } = require('../../package.json')
const { routes } = require('../configs/index')?.application?.paths

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SWAGGER API",
            version,
        },
        components: {
            securitySchemas: {
                bearerAuth:{
                    type: 'http',
                    schema: 'bearer',
                    bearerFormat: 'JWT'
                } 
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [routes+'/*.js']
}

const swaggerSpec = swaggerDocs(options)

function initSwaggerDocs(app , port){
  app.use('/docs', swaggerUI.serve , swaggerUI.setup(swaggerSpec))

  app.get('/docs.json', (req, res)=> {
     res.setHeader('Content-Type', 'application/json')
     res.send(swaggerSpec)
  })

  console.log(`docs available at http://localhost:${port}/docs`)
}

module.exports = initSwaggerDocs