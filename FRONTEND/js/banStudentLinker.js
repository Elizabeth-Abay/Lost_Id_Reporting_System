const banningForm = document.getElementById("banning-form");
const idNumber = document.getElementById("studentId");
const reason = document.getElementById("reason");
const statusTxt = document.getElementById("status-text");
const { renewAccessToken } = require('./tokenRenewer')



banningForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        if (!reason.value.trim() || !idNumber.value.trim()) {
            return alert("Input the neccessary fields")
        }
        // create a form object
        let token = localStorage.getItem("accessToken");
        let formdata = new FormData(banningForm);

        // then make an object from it
        let inputVals = Object.fromEntries(formdata);
        console.log("Fetch called with " , inputVals)

        let res = await fetch('http://localhost:3000/user/staff/ban-student', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`
                
            },
            body: JSON.stringify(inputVals)
        });

     

        if (res.ok && jsonIfied.success) {
            statusTxt.innerText = "Banned Successfully";
            statusTxt.style.color = 'Green'
        } else {
            statusTxt.innerText = "Ban Unsuccessful";
            statusTxt.style.color = 'Red'
        }

    } catch (err) {
        console.log("Error while banning ", err.message);
        alert(err.message)
    }
})