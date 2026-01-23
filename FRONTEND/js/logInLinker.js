const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const resetBtn = document.getElementById('reset');

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

// Reset button clears the form
resetBtn.addEventListener('click', () => {
    loginForm.reset();
});

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/user/logIn', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await res.json();

        if (res.ok && result) {
            // Login successful
            storeTokens(result);
            redirectByRole(result.role);
        } else {
            // Login failed
            alert(result.reason || "Login failed. Please check your credentials.");
        }
    } catch (err) {
        console.log("Login Error:", err);
        alert("An error occurred while logging in. Please try again later.");
    }
});
