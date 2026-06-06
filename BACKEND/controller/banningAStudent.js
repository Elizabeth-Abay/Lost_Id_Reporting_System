const { staffPrivillageObj } = require('../service/staffPrivilleges');


const BanningStudent = async (req , res) => {
    try{
        // use a second middleware to check if not staff
        // as a middleware u need to require the decodedAccess 
        let decodedAccess = req.decodedAccess
		// {userId , role}

        let sentInfo = req.body;
        // {idNumber, reason } = sentInfo

        // bannedBy - will be the id of the person banning
        sentInfo.bannedBy = decodedAccess.userId;

        // now send the whole info to the service layer

        let result = await  staffPrivillageObj.banStudentFunction(sentInfo);

        if (result.success){
            return res.status(200).json({message : "Successfully banned the student"})
        }
        else {
            return res.status(400).json({message : "Error while calling staffPrivillageObj.banStudentFunction"});
        }

    } catch (err){
        console.log("Error while BanningStudent " , err.message);
        res.status(500).json({message : "Internal server error"})
    }
    
}

module.exports = { BanningStudent }