// this middleware sends true if person is staff else - false
// decode the access token and then look at the role

function isStaff(req, res, next) {
	// the access token has been verified now 
	// so then check the role

	let accessDecoded = req.decodedAccess;
	// {userId , role}

	if (accessDecoded) {
		// then look at the role and like if it is student then update the req
		if (accessDecoded.role.toLowerCase() === 'student') {
			req.staff = false;
		}
		else {
			req.staff = true;
		}
		return next();
	} else{
		// the access token is invalid probably
		res.json({
			success : false,
			reason : 'Access token not properly decoded'
		})
	}

} 


module.exports = { isStaff }
// import this middleware to use it for checking if users are properly authorized
