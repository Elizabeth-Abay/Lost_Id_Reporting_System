const otpInput = document.getElementById("otpInput");
const verifyBtn = document.getElementById("verifyBtn");
const resendBtn = document.getElementById("resendBtn");
const errorMsg = document.getElementById("errorMsg");
const timeLeftEl = document.getElementById("timeLeft");

const OTP_EXPIRY = 120; // seconds
let timer;
let timeLeft = OTP_EXPIRY;

// INIT
startTimer();
resendBtn.disabled = true;

// VERIFY OTP
verifyBtn.addEventListener("click", verifyOtp);

// RESEND OTP
resendBtn.addEventListener("click", resendOtp);

// ---------------- FUNCTIONS ----------------

async function verifyOtp() {
    const OTP = otpInput.value.trim();
    const email = localStorage.getItem("pendingEmail");

    if (!email) {
        showError("Session expired. Please sign up again.");
        return;
    }

    if (OTP.length !== 6) {
        showError("OTP must be 6 digits.");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/user/verifyOtp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, OTP })
        });

        const data = await res.json();

        if (res.status === 200) {
            storeTokens(data);
            localStorage.removeItem("pendingEmail");
            redirectByRole(data.role);
        } else {
            showError(data.reason || "Invalid OTP");
        }

    } catch {
        showError("Server error. Try again later.");
    }
}

// RESEND OTP
async function resendOtp() {
    const email = localStorage.getItem("pendingEmail");
    if (!email) return;

    resendBtn.disabled = true;
    resendBtn.textContent = "Sending...";

    try {
        const res = await fetch("http://localhost:3000/user/resendOtp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.status === 200) {
            resetTimer();
            showError("New OTP sent to your email.", "success");
        } else {
            showError(data.reason || "Unable to resend OTP");
        }

    } catch {
        showError("Server error while resending OTP.");
    }

    resendBtn.textContent = "Resend OTP";
}

// TIMER
function startTimer() {
    updateTimerUI();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(timer);
            resendBtn.disabled = false;
            timeLeftEl.textContent = "00:00";
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = OTP_EXPIRY;
    resendBtn.disabled = true;
    startTimer();
}

// UI
function updateTimerUI() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timeLeftEl.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function showError(msg, type = "error") {
    errorMsg.textContent = msg;
    errorMsg.style.color = type === "success" ? "green" : "red";
}

// TOKEN STORAGE (TEMP)
function storeTokens(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.role);
}

function redirectByRole(role) {
    if (role === "Student") {
        window.location.href = "studentHomePage.html";
    } else {
        window.location.href = "staffHomePage.html";
    }
}
