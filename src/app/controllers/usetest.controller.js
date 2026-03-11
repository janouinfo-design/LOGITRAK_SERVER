let ssm = require('../../apis/sql-server-request');
exports.getUser = async (req, res)=> {
    let response = await ssm.execProc('saveUser', req.body.data)
    res.json(response)
}
