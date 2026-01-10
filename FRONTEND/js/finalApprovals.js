document.addEventListener('DOMContentLoaded', () => {
    fetchFinalApprovals();
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

async function fetchFinalApprovals() {
    try {
        let access = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:3000/user/staff/final-approvals', {
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
                return fetchFinalApprovals(); // Retry with new token
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
                const card = createFinalApprovalCard(req);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p class="form-subtitle">No requests ready for final approval.</p>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        const grid = document.getElementById('requests-grid');
        grid.innerHTML = `<p class="form-subtitle">Error loading requests. Please try again.</p>`;
    }
}

function createFinalApprovalCard(req) {
    const div = document.createElement('div');
    div.className = 'request-card';
    div.id = `req-${req.id}`;

    // Fix image path - ensure proper URL construction
    const imageUrl = req.policedocument ? 
        (req.policedocument.startsWith('http') ? req.policedocument : `http://localhost:3000${req.policedocument}`) 
        : '../images/default-document.jpg';

    // Check which signatures are present
    const signatures = [];
    if (req.library_sign) signatures.push('Library');
    if (req.campus_police_sign) signatures.push('Campus Police');
    if (req.financial_sign) signatures.push('Financial');
    if (req.book_store_sign) signatures.push('Book Store');
    if (req.department_head_sign) signatures.push('Department Head');

    div.innerHTML = `
        <div class="document-preview">
            <img src="${imageUrl}" alt="Police Document" class="doc-preview" 
                 onerror="this.src='../images/default-document.jpg'; this.alt='Document not available'">
        </div>
        <div class="request-info">
            <h3>ID: ${req.id_number}</h3>
            <p class="student-name">Student: ${req.student_name}</p>
            <p class="department">Department: ${req.student_department}</p>
            <div class="signatures">
                <strong>Completed Signatures:</strong>
                <p>${signatures.join(', ')}</p>
            </div>
            <p class="request-status">Status: Ready for Final Approval</p>
        </div>
        <div class="actions">
            <button class="btn btn-accept" onclick="handleFinalize(${req.id})">Finalize Approval</button>
            <button class="btn btn-cancel" onclick="openRejectModal(${req.id})">Reject</button>
        </div>
    `;
    return div;
}

async function handleFinalize(id) {
    if (confirm(`Are you sure you want to finalize approval for request #${id}? This will complete the request process.`)) {
        try {
            let access = localStorage.getItem("accessToken");
            const response = await fetch('http://localhost:3000/user/staff/finalize-request', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${access}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    requestId: parseInt(id)
                })
            });

            // Handle token expiration
            if (response.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    return handleFinalize(id); // Retry with new token
                } else {
                    window.location.href = '../html/login.html';
                    return;
                }
            }

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Request finalized successfully!');
                // Remove the card from UI
                const card = document.getElementById(`req-${id}`);
                if (card) {
                    card.remove();
                }
                // Refresh the list
                fetchFinalApprovals();
            } else {
                alert(`Error finalizing request: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error finalizing request:', error);
            alert('Error finalizing request. Please try again.');
        }
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

    try {
        let access = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:3000/user/staff/reject-request', {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                rejectedRequestId: parseInt(id),
                reason: reason 
            })
        });

        // Handle token expiration
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry request
                return document.getElementById('rejection-form').dispatchEvent(new Event('submit'));
            } else {
                window.location.href = '../html/login.html';
                return;
            }
        }

        const result = await response.json();

        if (response.ok && result.success) {
            alert('Request rejected successfully!');
            closeModal();
            // Remove the card from UI
            const card = document.getElementById(`req-${id}`);
            if (card) {
                card.remove();
            }
            // Refresh the list
            fetchFinalApprovals();
        } else {
            alert(`Error rejecting request: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error rejecting request. Please try again.');
    }
});
