const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function CheckHealthOfRefreshToken(req, res, next) {
	// from the request body take and check the health of ref token
	// first signed by me and is it expired

	let { refreshToken } = req.body;

	try {
		let decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		// it returns the decoded info if the refreshToken is valid
		// it throws an error if the refreshToken has sthg wrong with it

		// ie if there is a value then set the decoded
		// decodedRefresh = { randomString }
		req.decodedRefresh = decodedRefresh;
		return next();
	} catch (err) {
		// ie if there is an error
		// the error may from jwt.verify() maybe from expired token , or invalid token
		// we identify those with the name property from the error

		if (err.name === 'TokenExpiredError') {
			// then notify the front end to send a post request with the refresh token
			res.status(401).json({
				success: false,
				reason: 'Token Expired'
			});
			return;
		}

		else if (err.name === 'JsonWebTokenError') {
			// then invalid token
			res.status(401).json({
				success: false,
				reason: 'Invalid Token'
			})
			return;
		}
		res.status(400).json({ error: "Something is wrong with the refresh token" });
	}

}


// u need to check for the health of access token too
function CheckHealthOfAccessToken(req, res, next) {
	try {
		// so the access token is sent in the header
		let authHeader = req.headers.authorization;
		// authorization : Bearer Token - string

		if (!authHeader) {
			res.status(401).json({
				"message" : "No accessToken provided"
		});
			return;
		}

		let accessToken = authHeader.split(' ')[1];

		let result = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

		req.decodedAccess = result;
		// {userId , role}
		return next();


	} catch (err) {
		console.log(err.message);
		if (err.name === 'TokenExpiredError') {
			// then notify the front end to send a post request with the refresh token
			// means token is expired
			res.status(401).json({
				success: false,
				reason: 'Token Expired'
			});
			return;
		}

		else if (err.name === 'JsonWebTokenError') {
			// then invalid token
			// 401 means token has been tampered with
			res.status(401).json({
				success: false,
				reason: 'Invalid Token'
			})
			return;
		}
		res.status(400).json({ error: "Something is wrong with the refresh token" });
	}

}





module.exports = {  CheckHealthOfRefreshToken, CheckHealthOfAccessToken }