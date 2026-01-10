document.addEventListener('DOMContentLoaded', () => {
    fetchPendingRequests();
});


document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-accept')) {
    handleAccept(e.target.dataset.id);
  } else if (e.target.classList.contains('btn-cancel')){
    openRejectModal(e.target.dataset.id);
  }
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

async function fetchPendingRequests() {
    try {
        let access = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:3000/user/staff/unsigned-requests', {
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
                return fetchPendingRequests(); // Retry with new token
            } else {
                window.location.href = '../html/login.html';
                return;
            }
        }

        const res = await response.json();
        const grid = document.getElementById('requests-grid');
        grid.innerHTML = '';

        if (response.ok && res.result && res.result.length > 0) {
            res.result.forEach(req => {
                const card = createRequestCard(req);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p class="form-subtitle">No pending requests found.</p>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        const grid = document.getElementById('requests-grid');
        grid.innerHTML = `<p class="form-subtitle">Error loading requests. Please try again.</p>`;
    }
}


// --- Action Handlers ---

async function handleAccept(id) {
    console.log('Accept button clicked for request ID:', id);
    
    if (confirm(`Are you sure you want to accept request #${id}?`)) {
        try {
            let access = localStorage.getItem("accessToken");
            console.log('Access token found:', !!access);
            
            const requestBody = { 
                requestFlowId: id 
            };
            console.log('Request body:', requestBody);
            
            const response = await fetch('http://localhost:3000/user/staff/accept-request', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${access}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Handle token expiration
            if (response.status === 401) {
                console.log('Token expired, attempting refresh...');
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    console.log('Token refreshed, retrying...');
                    return handleAccept(id); // Retry with new token
                } else {
                    console.log('Token refresh failed, redirecting to login');
                    window.location.href = '../html/login.html';
                    return;
                }
            }

            const result = await response.json();
            console.log('Response result:', result);

            if (response.ok && result.success) {
                alert('Request accepted successfully!');
                // Remove the card from UI
                const card = document.getElementById(`req-${id}`);
                if (card) {
                    card.remove();
                }
                // Refresh the list
                fetchPendingRequests();
            } else {
                console.error('Accept request failed:', result);
                alert(`Error accepting request: ${result.message || result.reason || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Error accepting request. Please try again.');
        }
    }
}

function createRequestCard(req) {
    const div = document.createElement('div');
    div.className = 'request-card';
    div.id = `${req.id}`; // Setting ID from backend

    // Fix image path - images are served from /uploads, so use the correct URL
    // Database field is policeDocument (with capital D)

    const imageUrl = req.policedocument ? 
        `${req.policedocument}` 
        : '../images/default-document.jpg';

    // Debug: Log the image URL and the raw data
    console.log('Raw request data:', req);
    console.log('Image URL constructed:', imageUrl);
    console.log('policeDocument field:', req.policeDocument);
    console.log('policedocument field:', req.policedocument);

    div.innerHTML = `
        <div class="document-preview">
            <img src="${imageUrl}" alt="Police Document" class="doc-preview" 
                 onerror="this.src='../images/default-document.jpg'; this.alt='Document not available'">
        </div>
        <div class="request-info">
            <h3>ID: ${req.id_number}</h3>
            <p class="student-name">Student: ${req.student_name || 'N/A'}</p>
            <p class="department">Department: ${req.student_department || 'N/A'}</p>
            <p class="request-status">Status: ${req.status || 'Pending'}</p>
        </div>
        <div class="actions">
            <button class="btn btn-accept" data-id="${req.id}">Accept</button>
            <button class="btn btn-cancel" data-id="${req.id}">Reject</button>
        </div>
    `;
    return div;
}



function openRejectModal(id) {
    document.getElementById('reject-request-id').value = id;
    document.getElementById('rejection-modal').style.display = 'grid';
}

function closeModal() {
    document.getElementById('rejection-modal').style.display = 'none';
    document.getElementById('rejection-form').reset();
}

document.getElementById('rejection-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('reject-request-id').value;
    const reason = document.getElementById('rejection-reason').value;

    console.log('Reject form submitted for request ID:', id);
    console.log('Reject reason:', reason);

    try {
        let access = localStorage.getItem("accessToken");
        console.log('Access token found for reject:', !!access);
        
        const requestBody = { 
            rejectedRequestId: parseInt(id),
            reason: reason 
        };
        console.log('Reject request body:', requestBody);
        
        const response = await fetch('http://localhost:3000/user/staff/reject-request', {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Reject response status:', response.status);

        // Handle token expiration
        if (response.status === 401) {
            console.log('Token expired during reject, attempting refresh...');
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                console.log('Token refreshed, retrying reject...');
                // Retry the request
                return document.getElementById('rejection-form').dispatchEvent(new Event('submit'));
            } else {
                console.log('Token refresh failed, redirecting to login');
                window.location.href = '../html/login.html';
                return;
            }
        }

        const result = await response.json();
        console.log('Reject response result:', result);

        if (response.ok && result.success) {
            alert('Request rejected successfully!');
            closeModal();
            // Remove the card from UI
            const card = document.getElementById(`req-${id}`);
            if (card) {
                card.remove();
            }
            // Refresh the list
            fetchPendingRequests();
        } else {
            console.error('Reject request failed:', result);
            alert(`Error rejecting request: ${result.message || result.reason || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error rejecting request. Please try again.');
    }
});