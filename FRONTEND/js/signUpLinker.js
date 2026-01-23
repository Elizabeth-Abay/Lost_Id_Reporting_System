document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const mainRoleSelect = document.getElementById("mainRoleSelect");
    const departmentGroup = document.getElementById("departmentGroup");
    const departmentSelect = document.getElementById("departmentSelect");
    const staffRoleGroup = document.getElementById("staffRoleGroup");
    const staffRoleSelect = document.getElementById("staffRoleSelect");
    const deptHeadDepartmentGroup = document.getElementById("deptHeadDepartmentGroup");
    const deptHeadDepartmentSelect = document.getElementById("deptHeadDepartmentSelect");
    const userIdInput = document.getElementById("userId");
    const roleBadge = document.querySelector(".role-badge");
    const roleBadgeIcon = roleBadge.querySelector("i");
    const roleBadgeText = roleBadge.querySelector("span");
    const signupForm = document.getElementById("signupForm");
    const statusMessage = document.getElementById("statusMessage");

    // ---------- Role Selection Logic ----------
    mainRoleSelect.addEventListener("change", function () {
        const selectedRole = this.value;

        // Reset dynamic fields
        departmentGroup.classList.remove("visible");
        staffRoleGroup.classList.remove("visible");
        deptHeadDepartmentGroup.classList.remove("visible");

        departmentSelect.required = false;
        departmentSelect.value = "";
        staffRoleSelect.required = false;
        staffRoleSelect.value = "";
        deptHeadDepartmentSelect.required = false;
        deptHeadDepartmentSelect.value = "";

        if (selectedRole === "Student") {
            roleBadgeIcon.className = "fas fa-user-graduate";
            roleBadgeText.textContent = "Student Registration";
            roleBadge.classList.remove("staff-role-badge");

            departmentGroup.classList.add("visible");
            departmentSelect.required = true;
            userIdInput.placeholder = "e.g., UGR/1234/14";
        } else if (selectedRole === "Staff") {
            roleBadgeIcon.className = "fas fa-briefcase";
            roleBadgeText.textContent = "Staff Registration";
            roleBadge.classList.add("staff-role-badge");

            staffRoleGroup.classList.add("visible");
            staffRoleSelect.required = true;
            userIdInput.placeholder = "e.g., STAFF/5678";
        }
    });

    staffRoleSelect.addEventListener("change", function () {
        const selectedStaffRole = this.value;

        deptHeadDepartmentGroup.classList.remove("visible");
        deptHeadDepartmentSelect.required = false;
        deptHeadDepartmentSelect.value = "";

        if (selectedStaffRole === "department_head") {
            deptHeadDepartmentGroup.classList.add("visible");
            deptHeadDepartmentSelect.required = true;
        }
    });

    // ---------- Status Message ----------
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = "block";

        if (type === "success") {
            setTimeout(() => {
                statusMessage.style.display = "none";
            }, 3000);
        }
    }

    // ---------- Form Submission ----------
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mainRole = mainRoleSelect.value;
        const staffRole = staffRoleSelect.value;
        const department =
            departmentSelect.value || deptHeadDepartmentSelect.value || null;

        const finalRole = mainRole === "Staff" ? staffRole : "Student";

        const payload = {
            id: userIdInput.value.trim(),
            role: finalRole,
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value,
            name: document.getElementById("name").value.trim(),
            department: department,
        };

        try {
            const response = await fetch("http://localhost:3000/user/signUp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.status === 201 && data.userCreated) {
                showStatus(
                    "Account created successfully. Redirecting to OTP verification...",
                    "success"
                );

                localStorage.setItem("pendingEmail", payload.email);

                setTimeout(() => {
                    window.location.href = "otp.html";
                }, 1200);
            } else if (response.status === 400) {
                showStatus(data.reason || "User already exists", "error");
            } else {
                showStatus("Something went wrong. Please try again later.", "error");
            }
        } catch (error) {
            console.log(error);
            showStatus("Unable to connect to server.", "error");
        }
    });
});
