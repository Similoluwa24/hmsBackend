const sendToken = (user,statusCode,res)=>{
//create jwt token
   const token = user.getJwtToken()

    // const options={
    //     expires :new Date(
    //         Date.now() + process.env.COOKIE_EXPIRATION_TIME *24 * 60 * 60 * 1000
    //     ),
    //     httpOnly: true,
    //     secure: true, // Only secure in production..
    //     sameSite: "none"
    // }
    res.status(statusCode)
        .header("Authorization",`Bearer ${token}` )
        .json({
            status:"success",
            token,
            user
        })
}

module.exports = sendToken