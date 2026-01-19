document.addEventListener('DOMContentLoaded', () => {
    fetchRejectedRequests();
});

// Token renewal function
async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return false;
        }

        const response = await fetch('http://localhost:3000/token/generateAccessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}


document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-accept')) {
    handleUnreject(e.target.dataset.id);
    // bc the html wont know the function definition if u use onClick and things like that
  }
});


async function fetchRejectedRequests() {
    try {
        let access = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:3000/user/staff/rejected-requests', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access}`,
                "Content-Type": "application/json"
            }
        });

        // Handle token expiration
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return fetchRejectedRequests(); // Retry with new token
            } else {
                window.location.href = '../html/login.html';
                return;
            }
        }

        const res = await response.json();
        const grid = document.getElementById('requests-grid');
        grid.innerHTML = '';

        console.log("Result = " , res)

        if (response.ok && res.data && res.data.length > 0) {
            res.data.forEach(req => {
                const card = createRejectedRequestCard(req);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p class="form-subtitle">No rejected requests found.</p>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        const grid = document.getElementById('requests-grid');
        grid.innerHTML = `<p class="form-subtitle">Error loading rejected requests. Please try again.</p>`;
    }
}

function createRejectedRequestCard(req) {
    const div = document.createElement('div');
    div.className = 'request-card rejected-card';
    div.id = `${req.id}`;

    const createdDate = new Date(req.created_at).toLocaleDateString();

    div.innerHTML = `
        <div class="request-info">
            <p><strong>Student ID:</strong> ${req.id_number}</p>
            <p><strong>Rejected Date:</strong> ${createdDate}</p>
            <p><strong>Reason:</strong> ${req.reason}</p>
        </div>
        <div class="actions">
            <button class="btn btn-accept" data-id=${req.id}>Unreject</button>
        </div>
    `;
    return div;
}

async function handleUnreject(id) {
    if (confirm(`Are you sure you want to unreject request #${id}? This will move it back to pending requests.`)) {
        try {
            let access = localStorage.getItem("accessToken");
            const response = await fetch('http://localhost:3000/user/staff/unreject-request', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${access}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    rejectedRequestId: id
                })
            });

            // Handle token expiration
            if (response.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    return handleUnreject(id); // Retry with new token
                } else {
                    window.location.href = '../html/login.html';
                    return;
                }
            }

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Request unrejected successfully!');
                // Remove the card from UI
                const card = document.getElementById(`rejected-${id}`);
                if (card) {
                    card.remove();
                }
                // Refresh the list
                fetchRejectedRequests();
            } else {
                alert(`Error unrejecting request: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error unrejecting request:', error);
            alert('Error unrejecting request. Please try again.');
        }
    }
}
