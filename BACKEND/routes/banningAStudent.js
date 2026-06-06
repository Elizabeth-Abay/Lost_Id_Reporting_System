const { BanningStudent } = require('../controller/banningAStudent');

const { isStaff , declineNonStaffUsers } = require('../middleware/ForAuthorizingStaffs');

const { CheckHealthOfAccessToken } = require('../middleware/ForGeneratingAccessTokenFromRefToken');

const express = require('express');

const BanAndUnBanRouter = express.Router();

BanAndUnBanRouter.post('/banStudent' ,  CheckHealthOfAccessToken , isStaff , declineNonStaffUsers , BanningStudent );

module.exports = { BanAndUnBanRouter };