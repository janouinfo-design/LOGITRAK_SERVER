exports.onException = (e, res, status = 500) => {
      console.log('err', e.message || e)
      res.json({ 
            success: false, 
            result: null , 
            status,
            error: [{error: typeof e == 'string' ? e : e.message}]
      }) //Object.keys(e).length > 0 ? e :
}

exports.onResult = (res, data, status = 200) => {
      res.status(status).json(data?.success !== undefined ? data : { success: true, error: null , result: data , status})
}