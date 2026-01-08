// there are buttons when clicked move to a different page

const buttons = document.querySelectorAll('.action-btn');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const text = button.textContent.trim();

        switch (text) {
            case 'Pending Requests':
                window.location.href = 'pendingRequests.html';
                break;
            case 'Already Approved':
                window.location.href = 'approvedRequests.html';
                break;
            case 'Rejected Requests':
                window.location.href = 'rejectedRequests.html';
                break;
            case 'Ban a Student':
                window.location.href = 'banStudent.html';
                break;
            case 'Banned Student List':
                window.location.href = 'bannedList.html';
                break;
            default:
                console.log('Unknown action');
        }
    });
});
