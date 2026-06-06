const { reportingFoundIdController , reportingLostIdController } = require('../controller/reportingLostAndFoundController');

const { CheckHealthOfAccessToken } = require('../middleware/ForGeneratingAccessTokenFromRefToken');

const express = require('express');

const lostAndFoundRouter = express.Router();

lostAndFoundRouter.post('/foundId' , reportingFoundIdController);

lostAndFoundRouter.post('/lostId' , CheckHealthOfAccessToken , reportingLostIdController);


module.exports = { lostAndFoundRouter }