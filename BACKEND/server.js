const express = require('express');

const server = express();

const cors = require('cors');


const { LogInAndSignUpRouter } = require('./routes/userlogin');

const { accessTokenGenerator } = require('./routes/generatingTokens')


server.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

server.use(express.json());

server.use('/user' , LogInAndSignUpRouter);
server.use('/token' , accessTokenGenerator );

server.listen(3000 , () => {
    console.log("Server is up and running.")
})