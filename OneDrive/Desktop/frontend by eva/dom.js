const  button=document.getElementById("mybutton")
button.addEventListener("click",function(){
    button.style.backgroundColor="red"
    alert("HELLOOOW")
})
console.dir(document);
//var abebe=document.getElementById("one");
//console.log(abebe);
//console.log(abebe.className);
//abebe.className="red";
//console.log(abebe.className);
//console.log(document.querySelector("#one").className("blue"));//wede blue classname lemekeyer
//console.log(document.querySelector(".red"));
var el = document.querySelector(".yellow");
console.log(el);
var talak = el.previousElementSibling;
talak.className = "pink"; // Corrected to className
var all=document.querySelector(".yellow");
var abat=all.parentNode;
console.log(abat);
var first=document.querySelector("#listoffruits");
first.firstElementChild.className="blue"; // C
var last=document.querySelector("#listoffruits");
last.lastElementChild.className="aqua"; // Corrected to className
var el=document.getElementById("two");
console.log(el);
el.className="pink";
el.textContent="ICE CREAM";
var someparagraph=document.createElement("p");
console.log(someparagraph);
someparagraph.textContent="Tsion is SE student";
let lielem=document.createElement("li");
console.log(lielem);
let parent=document.getElementById("listoffruits");
document.body.appendChild(someparagraph);//run snadergew yefelegnew paragraph endikatet
lielem.innerHTML="<h1> HI everybody </h1> ";
parent.prepend(lielem);
let childelement=document.getElementById("two");
parent.removeChild(childelement);//mango milew yitefal
let myreference=document.getElementById("three");
myreference.after(lielem);
// myreference.before(lielem);
var tsi=document.querySelector("#four");
console.log(tsi);
tsi.classList.add("Tsion");//befit yeneberewnm yahununm class name yitekemal classList slehone in stead of className(yebefitun delete yaregewal)
parent.id="newlist";
console.log(parent.id); 
console.log(parent.hasAttribute("href"));// Check if the parent has an attribute 'href'
console.log(parent.getAttribute("type"));
let imageElement=document.createElement("img");
imageElement.setAttribute("src","https://www.w3schools.com/images/w3schools_green.jpg");
parent.appendChild(imageElement);
imageElement.setAttribute("alt","W3Schools.com");
imageElement.setAttribute("width","100%");
//changing css values with style property 
var el=document.querySelector("h1");
el.style.backgroundColor="black";
el.style.color="white";
el.style.padding="10px";
el.style.borderbottom="2px solid black";
console.log(el);

 


 





