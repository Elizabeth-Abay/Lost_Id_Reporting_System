async function renewAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const response = await fetch(`http://localhost:3000/token/generateAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // refresh token expired / invalid → force logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return {
        success : false ,
        reason : "Failed to refresh access token"
    }
  }

  const data = await response.json();

  if (!data.accessToken) {
    return {
        success : false,
        reason : "No access token returned from server"
    }
  }

  // ✅ store new access token
  localStorage.setItem("accessToken", data.accessToken);

  return {
    success : true
  }
}


module.exports = { renewAccessToken }
