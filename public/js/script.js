// GSAP Animations
gsap.utils.toArray(".card").forEach(card=>{
  gsap.from(card,{
    scrollTrigger:{trigger:card,start:"top 85%"},
    opacity:0,y:40,duration:.8
  })
});

// Accordion
document.querySelectorAll(".accordion").forEach(acc=>{
  acc.onclick=()=>{
    acc.classList.toggle("active");
    let panel=acc.nextElementSibling;
    panel.style.maxHeight=panel.style.maxHeight?null:panel.scrollHeight+"px";
  }
});

// Theme toggle
document.getElementById("theme").onclick=()=>{
  document.body.classList.toggle("light");
};

// Hover effect GSAP for login button
const loginBtn = document.querySelector(".actions button:first-child");
loginBtn.addEventListener("mouseenter", () => {
  gsap.to(loginBtn, {scale:1.05, duration:0.3});
});
loginBtn.addEventListener("mouseleave", () => {
  gsap.to(loginBtn, {scale:1, duration:0.3});
});