// when working with tokens

if (Result.status === 403){
    // means the access token is expired
    // so the front end automatically needs to send refresh token request

    await fetch('http://localhost:3000/token/generateAccess')

}