const { ReportingLostAndFoundHandler } = require('../service/reportingLostAndFound');


const reportingLostIdController = async (req , res) => {
    try{
        // to do a report the user only needs to click the report lost id button
        // no new form the id u are reporting
        let { lost_id_number } = req.body;
        // this will be the id the user is reporting as lost
        // bc to ensure they actually want to and also maybe by their account request for others
        // { lost_id_number } = sentInfo;
        // then we get the userId from the decoded access token

        let decodedAccess = req.decodedAccess;

        let userId = decodedAccess.userId;

        // then call the service layer by using this

        let result = await ReportingLostAndFoundHandler.reportLost({ userId , lost_id_number});

        if (result.success){
            res.status(200).json({ message : "Report made successfully" })
        } else {
            res.status(400).json({ message : "Bad Request"})
        }

        

    } catch (err){
        console.log("Error from reportingLostIdController " , err.message);
        res.status(500).json({message : "Internal Server problem"})
    }
    
}


const reportingFoundIdController = async (req , res) => {
    try{
        // to do a report the user only needs to click the report lost id button
        // no new form the id u are reporting
        let { name , foundId , foundAt , contactInfo} = req.body;
        // the user didn't sign up so we cant have any token info


        let result = await ReportingLostAndFoundHandler.reportLost({ name , foundId , foundAt , contactInfo});

        if (result.success){
            res.status(200).json({ message : "Report made successfully" });
            // in the front end it will move them to a thank you page
        } else {
            res.status(400).json({ message : "Bad Request"})
            // alert them to remake the request
        }

        

    } catch (err){
        console.log("Error from reportingLostIdController " , err.message);
        res.status(500).json({message : "Internal Server problem"})
    }
    
}


module.exports = { reportingFoundIdController , reportingLostIdController}