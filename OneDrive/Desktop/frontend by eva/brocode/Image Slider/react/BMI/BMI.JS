

    window.onload = function() {
      const saved = localStorage.getItem('bmiData');
      if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('age').value = data.age || '';
        document.getElementById('height').value = data.height  ||'';
        document.getElementById('weight').value = data.weight  ||'';
        if (data.gender) {
          document.getElementById(data.gender).checked = true;
        }
        if (data.bmi) {
          showResult(data.bmi, data.status);
        }
      }
    };

    function calculateBMI() {
      const age = document.getElementById('age').value;
      const height = parseFloat(document.getElementById('height').value) / 100;
      const weight = parseFloat(document.getElementById('weight').value);
      const gender = document.querySelector('input[name="gender"]:checked');

      if (!height  || !weight || weight <= 0  || height <= 0) {
        alert("Please enter valid height and weight");
        return;
      }

      const bmi = (weight / (height * height)).toFixed(2);
      let status = "";

      if (bmi < 18.5) status = "Underweight";
      else if (bmi < 25) status = "Normal weight";
      else if (bmi < 30) status = "Overweight";
      else if (bmi < 35) status = "Obese";
      else status = "Extremely obese";

      // Show result
      showResult(bmi, status);

     
      const data = {
        age: age,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        gender: gender ? gender.value : null,
        bmi: bmi,
        status: status
      };
      // localStorage.setItem('bmiData', JSON.stringify(data));
    }

    function showResult(bmi, status) {
      const resultDiv = document.getElementById('result');
      const bmiEl = document.getElementById('bmi');
      const statusEl = document.getElementById('status');

      bmiEl.textContent = bmi;
      statusEl.textContent = status;

      // Color based on status
      statusEl.className = 'bmi-status';
      if (status.includes("Normal")) statusEl.classList.add('normal');
      else if (status === "Underweight") statusEl.classList.add('underweight');
      else if (status === "Overweight") statusEl.classList.add('overweight');
      else if (status === "Obese") statusEl.classList.add('obese');
      else statusEl.classList.add('extremely-obese');

      resultDiv.style.display = 'block';
    }
