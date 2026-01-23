const { StudentService } = require('../service/studentService');
const { staffPrivillageObj } = require('../service/staffPrivilleges');
const { notificationService } = require('../service/notificationService');
const { ReportingLostAndFound } = require('../service/reportingLostAndFound');

const { storage } = require('./multerConnector');


const studentService = new StudentService();

const reportLostAndFoundService = new ReportingLostAndFound();

class StudentController {
    async reportLostId(req, res) {
        try {
            // req.decodedAccess = result;
            // {userId , role}
            const { userId } = req.decodedAccess; // From JWT middleware
            const { idNumber } = req.body;

            if (!idNumber) {
                return res.status(400).json({
                    success: false,
                    message: "ID number is required"
                });
            }

            const result = await studentService.reportLostId({ userId, idNumber });

            if (result.success) {
                return res.status(200).json({ "message": "Id report successful" });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StudentController.reportLostId:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async requestNewId(req, res) {
        try {
            const { userId } = req.decodedAccess; // From JWT middleware
            // as a middleware u will have the req.path
            const policeDocument = req.file ? `/uploads/${req.file.filename}` : null;
            // policeDocument is gonna be the path of the document
            const { idNumber } = req.body;

            console.log("New Id requested by ", idNumber)


            if (!idNumber || !policeDocument) {
                return res.status(400).json({
                    success: false,
                    message: "ID number and police document are required"
                });
            }

            const result = await studentService.requestNewId({ userId, idNumber, policeDocument });

            console.log("000result", result);

            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StudentController.requestNewId:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async checkRequestStatus(req, res) {
        try {
            const { userId } = req.decodedAccess; // From JWT middleware
            const { idNumber } = req.params;

            const result = await studentService.checkRequestStatus({ userId, idNumber });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StudentController.checkRequestStatus:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getNotifications(req, res) {
        try {
            // the vision is to get the accepter and the rejector name
            // function 
            // accepts the student id and requester_id 
            // join with users table for every 
            // take that row
            // status - rejected then query the rejected_requests table where rejected_request_id = rows id
            // then give back the reason and  the rejector so that students can communicate them during office hours
            
            
            // pending 
            // then join with the users table and name , role - return mareg

            // if status = rejected
            // then join with rejected_requests on row.id = rejected_requests.rejected_request_id
            // return the reason and join with users table and return rejected_requests.rejected_by
            // return name , role
            // something new here 
            // first u need to have the positions set in the function returns and and the query result
            const { userId } = req.decodedAccess; // From JWT middleware

            const result = await studentService.getStudentNotifications({ userId });

            console.log("Result seen from controller " , result )
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StudentController.getNotifications:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

class StaffController {
    async banStudent(req, res) {
        try {
            const { userId: bannedBy } = req.decodedAccess; // From JWT middleware
            // console.log(bannedBy)
            const { idNumber, reason } = req.body;

            if (!idNumber || !reason) {
                return res.status(400).json({
                    success: false,
                    message: "ID number and reason are required"
                });
            }

            const result = await staffPrivillageObj.banStudentFunction({ idNumber, bannedBy, reason });

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: "Student banned successfully"
                });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.banStudent:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async unBanStudent(req, res) {
        try {
            const { userId: unBannedBy } = req.decodedAccess; // From JWT middleware
            const { idNumber } = req.body;
            console.log("Trying to unban " , idNumber)

            if (!idNumber) {
                return res.status(400).json({
                    success: false,
                    message: "ID number is required"
                });
            }

            const result = await staffPrivillageObj.unBanStudent({ idNumberBeingUnBanned: idNumber, unBannedBy });

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: "Student unbanned successfully"
                });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.unBanStudent:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getBannedStudents(req, res) {
        try {
            const { userId: bannerId } = req.decodedAccess; // From JWT middleware

            const result = await staffPrivillageObj.getAllBannedByMe({ bannerId });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.getBannedStudents:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async rejectRequest(req, res) {
        try {
            const { userId: rejected_by } = req.decodedAccess; // From JWT middleware
            const { reason, rejectedRequestId } = req.body;

            let rejected_request_Id = rejectedRequestId;

            if (!reason || !rejected_request_Id) {
                return res.status(400).json({
                    success: false,
                    message: "Reason and request ID are required"
                });
            }

            const result = await staffPrivillageObj.reject({ rejected_by, reason, rejected_request_Id });

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: "Request rejected successfully"
                });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.rejectRequest:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async unrejectRequest(req, res) {
        try {
            const { userId: unrejecterId } = req.decodedAccess; // From JWT middleware
            const { rejectedRequestId } = req.body;
            // this is the id of the reject_request tables
            // so when ppl want to see their unrejected list we return the id of the rejected_req table ie the primary key

            if (!rejectedRequestId) {
                return res.status(400).json({
                    success: false,
                    message: "Rejected request ID is required"
                });
            }

            const result = await staffPrivillageObj.unreject({ rejectedRequestId, unrejecterId });

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: "Request unrejected successfully"
                });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.unrejectRequest:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async acceptRequest(req, res) {
        try {
            const { userId: approverId, role } = req.decodedAccess; // From JWT middleware
            const { requestFlowId } = req.body;
            // so the first thing expected here is the requestFlowId
            console.log("approverId0 " , approverId);
            console.log("requestFlowId 0 " , requestFlowId)

            if (!requestFlowId) {
                return res.status(400).json({
                    success: false,
                    message: "Request ID is required"
                });
            }

            const result = await staffPrivillageObj.acceptRequest({ role, approverId, requestFlowId });

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: "Request accepted successfully"
                });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.acceptRequest:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getUnsignedRequests(req, res) {
        try {
            const { userId, role, department } = req.decodedAccess; // From JWT middleware


            console.log("role from getUnsigned" , role);

            const result = await staffPrivillageObj.getUnSignedRequests({ role, userId, department });

            if (result.success) {
                return res.status(200).json({ "result": result.data });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.getUnsignedRequests:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getFinalApprovalsForRegistry(req, res) {
        try {
            const { userId, role } = req.decodedAccess; // From JWT middleware

            // Only registry role can access this endpoint
            if (role !== 'registral') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Registry role required."
                });
            }

            const result = await staffPrivillageObj.getFinalApprovalsForRegistry({ userId });

            if (result.success) {
                return res.status(200).json({ "result": result.data });
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in in StaffController.getFinalApprovalsForRegistry:", error.message); 
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getRejectedRequests(req, res) {
        try {
            const { userId: rejectorId } = req.decodedAccess; // From JWT middleware
            console.log("Staff trying to get the requests they rejected " , rejectorId );

            const result = await staffPrivillageObj.gettingAllRejectedByMeService({ rejectorId });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.getRejectedRequests:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getAllRequests(req, res) {
        try {
            const { status = 'all', limit = 50, offset = 0 } = req.query;

            const result = await staffPrivillageObj.getAllRequests({
                status,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.getAllRequests:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getRequestDetails(req, res) {
        try {
            const { requestId } = req.params;

            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    message: "Request ID is required"
                });
            }

            const result = await staffPrivillageObj.getRequestDetails({ requestId });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.getRequestDetails:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async finalizeRequest(req, res) {
        try {
            const { userId: staffId } = req.decodedAccess; // From JWT middleware
            const { requestId } = req.body;

            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    message: "Request ID is required"
                });
            }

            const result = await staffPrivillageObj.finalizeRequest({ requestId, staffId });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.finalizeRequest:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const { userId: staffId } = req.decodedAccess; // From JWT middleware

            const result = await staffPrivillageObj.getDashboardStats({ staffId });

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.log("Error in StaffController.getDashboardStats:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

class PublicController {
    async reportFoundId(req, res) {
        try {
            const { founderName, foundIdNumber, foundAt, contactInfo } = req.body;


            // use the service layer class for this
            let result = await reportLostAndFoundService.reportFound({ founderName, foundIdNumber, foundAt, contactInfo });

            if (result.success) {
                return res.status(200).json({ message: "Successfully reported" })
            }

            else {
                return res.status(400).json({ message: "Bad Request" })
            }




        } catch (error) {
            console.log("Error in PublicController.reportFoundId:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

module.exports = {
    StudentController,
    StaffController,
    PublicController
};
