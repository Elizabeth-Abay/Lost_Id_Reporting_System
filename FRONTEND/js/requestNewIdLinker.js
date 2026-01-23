import  {requestAccess} from './requestingAccessFromRef.js';


const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById('statusMessage');
const idNumInput = document.getElementById("studentId");
const policeDocInput = document.getElementById("policeDocument");
const formId = document.getElementById("newIdForm")


// console.log(formNewId);
formId.addEventListener('submit' , (e) => {
  e.preventDefault();
  console.log("Form is being submitted");
})

// Replace this with however you store JWT tokens
const token = localStorage.getItem('accessToken');

document.addEventListener(
  'DOMContentLoaded', () => {
    // attach the listener then
    submitBtn.addEventListener('click', FormListener);

  }
);


let FormListener = async (event) => {
  console.log("Btn clicked")
  event.preventDefault();
  event.stopPropagation();

  const idNumber = idNumInput.value.trim();
  const policeDocument = policeDocInput.files[0];

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

    if (response.status === 401) {
            console.log("Access token expired")
            await requestAccess();
        }

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      // Show success message
      alert('request Successful')
      statusMessage.innerText = '✅ Request submitted successfully!';
      statusMessage.style.color = 'green';
      return;
    } else {
       alert('request unSuccessful please ensure you are requesting for your own Id number and you have not previously made the request')
      // Show backend error message
      statusMessage.innerText = `❌ ${data.message || 'Submission failed.'}`;
      statusMessage.style.color = 'red';
      return;
    }

  } catch (error) {
    console.log('Error submitting request:', error);
    statusMessage.innerText = '❌ Server error. Please try again later.';
    statusMessage.style.color = 'red';
    return;
  }
}


