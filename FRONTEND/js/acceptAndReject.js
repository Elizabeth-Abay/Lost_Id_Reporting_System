const backdrop = document.getElementById('modalBackdrop');
const reasonInput = document.getElementById('rejectReason');
const submitReject = document.getElementById('submitReject');
let activeCard = null;


document.querySelectorAll('.reject').forEach(btn => {
    btn.addEventListener('click', () => {
        activeCard = btn.closest('.card');
        backdrop.style.display = 'grid';
        reasonInput.value = '';
        submitReject.disabled = true;
    });
});

document.querySelector('.cancel').addEventListener('click', () => {
    backdrop.style.display = 'none';
    activeCard = null;
});

reasonInput.addEventListener('input', () => {
    submitReject.disabled = reasonInput.value.trim().length < 5;
});
