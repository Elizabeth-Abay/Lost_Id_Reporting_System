document.addEventListener("DOMContentLoaded", () => {
    const containerElement = document.querySelector("#fromjs");

    const listofItems = ["Abe", "Kebe", "Chala"];
    const ulElement = document.createElement("ul");

    listofItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;     // add text
        ulElement.appendChild(li); // add li to ul
    });

    containerElement.appendChild(ulElement); // add ul to div
});
