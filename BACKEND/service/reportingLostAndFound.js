const { reportingFoundId, reportingLostId } = require('../model/reportingLostAndFoundId');



class ReportingLostAndFound {
    async reportLost(sentInfo) {
        try {
            let { userId, lostIdNumber } = sentInfo;

            let result = await reportingLostId({userId, lostIdNumber})

            if (result.success){
                return {
                    success : true
                }
            }

            return {
                success : false,
                reason : "reportingLostId probelem"
            }

        } catch (err) {
            console.log("Error while ReportingLostAndFound.reportLost ", err.message)
            return {
                success: false,
                reason: "Error while ReportingLostAndFound.reportLost"
            }
        }

    }


    async reportFound(sentInfo) {
        try {
            let { name , foundId , foundAt , contactInfo } = sentInfo;

            let result = await reportingFoundId({name , foundId , foundAt , contactInfo })

            if (result.success){
                return {
                    success : true
                }
            }

            return {
                success : false,
                reason : "reportingFoundId probelem"
            }

        } catch (err) {
            console.log("Error while ReportingLostAndFound.reportLost ", err.message)
            return {
                success: false,
                reason: "Error while ReportingLostAndFound.reportLost"
            }
        }

    }
}

const ReportingLostAndFoundHandler = new ReportingLostAndFound();


module.exports = { ReportingLostAndFoundHandler }