// reportLostLinker.js
const submitLostReport = document.getElementById("lost-Id-Report");
const idNumberInput = document.getElementById("studentId");
const statusMessage = document.getElementById("statusMessage");

// Function to show status messages
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`; // 'success' or 'error'
    statusMessage.style.display = "block";

    if (type === "success") {
        setTimeout(() => {
            statusMessage.style.display = "none";
            idNumberInput.value = ""; // Clear input after success
        }, 3000);
    }
}

submitLostReport.addEventListener('submit', async (e) => {
    e.preventDefault();
    let val = idNumberInput.value.trim();

    if (!val){
        return showStatus('Please enter your ID number', 'error');
    }

    try {
        let access = localStorage.getItem("accessToken");
        let response = await fetch('http://localhost:3000/user/student/lost-id', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            },
            body: JSON.stringify({ idNumber: val })
        });

        let result = await response.json();

        if (response.ok && result.message) {
            showStatus(result.message, 'success'); // Display success message
        } else {
            showStatus(result.message || 'Failed to submit lost ID', 'error'); // Display error
        }

    } catch (err){
        console.error("Error while reporting lost ID:", err);
        showStatus("Unable to connect to server", 'error');
    }
});
