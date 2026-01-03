
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const signupForm = document.getElementById('signupForm');
    const otpForm = document.getElementById('otpForm');
    const statusMessage = document.getElementById('statusMessage');
    const userEmail = document.getElementById('userEmail');
    const otpTimer = document.getElementById('otpTimer');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const resetOtpBtn = document.getElementById('resetOtpBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpDigits = document.querySelectorAll('.otp-digit');
    const hiddenOtpInput = document.getElementById('otpInput');

    // State Variables
    let otpCountdown;
    let otpTimeLeft = 120; // 2 minutes in seconds
    let generatedOtp = '';
    let userData = {};

    // Show status message
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        }
    }

    // Generate random 6-digit OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Start OTP countdown timer
    function startOTPTimer() {
        clearInterval(otpCountdown);
        otpTimeLeft = 120;
        resendOtpBtn.disabled = true;
        resendOtpBtn.innerHTML = '<i class="fas fa-redo"></i> Resend OTP (02:00)';

        otpCountdown = setInterval(() => {
            otpTimeLeft--;

            const minutes = Math.floor(otpTimeLeft / 60);
            const seconds = otpTimeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            otpTimer.textContent = timeString;

            // Update resend button text
            if (otpTimeLeft <= 60) {
                resendOtpBtn.innerHTML = `<i class="fas fa-redo"></i> Resend OTP (${seconds}s)`;
            }

            // Change color when less than 30 seconds
            if (otpTimeLeft < 30) {
                otpTimer.classList.add('timer-expired');
            }

            // Enable resend button when timer reaches 0
            if (otpTimeLeft <= 0) {
                clearInterval(otpCountdown);
                otpTimer.textContent = '00:00';
                resendOtpBtn.disabled = false;
                resendOtpBtn.innerHTML = '<i class="fas fa-redo"></i> Resend OTP';
                showStatus('OTP has expired. Please request a new one.', 'error');
            }
        }, 1000);
    }

    // Handle OTP digit input
    function handleOtpInput(e) {
        const input = e.target;
        const value = input.value;

        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            input.value = '';
            return;
        }

        // If a digit is entered, move to next input
        if (value.length === 1) {
            const index = parseInt(input.dataset.index);
            if (index < 5) {
                otpDigits[index + 1].focus();
            }
        }

        // Update hidden OTP input
        updateHiddenOtp();
    }

    // Update hidden OTP input value
    function updateHiddenOtp() {
        let otp = '';
        otpDigits.forEach(digit => {
            otp += digit.value;
        });
        hiddenOtpInput.value = otp;
    }

    // Handle OTP digit deletion
    function handleOtpKeyDown(e) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const input = e.target;
            const index = parseInt(input.dataset.index);

            if (input.value === '' && index > 0) {
                otpDigits[index - 1].focus();
            }
        }
    }

    // Reset OTP form
    function resetOtpForm() {
        otpDigits.forEach(digit => {
            digit.value = '';
        });
        updateHiddenOtp();
        otpTimer.classList.remove('timer-expired');
        otpTimer.textContent = '02:00';
        clearInterval(otpCountdown);
    }

    // Validate signup form
    function validateSignupForm() {
        const studentId = document.getElementById('studentId').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!studentId) {
            showStatus('Please enter your Student ID', 'error');
            return false;
        }

        // if (!email.endsWith('@aau.edu.et')) {
        //   showStatus('Please use a valid AAU email address', 'error');
        //   return false;
        // }

        if (password.length < 6) {
            showStatus('Password must be at least 6 characters', 'error');
            return false;
        }

        return true;
    }

    // Validate OTP
    function validateOTP() {
        const otp = hiddenOtpInput.value;

        if (otp.length !== 6) {
            showStatus('Please enter the complete 6-digit OTP', 'error');
            return false;
        }

        if (otp !== generatedOtp) {
            showStatus('Invalid OTP. Please try again.', 'error');
            return false;
        }

        return true;
    }

    // Event Listeners

    // Signup Form Submission
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateSignupForm()) return;

        // Store user data
        userData = {
            studentId: document.getElementById('studentId').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };

        // Show loading state
        sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
        sendOtpBtn.disabled = true;

        // Simulate API call delay
        setTimeout(() => {
            // Generate OTP
            generatedOtp = generateOTP();

            // Show success message (in real app, OTP would be sent via email)
            showStatus(`OTP sent to ${userData.email}`, 'success');

            // Update email display
            userEmail.textContent = userData.email;

            // Switch to OTP form
            signupForm.style.display = 'none';
            otpForm.style.display = 'block';

            // Reset OTP form
            resetOtpForm();

            // Focus first OTP digit
            otpDigits[0].focus();

            // Start OTP timer
            startOTPTimer();

            // Reset send OTP button
            sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
            sendOtpBtn.disabled = false;

            // Log OTP to console for demo purposes
            console.log('Generated OTP (for demo only):', generatedOtp);
        }, 1500);
    });

    // OTP Form Submission
    otpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateOTP()) return;

        // Show loading state
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        verifyBtn.disabled = true;

        // Simulate account creation
        setTimeout(() => {
            showStatus('Account created successfully! Redirecting to login...', 'success');

            // In real application, you would submit the form to server
            console.log('Account created for:', userData);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }, 1500);
    });

    // Resend OTP Button
    resendOtpBtn.addEventListener('click', function () {
        if (this.disabled) return;

        // Generate new OTP
        generatedOtp = generateOTP();

        // Show loading state
        resendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
        resendOtpBtn.disabled = true;

        // Simulate resend delay
        setTimeout(() => {
            showStatus('New OTP sent to your email', 'success');

            // Reset OTP form
            resetOtpForm();
            otpDigits[0].focus();

            // Start new timer
            startOTPTimer();

            // Log new OTP to console for demo
            console.log('New OTP (for demo only):', generatedOtp);
        }, 1000);
    });

    // Reset OTP Button (go back to signup)
    resetOtpBtn.addEventListener('click', function () {
        signupForm.style.display = 'block';
        otpForm.style.display = 'none';
        resetOtpForm();
        clearInterval(otpCountdown);
        showStatus('', '');
    });

    // Add event listeners to OTP digits
    otpDigits.forEach(digit => {
        digit.addEventListener('input', handleOtpInput);
        digit.addEventListener('keydown', handleOtpKeyDown);
    });

    // Auto-submit OTP when all digits are filled
    otpDigits[5].addEventListener('input', function () {
        if (hiddenOtpInput.value.length === 6) {
            // Small delay to allow last digit to be processed
            setTimeout(() => {
                otpForm.dispatchEvent(new Event('submit'));
            }, 100);
        }
    });

    // Add input animation effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateY(-2px)';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});