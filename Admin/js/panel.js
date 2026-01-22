// ======================
// Real-Time SSE
// ======================
const onlineCountEl = document.getElementById('onlineCount');
const newUsersEl = document.getElementById('newUsers');
const lastRequestsEl = document.getElementById('lastRequests'); // for last requests if needed

// Open EventSource
const es = new EventSource("https://blackwave-api.vercel.app/api/v2/admin/realtime");

es.onopen = () => {
  console.log("Connected to Real-Time API");
};

es.onmessage = (e) => {
  const data = JSON.parse(e.data);

  // ===== Online Users Update =====
  if (data.type === "ONLINE_UPDATE" || data.type === "CONNECTED") {
    onlineCountEl.innerText = data.online;
  }

  // ===== New Registered User =====
  if (data.type === "NEW_REGISTER") {
    const div = document.createElement('div');
    div.classList.add('new-user-entry');
    div.innerHTML = `
      <div class="loaderCircle small"></div>
      <strong>${data.user}</strong> (${data.email})
    `;
    newUsersEl.prepend(div);

    // Loader animation inside the card
    const loader = div.querySelector('.loaderCircle');
    gsap.fromTo(loader, {rotation:0}, {rotation:360, duration:1, repeat:-1, ease:"linear"});

    // Highlight effect then remove loader after 2 seconds
    div.style.background = "rgba(255,255,255,0.1)";
    setTimeout(()=>{
      div.style.background = "transparent";
      loader.remove();
    }, 2000);
  }

  // ===== Last Requests (optional) =====
  if(data.type === "NEW_REQUEST") {
    const div = document.createElement('div');
    div.classList.add('request-entry');
    div.innerText = `${data.user} => ${data.endpoint}`;
    lastRequestsEl.prepend(div);

    // Quick highlight
    div.style.background = "rgba(255,255,255,0.1)";
    setTimeout(()=>{ div.style.background = "transparent"; }, 2000);
  }
};

// ======================
// Sidebar Toggle
// ======================
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

// ======================
// Loader Animation with GSAP
// ======================
function showLoader(text="Loading..."){
  const overlay = document.getElementById('loaderOverlay');
  const card = document.getElementById('loaderCard');
  overlay.style.display="flex";
  gsap.to(card, {scale:1, duration:0.5, ease:"back.out(1.7)"});
  card.querySelector('.loaderText').innerText = text;
}

function hideLoader(){
  const overlay = document.getElementById('loaderOverlay');
  const card = document.getElementById('loaderCard');
  gsap.to(card, {scale:0, duration:0.3, ease:"back.in(1.7)", onComplete:()=>{ overlay.style.display="none"; }});
}

// ======================
// Example Buttons Functionality
// ======================
const botsGrid = document.querySelector('.dashboard-grid'); // make sure this class exists

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