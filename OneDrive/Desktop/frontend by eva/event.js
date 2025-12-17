function tsion(){
    alert("hello Tsi");

}
var el=document.getElementById("change-bg1");
el.onclick=changeBackground;
function changeBackground(){
    document.body.style.backgroundColor="#f56a79";
}
var el2=document.getElementById("removeBG");
el2.onmouseover=removeBackground;
function removeBackground(){
    document.body.style.backgroundColor="";
}
let btn2=document.getElementById("btn-2");
let techparent=document.getElementById("techparent");
btn2.ondblclick=changeToBlack;
function changeToBlack(){
    techparent.style.color="white";
    techparent.style.backgroundColor="black";


}
/**var el=document.getElementById("change-bg-listner");
el.addEventListener("click",changeBackground);
var el2=document.getElementById("night-mode");
el2.addEventListener("click",night-mode);
function night-mode();{
    let el=document.getElementsByTagName("body");
    el[0].classList.add("night-mode");

}**/
       window.addEventListener("DOMContentLoaded", function () {
    let btn1 = document.getElementById("btn-1");
    let el = document.getElementById("techparent");

    btn1.addEventListener("mouseover", changeBackground);

    function changeBackground() {
        el.style.color = "blue";
        el.style.backgroundColor = "lightgrey";
    }
});
/**
let evaLink=document.getElementById("customLink");
console.log(evaLink);
evaLink.addEventListener("click",function(e){
    e.preventDefault();//default action yeneberu maletm wede website endaymeran kefelegn ena just hello world bcha blo zm endil snfelg
    evaLink.textContent="Hello world";//heden click snadergew hellow world endilen

})
var errors=[];
var elerrorsDisplay=document.getElementById("errors-display");
elerrorsDisplay.innerHTML="";
var elPassword=document.getElementsByName("password");
var elFirstName=document.getElementsByName("first-name");
var elFirstNameValue=el[0].value;
var elPasswordValue=elPassword[0].value;
if(!elFirstNameValue){
    errors.push("first name is required");
}
if(!elPasswordValue){
    errors.push("password is empty")
}
else if(elPasswordValue.length<5){
    errors.push("Password is not strong enough");
}
else{
    if(errors.length>0){
        e.preventDefault();
        elerrorsDisplay.style.display="block";
        for(var i=0;i<errrors.length;i++){
            elerrorsDisplay.innerHTML+=errrors[i]+"<br>";
        }
        }
    }
    


else{
    alert("Submitted");
}
let myinput=document.querySelectorAll("#registration");
console.log(myinput);
function checkValidity(e){
    console.log("Form Submission");
    let myinput
}
     */
    let myform=document.getElementById("form-id");
    function checkValidity(e){
        e.preventDefault();
        console.log("Form submission");
        let myinput=document.querySelectorAll("#form-id input");//form-id  wst yalu hulunm input endigebaln
        console.log(myinput);
        myinput[0].style.backgroundColor="";
        myinput[1].style.backgroundColor="";
        if(myinput[0].value.length ==0){
            alert("First name is required please enter the first name");
            myinput[0].style.backgroundColor="pink";
        }
        if(myinput[1].value.length ==0){
           alert("last name is required please enter the last name");
            myinput[1].style.backgroundColor="pink";
        }
         if(myinput[2].value.length ==0){
            alert("password is required please enter the password");
            myinput[2].style.backgroundColor="pink";
        }
        if(myinput[0].value.length!==0 && myinput[1].value.length!==0 && myinput[2].value.length!==0){
            let output=myinput[0].value+" "+ myinput[1].value ;//mulu smu band lay enditsafln
            alert("Thanks Form submitted");
           let result=document.getElementById("result");
           result.textContent=output;
        }
        


    
   
    }
     myform.addEventListener("submit",checkValidity);

     

let div1 = document.getElementById("div-1");
let div2 = document.getElementById("div-2");

div1.addEventListener("click", () => {
  alert("Div 1 is clicked"); // ← semicolon added here
});

div2.addEventListener("click", (e) => {
  e.stopPropagation(); // prevents bubbling to div1
  alert("Div 2 is clicked");
});
console.log($("#one"));
var el=$("#form-id");
console.log(el);
let h1elements=$("h1");
console.log(h1elements);
var  el=$("li");
console.log(el[2]);
var firstlist=$("li:first");
console.log(firstlist);
var lastlist=$("li:last");
console.log("lastlist");
var list=$("li:nth-child(1)");
console.log(list);
var find=$("li:contains('A')");
console.log(find);

$("h1").first().css("background-color", "grey");
var tobeChanged=$("#it-is-A");
 tobeChanged.text("Changed using jQuery");
console.log( tobeChanged.text());
 tobeChanged.html("<p>Abe jQuery");
 console.log( tobeChanged.html());
 var el=$("#it-is-A");
 el.prepend("<li class='green'>Added using prepend method</li>");
 var el=$("li").css("background-color","pink"); //hulunm li tag wst yalewn merto endisera lemadreg
 $("#theList").addClass("blue lightblue unorderdlist");
 $("#theList").removeClass(" lightblue ");
 $("#div-1").attr("name","Tech Nerds");
 console.log($("input[name='first name']").val());
 console.log($.isNumeric("tsi"));
  $("input").parent().css({
    border:"5px solid red",
    backgroundColor:"aqua"
 });
 $("input").parents().css({
    border:"5px solid green",
    backgroundColor:"yellow"
 });
$("h1").css("background-color","Lightgreen");
$("form").children().css({border:"2px solid red"});
$("#changeBG").on("click",changeBackground);
function changeBackground(){
    $("body").css("background","grey");
}
$("#clickme").click(function () {
    $(this).hide();
    
});
$("#doubleclickme").dblclick(function(){
    $(this).prev().show();

})
$("#form-id").on("submit",function(e){
    e.preventDefault();
    let fname=$("input[name='first name']").val();
    let lname=$("input[name='last name']").val();
    console.log(fname);
    console.log(lname);



});
/** 
$(".fruits-menu").on("click", function() {
    var tobetoggled = $("#listoffruits");
    tobetoggled.slideToggle(); //there are also other toggling methods like fadeToggle, toggle
});
*/


var el = $("#listoffruits");

$(".fruits-menu").mouseover(function() {
    el.animate({//adis bahri lemestet
        width: "200px",
        opacity: 0.9,
        fontSize: "3em",
        borderWidth: "10px"
    }, 5000);//yihe kutr demo 2 second malet new be millisecond slemitsaf new
});
console.log("task3");
setTimeout(()=>console.log("task2"),2000);
console.log("task1");







