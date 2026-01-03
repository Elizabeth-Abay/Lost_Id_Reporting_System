// this part will export all the functions that talk to the api

export async function signUpCaller(frontEndSentInfo){
    // here all the form will be validated from the front end and sent\
    let result = await fetch('http://localhost:3000/user/signUp' , {
        method : 'POST',
        headers : {
            "Content-Type" : "application/json"
        } ,
        body : JSON.stringify(frontEndSentInfo)
    })

    
    if (result.status === 201){
        alert('User Successfully created');
    } else if (result.status === 400){
        alert("User already exists try logging in")
    } else{
        alert("Internal Server Error")
    }
}



