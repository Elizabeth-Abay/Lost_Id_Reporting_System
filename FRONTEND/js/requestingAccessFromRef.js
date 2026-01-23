export async function requestAccess() {
    try{
        let refreshToken = localStorage.getItem("refreshToken")
        let res = await fetch(
            'http://localhost:3000/token/generateAccessToken',
            {
                method : 'POST',
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    refreshToken
                })
            }
        )

        let jsonifiedRes = await res.json();

        if (res.status === 200){
            console.log("Access token retrieved");
            alert("Retry again")
            localStorage.setItem("accessToken" , jsonifiedRes.accessToken)
            return {
                success : true
            }

        }

    } catch (err){
        console.log("Error from requestAccess " , err.message)
        return {
            success : false
        }
    }
}

