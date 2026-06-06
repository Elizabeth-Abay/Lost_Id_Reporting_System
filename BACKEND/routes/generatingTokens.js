const express = require('express');

const { CheckHealthOfRefreshToken } = require('../middleware/ForGeneratingAccessTokenFromRefToken');

const { GivenRefTokenGenAccessToken } = require('../controller/givenRefGenerateAccessToken');

const accessTokenGenerator = express.Router();



// to generate an access token from refresh token u send a post request
accessTokenGenerator.post('/generateAccessToken' , CheckHealthOfRefreshToken , GivenRefTokenGenAccessToken);



module.exports = { accessTokenGenerator }