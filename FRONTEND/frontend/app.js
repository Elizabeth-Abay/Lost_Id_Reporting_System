const logInForm = document.getElementById("loginForm");

const signUpForm = document.getElementById("signupForm");


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
            alert('User Successfully created');
        } else if (result.status === 400) {
            alert("User already exists try logging in")
        } else {
            alert("Internal Server Error")
        }
    } catch (err) {
        console.log(err)
    }





}




signUpForm.addEventListener('submit', async (e) => {
    try {
        e.preventDefault();

        console.log("The sign up form submitted")

        let formData = new FormData(e.currentTarget);

        let AllInfo = Object.fromEntries(formData);

        let result = await signUpCaller(AllInfo);


    } catch (err) {
        alert(`Front End Error ${err.message}`)
    }

})



async function logInCaller(frontEndInfo) {
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
            alert('User Successfully created');
        } else if (result.status === 400) {
            alert("User already exists try logging in")
        } else {
            alert("Internal Server Error")
        }
    } catch (err) {
        console.log(err)
    }

}




logInForm.addEventListener('submit', async (e) => {
    try {
        e.preventDefault();

        console.log("The sign up form submitted")

        let formData = new FormData(e.currentTarget);

        let AllInfo = Object.fromEntries(formData);

        let result = await signUpCaller(AllInfo);
    } catch (err) {
        console.log("Error from front end ", err.message);
    }
})