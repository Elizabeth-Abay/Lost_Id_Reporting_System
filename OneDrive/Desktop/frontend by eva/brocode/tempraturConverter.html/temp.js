const textBox=document.getElementById("textBox");
const tofahrenheit=document.getElementById("toFahreinheit");
const tocelsius=document.getElementById("toCelcius");
const result=document.getElementById("result");
let temp;

function convert(){
    if(tofahrenheit.checked){
        result.textContent="you selected to Fahrenheit";
        temp=Number(textBox.value);
        temp=temp*9/5+32;
        result.textContent=temp.toFixed(1)+" °F";

    }

    else if(tocelsius.checked){
        result.textContent="you selected to Celcius"
        temp=Number(textBox.value);
        temp=(temp-32)*(5/9);
        result.textContent=temp.toFixed(1)+" °C";

    } 
    else{
        result.textContent="Select a unit";
    }
   


}
