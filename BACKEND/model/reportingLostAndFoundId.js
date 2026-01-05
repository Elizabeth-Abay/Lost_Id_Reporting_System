const { pool } = require('./connect');


async function reportingLostId(sentInfo) {
    // sentInfo = { userId , lostIdNumber}
    try{
        let { userId , lostIdNumber } = sentInfo;

        // automatic matching means
        // before u insert into the lost Report table query the lost and check
        // insert it into table
        // since there is a trigger already inside the postgres it will do an automatic matching

        let result = await pool.query('INSERT INTO lostIdReport(user_id , lost_id_number ) VALUES($1 , $2)' , [userId , lostIdNumber] );


        if (result.rowCount === 0){
            return {
                success : false,
                reason : "Database input failure"
            }
        }

        return {
            success : true
        }

    } catch (err){
        console.log("Error from reportingLostId model " , err.message);
        return {
            success : false,
            reason : "Error with database" 
        }
    }

    
}


async function reportingFoundId(sentInfo) {
    try{

        let { name , foundId , foundAt , contactInfo } = sentInfo;
        let result = await pool.query('INSERT INTO foundIdReport( founder_name, contactInfo ,found_id_number , found_At ) VALUES($1 , $2 , $3 , $4)' , [name , contactInfo, foundId , foundAt ] );


        if (result.rowCount === 0){
            return {
                success : false,
                reason : "Database input failure"
            }
        }

        return {
            success : true
        }


    } catch (err){
        console.log("Error from reportingFoundId " , err.message);
        return {
            success : false,
            reason : "Error with database"
        }
    }
    
}

module.exports = { reportingLostId, reportingFoundId}