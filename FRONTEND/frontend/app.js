let emailRegExp = new RegExp("^[a-zA-Z0-9!#$%&*+/=?^_`{|}~'-]+(\\.[a-zA-Z0-9!#$%&*+/=?^_`{|}~'-]+)*@(yahoo|outlook|gmail)\\.com$");

const logInForm = document.getElementById("loginForm");

const signUpForm = document.getElementById("signupForm");

const otpVerificationBtn = document.getElementById("verifyBtn");
const otpInputElt = document.getElementById("otpInput");
const otpErrorMessage = document.getElementById("errorMsg");


// As a note for the error cases make the ui more intuitive

function Adding3DInteraction() {
    const mainContainer = document.querySelector('.main');
    const inputs = document.querySelectorAll('input, select');
    const buttons = document.querySelectorAll('button');

    // Add 3D hover effect to main container
    mainContainer.addEventListener('mousemove', function (e) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

        mainContainer.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    mainContainer.addEventListener('mouseleave', function () {
        mainContainer.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        mainContainer.style.transition = 'transform 0.5s ease';
    });

    mainContainer.addEventListener('mouseenter', function () {
        mainContainer.style.transition = 'none';
    });

    // Add focus effects to form inputs
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateZ(10px)';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateZ(0)';
        });
    });

    // Button click effects
    buttons.forEach(button => {
        button.addEventListener('mousedown', function () {
            this.style.transform = 'translateY(0) translateZ(5px) scale(0.98)';
        });

        button.addEventListener('mouseup', function () {
            this.style.transform = 'translateY(-3px) translateZ(10px)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) translateZ(0)';
        });
    });

    // Form reset functionality
    document.getElementById('reset').addEventListener('click', function () {
        document.getElementById('loginForm').reset();
        inputs.forEach(input => {
            input.style.transform = 'translateY(0)';
            input.parentElement.style.transform = 'translateZ(0)';
            input.value = '';
        });
    });


}


async function signUpCaller(frontEndSentInfo) {
    try {
        console.log(frontEndSentInfo)

        // here all the form will be validated from the front end and sent\
        let result = await fetch('http://localhost:3000/user/signUp', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(frontEndSentInfo)
        })



        if (result.status === 201) {
            console.log('User Successfully created');
            window.location.href = 'otp.html';
            return;
        } else if (result.status === 400) {
            alert("User already exists try logging in");
            window.location.href = 'login.html';
            return;

        } else {
            alert("Internal Server Error")
        }
    } catch (err) {
        alert(err)
        console.log(err)
    }
}


async function logInCaller(frontEndInfo) {
    try {
        // here all the form will be validated from the front end and sent\
        let result = await fetch('http://localhost:3000/user/logIn', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(frontEndInfo)
        })

        let Tokens = await result.json();



        if (result.status === 200) {
            // means the user is matched with the account

            console.log(Tokens.accessToken, Tokens.refreshToken);

            localStorage.setItem("accessToken", Tokens.accessToken);
            localStorage.setItem("refreshToken", Tokens.refreshToken);

            if (Tokens.role === 'Student') {
                // then move the user to students homepage
                window.location.href = 'studentHomePage.html'

            } else {
                // means the user is Staff so move the user to Staff's homepage
                window.location.href = 'staffHomePage.html'
            }

        } else if (result.status === 400) {
            // means an error happened in the server
            alert('Bad Request')

        } else {
            alert("Internal Server Error TRY AGAIN LATER");
        }
    } catch (err) {
        console.log(err)
    }

}


