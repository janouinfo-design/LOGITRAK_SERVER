const cors = require('cors')
const { acrow  } = require('../configs').origins

exports.corsMiddleware = cors({
        origin: (origin, callback) => {
               callback(null, true)
               return
             if (acrow.includes(origin) || !origin || origin.includes('/localhost')) {
                  callback(null, true)
             } else {
                  callback(new Error('Origin not allowed'))
             }
        },
        optionsSuccessStatus: 200
})
