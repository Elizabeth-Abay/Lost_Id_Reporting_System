const { rejectingIdReq } = require('../controller/rejectAndAcceptingRequestController');


const { isStaff , declineNonStaffUsers } = require('../middleware/ForAuthorizingStaffs');

const { CheckHealthOfAccessToken } = require('../middleware/ForGeneratingAccessTokenFromRefToken');


const express = require('express');

const rejectAndAcceptingRequest = express.Router();

rejectAndAcceptingRequest.post('/reject' , CheckHealthOfAccessToken , isStaff , declineNonStaffUsers  , rejectingIdReq );

module.exports = { rejectAndAcceptingRequest }