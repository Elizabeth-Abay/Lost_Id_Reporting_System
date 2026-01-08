document.addEventListener('DOMContentLoaded', () => {
    // Simulate navigation/fetch call when page loads
    fetchPendingRequests();
});

async function fetchPendingRequests() {
    try {
        // Replace with your actual API endpoint
        // first get the access token and then attach it to the req
        let access = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:3000/user/staff/unsigned-requests', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access}`
            }
        });
        const result = await response.json();

        const grid = document.getElementById('requests-grid');
        grid.innerHTML = ''; // Clear loading state

        if (result.success && result.data.length > 0) {
            result.data.forEach(req => {
                const card = createRequestCard(req);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p class="form-subtitle">No pending requests found.</p>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

function createRequestCard(req) {
    const div = document.createElement('div');
    div.className = 'request-card';
    div.id = `${req.id}`; // Setting ID from backend

    div.innerHTML = `
        <h3 class="form-subtitle">Request ID: #${req.id}</h3>
        <img src="${req.policeDocument}" alt="Police Document" class="doc-preview">
        <div class="actions">
            <button class="btn btn-accept" onclick="handleAccept(${req.id})">Accept</button>
            <button class="btn btn-cancel" onclick="openRejectModal(${req.id})">Reject</button>
        </div>
    `;
    return div;
}

// --- Action Handlers ---

async function handleAccept(id) {
    if (confirm(`Are you sure you want to accept request #${id}?`)) {
        console.log("Accepted ID:", id);
        // Add your fetch call to update backend status here
        // when they do an accept then 
        let result = await fetch('http://localhost:3000/user/staff/accept-request',
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${access}`
                },
                body: JSON.stringify({ requestFlowId: id })
            }
        )

        if (result.success){
            return true;
        } else {
            return false;
        }
    }
}

// when the accept button is clicked then 
// the div will have like its own id and then upon clicking
async function whenAcceptIsClicked(e) {
    try {
        e.preventDefault();
        // get the id
        let id = e.currentTarget.id;

        let acceptCase = await handleAccept(id);

        if (acceptCase){
            // in a nice way notify the user
        }

    } catch (Err){
        alert("Error while accepting the request")
    }

    
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

    console.log(`Rejecting ${id} for reason: ${reason}`);

    // Simulate backend update
    // await fetch('/api/reject', { method: 'POST', body: JSON.stringify({id, reason}) });

    alert(`Request #${id} Rejected.`);
    closeModal();
    // Remove from UI
    document.getElementById(`req-${id}`).remove();
});