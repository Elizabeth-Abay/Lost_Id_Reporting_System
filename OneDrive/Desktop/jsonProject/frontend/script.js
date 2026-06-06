const choices=["rock","paper","scissors"];
const playerDisplay=document.getElementById("playerDisplay");
const computerDisplay=document.getElementById("computerDisplay");
const resultDisplay=document.getElementById("resultDisplay");
const computerscoreDisplay=document.getElementById("computerscoreDisplay");
const playerscoreDisplay=document.getElementById("playerscoreDisplay");
let playerscore=0;
let computerscore=0;
const API_URL = "http://localhost:3000/posts";

/* GET posts */
function loadPosts() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      data.forEach(post => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${post.title} ❤️ ${post.likes}
          <button onclick="likePost(${post.id}, ${post.likes})">Like</button>
          <button onclick="deletePost(${post.id})">Delete</button>
        `;
        list.appendChild(li);
      });
    });
}

/* POST */
function addPost() {
  const title = document.getElementById("title").value;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, likes: 0 })
  })
  .then(() => {
    document.getElementById("title").value = "";
    loadPosts();
  });
}

/* PATCH */
function likePost(id, likes) {
  fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ likes: likes + 1 })
  })
  .then(() => loadPosts());
}

/* DELETE */
function deletePost(id) {
  fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  })
  .then(() => loadPosts());
}

loadPosts();


function playGame(playerChoice){
    const computerChoice=choices[Math.floor(Math.random()*3)];
    let result="";
    if(playerChoice ==computerChoice){
        result="IT IS A TIE";

    }
    else{
         switch(playerChoice){
            case "rock":
                result=(computerChoice==="scissors")?"YOU WIN":"YOU LOSE";
                break;
            case "paper":
                result=(computerChoice==="rock")?"YOU WIN":"YOU LOSE"; 
                break; 
            case "scissors":
                result=(computerChoice==="paper")?"YOU WIN":"YOU LOSE";
                break;
    
 }
    }
    playerDisplay.textContent=`PLAYER :${playerChoice}`;
    computerDisplay.textContent=`Computer:${computerChoice}`;
    resultDisplay.textContent=result;
    switch (result) {
        case "YOU WIN":
            resultDisplay.classList.add("greenText");
            playerscore++;
            playerscoreDisplay.textContent=playerscore;            
            break;
    
       case "YOU LOSE!":
            resultDisplay.classList.add("redText");
            computerscore++;
            computerscoreDisplay.textContent=computerscore;

            break;
    }
   

   
}