const form = document.getElementById('newIdForm');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById("form-submitter");

// Replace this with however you store JWT tokens
const token = localStorage.getItem('accessToken');

submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const idNumber = document.getElementById('studentId').value.trim();
  const policeDocument = document.getElementById('policeDocument').files[0];

  if (!idNumber || !policeDocument) {
    statusMessage.textContent = 'All fields are required.';
    statusMessage.style.color = 'red';
    return;
  }

  const formData = new FormData();
  formData.append('idNumber', idNumber);
  formData.append('policeDocument', policeDocument);

  try {
    const response = await fetch('http://localhost:3000/user/student/new-id', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`, // attach JWT token
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message
      statusMessage.innerText = '✅ Request submitted successfully!';
      statusMessage.style.color = 'green';
    } else {
      // Show backend error message
      statusMessage.inne = `❌ ${data.message || 'Submission failed.'}`;
      statusMessage.style.color = 'red';
    }

  } catch (error) {
    console.error('Error submitting request:', error);
    statusMessage.inne = '❌ Server error. Please try again later.';
    statusMessage.style.color = 'red';
  }
});
