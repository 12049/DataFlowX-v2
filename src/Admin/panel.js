// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const container = document.getElementById('container');
document.getElementById('openSidebar').addEventListener('click', ()=>{
  sidebar.classList.add('active');
  container.classList.add('shift');
});
document.getElementById('closeSidebar').addEventListener('click', ()=>{
  sidebar.classList.remove('active');
  container.classList.remove('shift');
});

// Dummy bots data
const bots = [
  {id:1,name:"Bot freddy",status:"active"},
  {id:2,name:"Bot tom",status:"disabled"},
  {id:3,name:"Bot furina",status:"dead"},
];

// Render bots
const botsGrid = document.getElementById('botsGrid');

bots.forEach(bot=>{
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div>
      <i class="fa-solid fa-robot fa-lg"></i>
      <strong>${bot.name}</strong>
      <p>Status: <span style="color:${bot.status==="active"?"#7a6c55":bot.status==="disabled"?"#9da3ae":"#ff4c4c"}">${bot.status}</span></p>
    </div>
    <div style="display:flex;gap:5px">
      <button class="disable-btn">Disable</button>
      <button class="death-btn">Death</button>
    </div>
  `;
  botsGrid.appendChild(card);
});

// Loader animation with GSAP
function showLoader(text="Loading..."){
  const overlay = document.getElementById('loaderOverlay');
  const card = document.getElementById('loaderCard');
  overlay.style.display="flex";
  gsap.to(card,{scale:1,duration:0.5,ease:"back.out(1.7)"});
  card.querySelector('.loaderText').innerText=text;
}
function hideLoader(){
  const overlay = document.getElementById('loaderOverlay');
  const card = document.getElementById('loaderCard');
  gsap.to(card,{scale:0,duration:0.3,ease:"back.in(1.7)",onComplete:()=>{overlay.style.display="none"}});
}

// Example buttons functionality
botsGrid.addEventListener('click', e=>{
  if(e.target.classList.contains('disable-btn')){
    showLoader("Disabling bot...");
    setTimeout(()=>hideLoader(),1000);
  }
  if(e.target.classList.contains('death-btn')){
    showLoader("Killing bot...");
    setTimeout(()=>hideLoader(),1000);
  }
});