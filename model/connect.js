const pg = require('pg');

const dotenv = require('dotenv');

// const crypto = require('crypto'); something learnt in the model layer u dont need hashing..

const path = require('path');



dotenv.config({ path: path.resolve(__dirname, '../.env') });
// we need to store our password and this things in a secret place



// console.log(typeof process.env.data_base_password);


let pool = new pg.Pool({
    host: process.env.data_base_host,
    user: process.env.data_base_user,
    password: process.env.data_base_password,
    database: process.env.data_base_used,
    connectionLimit: 20
})



module.exports = { pool }