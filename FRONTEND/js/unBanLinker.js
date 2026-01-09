// to unban means there will be first a get request to see all banned
// then upon receivng all banned and settling them accordingly and like putting the id at the database to be the id of the div
// then if u click the button unban then request to be unbanned
// end points are - http://localhost:3000/user//staff/banned-students  - get request for this just send the token alongside
// and http://localhost:3000/user/staff/unban-student - when u click the unban button in the website
// in both cases u have to send the accessToken inside the header


document.addEventListener("DOMContentLoaded", () => {
  loadBannedStudents();
});

const tableBody = document.querySelector("tbody");
const token = localStorage.getItem("accessToken");

async function loadBannedStudents() {
  try {
    const res = await fetch(
      "http://localhost:3000/user/staff/banned-students",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch banned students");
    }

    const bannedStudents = await res.json();
    console.log(bannedStudents);
    // it is an object {success , data}


    tableBody.innerHTML = "";

    // Defensive: filter only still banned students
    const activeBans = bannedStudents.data.filter(s => s.stillbanned === true);

    if (activeBans.length === 0) {
      document.querySelector(".table-card").innerHTML =
        `<div class="no-data">You have not banned any students.</div>`;
      return;
    }

    activeBans.forEach(student => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td data-label="Student ID">${student.id_number}</td>
        <td data-label="Ban Reason">${student.reason}</td>
        <td data-label="Status">
          <span class="status banned">Banned</span>
        </td>
        <td data-label="Action">
          <button 
            class="action-btn unban"
            data-id-number="${student.id_number}">
            Unban
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    attachUnbanListeners();

  } catch (err) {
    console.error(err);
    alert("Error loading banned students");
  }
}

function attachUnbanListeners() {
  const buttons = document.querySelectorAll(".unban");

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const idNumber = btn.dataset.idNumber;

      if (!confirm(`Unban student ${idNumber}?`)) return;

      btn.disabled = true;
      btn.textContent = "Unbanning...";

      try {
        const res = await fetch(
          "http://localhost:3000/user/staff/unban-student",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ idNumber })
          }
        );

        if (!res.ok) {
          throw new Error("Unban request failed");
        }

        // Remove row immediately after success
        btn.closest("tr").remove();

        // If table becomes empty
        if (tableBody.children.length === 0) {
          document.querySelector(".table-card").innerHTML =
            `<div class="no-data">You have not banned any students.</div>`;
        }

      } catch (err) {
        console.error(err);
        alert("Failed to unban student");
        btn.disabled = false;
        btn.textContent = "Unban";
      }
    });
  });
}
