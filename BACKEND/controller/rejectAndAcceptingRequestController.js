const { staffPrivillageObj } = require('../service/staffPrivilleges');


const rejectingIdReq = async (req , res) => {
    try{
        // in the request body
        // when divs from front end are clicked i want their id to be the actual id in the reqFlow table
        // and when they are clicked i want them to send the id and the reason
        let { reason , rejected_request_Id } = req.body;
        // then from the decoded access token u get the userId

        let sentInfo = { reason , rejected_request_Id };

        // from the decoded access u get the userId

        sentInfo.rejected_by = req.decodedAccess.userId;


        let result = await staffPrivillageObj.reject(sentInfo);


        if (result.success){
            res.status(200).json({message : "Sucessfully deleted"});
        } else {
            res.status(400).json({message : "Bad Request"});
        }
    } catch (err){
        console.log("Error from rejectingIdReq " , err.message);
        res.status(500).json({message : "Internal Server Error"})
    }
    
}


const acceptingIdReq = async (req , res) => {
    try {

    } catch (err){
        console.log("Error from acceptingIdReq " , err.message);
        res.status(500).json({message : "Internal Server Error"})
    }
    
}


module.exports = { rejectingIdReq }