const { givenRefGenerateAccess } = require('../service/AccessAndRefreshTokenGen.js')

async function GivenRefTokenGenAccessToken(req , res ) {
    // talks with the service layer
    // req.decodedRefresh = {exp ,randomString ,role}
    // the res needs to have the access token generated
    // if reason = "Invalid Ref Token" then respond with sthg so that the front end knows to display the login page again

    let result = await givenRefGenerateAccess(req.decodedRefresh);

    if (result.success){
        res.status(200).json(result.data);
        return;
    } else {
        console.log(result.reason)
        res.status(400).json({ error: result.reason || "Invalid refresh token" });
    }
}





module.exports = {
    GivenRefTokenGenAccessToken
}