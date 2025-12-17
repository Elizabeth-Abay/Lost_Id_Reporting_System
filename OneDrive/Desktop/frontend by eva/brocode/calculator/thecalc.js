let display = document.getElementById("display");

// Add numbers or symbols
function append(value) {
    // Replace % with /100
    if (value === "%") {
        value = "/100";
    }

    if (display.innerText === "0") {
        display.innerText = value;
    } else {
        display.innerText += value;
    }

    // Always store updated input
    localStorage.setItem("value", display.innerText);
}
window.onload = function() {
    const savedValue = localStorage.getItem("value");
    if (savedValue) {
        display.innerText = savedValue;
    }
};

// Clear everything
function clearDisplay() {
    display.innerText = "0";
    localStorage.setItem("value", "0");
}

// Delete last character
function deleteLast() {
    display.innerText = display.innerText.slice(0, -1);
    if (display.innerText === "") {
        display.innerText = "0";
    }
    localStorage.setItem("value", display.innerText);
}

// Calculate result
function calculate() {
    try {
        const result = eval(display.innerText);
        display.innerText = result;

        // Save result in localStorage
        localStorage.setItem("answer", result);

    } catch {
        display.innerText = "Error";
        localStorage.setItem("answer", "Error");
    }
}
