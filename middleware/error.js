

module.exports = (err, req, res, next) =>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    if (process.env.NODE_ENV === "development") {
        res.status(err.statusCode).json({
            status:"Fail",
            error:err,
            errMessage: err.message,
            stack: err.stack
        })  
    }
    if (process.env.NODE_ENV === "production") {
        let error = {...err}
        error.message = err.message
            res.status(error.statusCode).json({
                status:"Fail",
                message:error.message || "Internal Server Error"
            })
    }
}