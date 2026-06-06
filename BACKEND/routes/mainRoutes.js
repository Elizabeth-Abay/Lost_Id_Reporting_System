const express = require('express');
const { StudentController, StaffController, PublicController } = require('../controller/mainController');
// const { authenticateToken } = require('../middleware/authMiddleware');
const { LogInAndSignUpRouter } = require('./userlogin');
const { isStaff , declineNonStaffUsers } = require('../middleware/ForAuthorizingStaffs');
const  {  CheckHealthOfRefreshToken, CheckHealthOfAccessToken } = require('../middleware/ForGeneratingAccessTokenFromRefToken')

const router = express.Router();

// Initialize controllers
const studentController = new StudentController();
const staffController = new StaffController();
const publicController = new PublicController();


// signing up
router.use('/' , LogInAndSignUpRouter)



// Public routes (no authentication required)
router.post('/found-id', publicController.reportFoundId);

// Student routes (authentication + student role required)
router.post('/student/lost-id', CheckHealthOfAccessToken , studentController.reportLostId);
router.post('/student/new-id', CheckHealthOfAccessToken , studentController.requestNewId);
router.get('/student/status/:idNumber', CheckHealthOfAccessToken , studentController.checkRequestStatus);
router.get('/student/notifications', CheckHealthOfAccessToken , studentController.getNotifications);

// Staff routes (authentication + staff role required)
router.post('/staff/ban-student', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.banStudent);
router.post('/staff/unban-student', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.unBanStudent);
router.get('/staff/banned-students', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.getBannedStudents);

router.post('/staff/reject-request', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.rejectRequest);
router.post('/staff/unreject-request', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.unrejectRequest);
router.post('/staff/accept-request', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.acceptRequest);
router.post('/staff/finalize-request', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.finalizeRequest);

router.get('/staff/unsigned-requests', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.getUnsignedRequests);
router.get('/staff/rejected-requests', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.getRejectedRequests);
router.get('/staff/all-requests', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.getAllRequests);
router.get('/staff/request-details/:requestId', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.getRequestDetails);
router.get('/staff/dashboard', CheckHealthOfAccessToken ,isStaff , declineNonStaffUsers, staffController.getDashboardStats);




module.exports = router;
