const token = localStorage.getItem('accessToken'); // JWT token

const rejectionsList = document.getElementById('rejectionsList');
const approvalsList = document.getElementById('approvalsList');
const foundIdsList = document.getElementById('foundIdsList');
const statusMessage = document.getElementById('statusMessage');

async function loadNotifications() {
    if (!token) {
        statusMessage.textContent = "❌ You must be logged in to see notifications.";
        return;
    }

    statusMessage.textContent = 'Loading notifications...';

    try {
        const response = await fetch('http://localhost:3000/user/student/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displayNotifications(data.data);
            statusMessage.textContent = '';
        } else {
            statusMessage.textContent = `❌ ${data.message || 'Failed to load notifications'}`;
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        statusMessage.textContent = '❌ Server error. Please try again later.';
    }
}


function createReportNotificationItem(founderName , ContactInfo , type = 'default') {
    const div = document.createElement('div');
    div.className = `notification-item ${type}`;
    div.innerHTML = `<p>found By : ${founderName} </p>
    <p>contact Info : ${ContactInfo}</p>` ;
    return div;
}

function createNotificationItem(text, type = 'default') {
    const div = document.createElement('div');
    div.className = `notification-item ${type}`;
    div.textContent = text;
    return div;
}

function displayNotifications({ rejections, approvals, foundIds }) {
    console.log(rejections);
    console.log(approvals);
    console.log(foundIds);
    rejectionsList.innerHTML = '';
    approvalsList.innerHTML = '';
    foundIdsList.innerHTML = '';

    // Rejections
    if (rejections.length === 0) {
        rejectionsList.appendChild(createNotificationItem('No recent rejections.', 'rejection'));
    } else {
        rejections.forEach(item => {
            rejectionsList.appendChild(
                createNotificationItem(`ID: ${item.id} | Reason: ${item.reason} | Date: ${new Date(item.created_at).toLocaleString()}`, 'rejection')
            );
        });
    }

    // Approvals
    if (approvals.length === 0) {
        approvalsList.appendChild(createNotificationItem('No recent approvals.', 'approval'));
    } else {
        approvals.forEach(item => {
            approvalsList.appendChild(
                createNotificationItem(`ID: ${item.id} | Approved on: ${new Date(item.updated_at).toLocaleString()}`, 'approval')
            );
        });
    }

    // Found IDs
    if (foundIds.length === 0) {
        foundIdsList.appendChild(createNotificationItem('No new found IDs.', 'found'));
    } else {
        foundIds.forEach(item => {
            foundIdsList.appendChild(
            createReportNotificationItem(item.founder_name , item.contact_info )            );
        });
    }
}

// Load notifications when page loads
document.addEventListener('DOMContentLoaded', loadNotifications);
