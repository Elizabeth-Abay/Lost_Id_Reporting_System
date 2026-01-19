let notificationBtn = document.getElementById("btn-report-status");

let reportLostBtn = document.getElementById("btn-report-lost");

let requestNewBtn = document.getElementById("btn-request-new");


notificationBtn.addEventListener('click', () => {
    window.location.href = "studentNotification.html"

}
)



reportLostBtn.addEventListener('click', () => {
    window.location.href = "reportLostId.html"
});


requestNewBtn.addEventListener('click', () => {
    window.location.href = "requestForNewId.html"
})







