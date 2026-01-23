import  {requestAccess} from './requestingAccessFromRef.js';


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

        if (response.status === 401) {
            console.log("Access token expired")
            await requestAccess();
        }
        const data = await response.json();

        console.log("data from backend " , data)

        if (response.ok && data.success) {
            displayNotifications(data.data);
            statusMessage.textContent = '';
        } else {
            statusMessage.textContent = `❌ ${data.message || 'Failed to load notifications'}`;
        }
    } catch (error) {
        console.log('Error fetching notifications:', error);
        statusMessage.textContent = '❌ Server error. Please try again later.';
    }
}


function createReportNotificationItem(item, type = 'default') {
    const div = document.createElement('div');
    div.className = `notification-item ${type}`;
    div.innerHTML = `<p>found By : ${item.founder_name} </p>
    <p>contact Info : ${item.contact_info}</p>`;
    return div;
}

function createNotificationItem(text, type = 'default') {
    const div = document.createElement('div');
    div.className = `notification-item ${type}`;

    if(type === 'rejection' && text === 'No recent rejections.'){
        console.log("Rejection is clicked")
        div.textContent = text;
        return div;
    }

    if(type === 'rejection'){
        console.log("text from rejection " , text.name)
        div.innerHTML = `<h3>Rejected By</h3>
        <h4>${text.name}</h4><h4>${text.role}</h4><h3>${text.reason}</h3>
        `
    }


    if (type === 'approval' && text === 'No recent approvals.'){
        div.textContent = text;
        return div;
    } 

    if (type === 'approval'){
        div.innerHTML = `<h3>Approved By</h3>
        <h4>${text.name}</h4><h4>${text.role}</h4>
        `
    }

    if (type === 'default'){
        div.innerHTML  = `
        <h3>
        ID FOUND
        </h3>
        <h4>${text.founder_name}</h4>
        <h4>${text.contact_info}</h4>
        `
    }
    
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
    // empty array has a truthy value
    let keyNums =  Object.keys(rejections).length;
    if (keyNums === 0) {
        rejectionsList.appendChild(createNotificationItem('No recent rejections.', 'rejection'));
    } else {
        rejectionsList.appendChild(
            createNotificationItem(rejections, 'rejection')
        );
    }

    // Approvals
    if (approvals.length === 0) {
        approvalsList.appendChild(createNotificationItem('No recent approvals.', 'approval'));
    } else {
        approvals.forEach(item => {
            approvalsList.appendChild(
                createNotificationItem(item , 'approval')
            );
        });
    }

    // Found IDs
    if (foundIds.length === 0) {
        foundIdsList.appendChild(createNotificationItem('No new found IDs.', 'found'));
    } else {
        foundIds.forEach(item => {
            foundIdsList.appendChild(
                createReportNotificationItem(item));
                // item = { founder_name , contact_info}
        });
    }
}

// Load notifications when page loads
document.addEventListener('DOMContentLoaded', loadNotifications);
