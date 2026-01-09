// this is a listener for the user signing up
// this listener will receive {username : sentInfo.username,email : sentInfo.email ,otp : OTP}
// so the purpose of this is to send the email to the user notifying the otp
// u define the event listener function here and export it to the service layer to listen to it
// so the event is like if the welcome message didnt get sent then it is ok 

const nodeMailer = require('nodemailer');

const dotenv = require('dotenv');
const path = require('path');


dotenv.config({
  path : path.resolve(__dirname , '../../.env')
})



// const  { signUpService } = require('../service/userSignUpService.js')
// this taught me abt circular dependency ie when u require a file that file will get executed first so in 
// this case the ../service/userSignUpService.js does require the listener first but when u require without exporting 
// the listener first then it will cause an error


// const EventEmitter = require('events');  an event created by a single object needs to be listened by that same obj
// thus we shall write the listener function here and send it to the service


let emailTransporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com', // means the emails i send live here 
  port: 587, // use this port to send out the emails
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD // is the password for the app to be able to send 
    // emails through the provided email not ur actual email password
  },
  tls: { rejectUnauthorized: false } // bypass certificate validation  for development only reverse this once through dev't
})

async function welcomingUsersUponSignUp(emailInfo) {
  try {
    // console.log("User_created is listened up")
    // then send the email
    // { email }
    let { email } = emailInfo;

    let emailSentOut = {
      from: `Lost Id Reporting`,
      to: email,
      subject: 'WELCOME MESSAGE',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Lost ID Automated Request Maker</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 10px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#6C63FF; padding:40px 20px; color:white;">
              <h1 style="margin:0; font-size:28px;"> Welcome to Lost ID Automated Request Maker App!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:30px 20px; color:#333333; line-height:1.5;">
              <p style="font-size:16px; margin:0 0 15px 0;">Hello</p>
              <p style="font-size:16px; margin:0 0 15px 0;">
                We're thrilled to have you on board! This app is designed to make the ID reporting and requesting process quicker for both students and staff.
              </p>
              <p style="font-size:16px; margin:0 0 15px 0;">
                To get started, log in to your account and explore all the features we built just for you.
              </p>

              <!-- CTA button -->
          
              <p style="font-size:14px; color:#777777; margin:0;">
                If you did not sign up , please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#f4f4f4; padding:20px; font-size:12px; color:#999999;">
              &copy; 2026 Lost Id Reporting. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    }

    let emailSend = await emailTransporter.sendMail(emailSentOut)


  } catch (err) {
    console.log("Error while welcomingUsersUponSignUp ", err.message);
  }
}



// console.log("signUpEventListener" , typeof signUpEventListener );

module.exports = { welcomingUsersUponSignUp }




