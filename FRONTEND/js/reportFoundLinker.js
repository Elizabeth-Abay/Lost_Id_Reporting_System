import  {requestAccess} from './requestingAccessFromRef.js';


let reportFoundForm = document.getElementById("reportFoundForm");

console.log(reportFoundForm);

reportFoundForm.addEventListener('submit' , async (e) => {
    e.preventDefault();

    try{
        // then do the request for the end point
        // { founderName, foundIdNumber, foundAt, contactInfo }  - expected
        let formData = new FormData(reportFoundForm);

        let Obj = Object.fromEntries(formData);

        let res = await fetch('http://localhost:3000/user/found-id' , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(Obj)
        })


        if (res.status === 401) {
            console.log("Access token expired")
            await requestAccess();
        }

        if (res.ok){
            alert('Thank you. Report made successfully');
            // reportFoundForm.reset();
        }
        else {
            alert('Error while reporting please try again')
        }

    } catch (err){
        alert("Error from front end " , err.message)
        console.log("Error from frontend " , err.message);
    }
})