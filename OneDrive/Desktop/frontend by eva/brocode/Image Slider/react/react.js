// const ulelement=React.createElement(
//     "ul",null,
//     React.createElement("li",null,"Abebe"),
//     React.createElement("li",null,"kebede"),
//     React.createElement("li",null,"Almaz")

// );
// console.log(ulelement)\
const root=ReactDOM.createRoot(document.getElementById("my-container"));
let fruits =["Banana","Mango","Pineapple"];
let x=0;
setInterval(()=>{
    fruits[0]=x%2==0? React.createElement("li",{class:"orange"},"orange"):
    React.createElement("li",{class:"yellow"},"Banana");
const test=React.createElement(
    "ul",null,fruits[0],React.createElement("li",null,fruits[1]),React.createElement("li",null,fruits[2])

);
root.render(test);
x++;

},3000);