// Validate signup form
function validateSignupForm() {
    const mainRole = mainRoleSelect.value;
    const name = document.getElementById('name').value.trim();
    const userId = userIdInput.value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!mainRole) {
        showStatus('Please select your main role', 'error');
        return false;
    }

    if (!name) {
        showStatus('Please enter your full name', 'error');
        return false;
    }

    if (!userId) {
        showStatus('Please enter your ID number', 'error');
        return false;
    }

    if (!email.endsWith('@aau.edu.et')) {
        showStatus('Please use a valid AAU email address', 'error');
        return false;
    }

    if (password.length < 6) {
        showStatus('Password must be at least 6 characters', 'error');
        return false;
    }

    // Additional validation for students
    if (mainRole === 'Student') {
        const department = departmentSelect.value;
        if (!department) {
            showStatus('Please select your department', 'error');
            return false;
        }
    }

    // Additional validation for staff
    if (mainRole === 'Staff') {
        const staffRole = staffRoleSelect.value;
        if (!staffRole) {
            showStatus('Please select your staff role', 'error');
            return false;
        }

        // Special validation for Department Head
        if (staffRole === 'Department-Head') {
            const deptHeadDept = deptHeadDepartmentSelect.value;
            if (!deptHeadDept) {
                showStatus('Please select the department you head', 'error');
                return false;
            }
        }
    }

    return true;
}


async function otpVerificationCaller(frontEndInfo) {
    try {
        let result = await fetch('http://localhost:3000/user/verifyOtp', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(frontEndInfo)
        })

        let Tokens = await result.json();

        if (result.status === 200) {
            // if 200 then Tokens is the actual tokens
            // once otp is verified according to their role they will need to be sent to their dashboard
            // to make it more ux proper

            console.log(Tokens.accessToken, Tokens.refreshToken);

            localStorage.setItem("accessToken", Tokens.accessToken);
            localStorage.setItem("refreshToken", Tokens.refreshToken);

            if (Tokens.role === 'Student') {
                // then move the user to students homepage
                window.location.href = 'studentHomePage.html'

            } else {
                // means the user is Staff so move the user to Staff's homepage
                window.location.href = 'staffHomePage.html'
            }

        } else if (result.status === 400) {
            // if 400 Tokens contain the result

            console.log(Tokens.reason);
            otpErrorMessage.innerText = "Something is wrong";

        } else {
            // means internal server error happened

            otpErrorMessage.innerText = "Internal server Error";
        }


    } catch (err) {
        console.log("Error from otpVerificationCaller");
    }

}


// we will also need to send the resend otp button function needs


if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            console.log("The sign up form submitted")
            if (!validateSignupForm()) return;

            let formData = new FormData(e.currentTarget);


            let AllInfo = Object.fromEntries(formData);

            console.log(AllInfo);

            for (let key in AllInfo) {
                // validating inputs
                if (!AllInfo[key]) {
                    // meaning the value is empty
                    alert("Make sure all values are there and in a proper format");
                    return;
                }

                if (key === 'email' && !emailRegExp.test(AllInfo[key])) {
                    // checking the email format
                    return alert("Email is not correct")

                }
            }


            // then save the email inside a localstorage

            localStorage.setItem("email", AllInfo.email);

            // let result = await signUpCaller(AllInfo);


        } catch (err) {
            alert(`Front End Error ${err.message}`)
        }

    })

}

if (logInForm) {
    document.addEventListener('DOMContentLoaded', Adding3DInteraction);

    logInForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            console.log("The log in form submitted")

            let formData = new FormData(e.currentTarget);

            let AllInfo = Object.fromEntries(formData);

            // validate the inputs

            for (let key in AllInfo) {
                // validating inputs
                if (!AllInfo[key]) {
                    // meaning the value is empty
                    alert("Make sure all values are there and in a proper format");
                    return;
                }

                if (key === 'email' && !emailRegExp.test(AllInfo[key])) {
                    // checking the email format
                    return alert("Email is not correct")

                }
            }

            let result = await logInCaller(AllInfo);
        } catch (err) {
            console.log("Error from front end ", err.message);
        }
    })

}

if (otpVerificationBtn) {
    otpVerificationBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            // get the value from the input and email from local storge
            e.stopPropagation();

            let OTP = otpInputElt.value.trim();
            let email = localStorage.getItem("email");

            if (!OTP || !email) {
                alert("Make sure you have all proper inputs");
                return;
            }

            // if everything is proper then send to the api
            let res = await otpVerificationCaller({ OTP, email })


        } catch (err) {
            // alert('Front End Error ',)
            otpErrorMessage.innerText = err.message;
        }

    })
}
