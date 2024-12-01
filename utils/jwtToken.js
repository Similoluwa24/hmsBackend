const sendToken = (user,statusCode,res)=>{
//create jwt token
   const token = user.getJwtToken()

    const options={
        expires :new Date(
            Date.now() + process.env.COOKIE_EXPIRATION_TIME *24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    res.status(statusCode)
        .cookie("token",token,options )
        .json({
            status:"success",
            token,
            user
        })
}

module.exports = sendToken