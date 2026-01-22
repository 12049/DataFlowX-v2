// --- Toggle Cards ---
let showingLogin = true;
function toggleCard() {
  const wrapper = document.getElementById("cardWrapper");
  gsap.to(wrapper, {
    rotationY: showingLogin ? 180 : 0,
    duration: 1,
    ease: "power2.inOut"
  });
  showingLogin = !showingLogin;
}

// --- Modal Logic ---
const modalTerms = document.getElementById("modalTerms");
const modalPrivacy = document.getElementById("modalPrivacy");

function showModal(modal) {
  modal.style.display = "flex";
  gsap.from(".modal", {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    ease: "back.out(1.7)"
  });
}

document.getElementById("termsLink").onclick = (e) => {
  e.preventDefault();
  showModal(modalTerms);
};

document.getElementById("privacyLink").onclick = (e) => {
  e.preventDefault();
  showModal(modalPrivacy);
};

function closeModal(modal) {
  gsap.to(`${modal} .modal`, {
    scale: 0,
    opacity: 0,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      modal.style.display = "none";
      gsap.set(`${modal} .modal`, { scale: 1, opacity: 1 });
    }
  });
}

document.getElementById("closeTerms").onclick = () => closeModal(modalTerms);
document.getElementById("closePrivacy").onclick = () => closeModal(modalPrivacy);

modalTerms.onclick = (e) => {
  if (e.target === modalTerms) closeModal(modalTerms);
};
modalPrivacy.onclick = (e) => {
  if (e.target === modalPrivacy) closeModal(modalPrivacy);
};

// --- FAQ Toggle ---
document.querySelectorAll(".faq-question").forEach(q => {
  q.addEventListener("click", () => {
    q.classList.toggle("active");
    const answer = q.nextElementSibling;
    if (answer.style.display === "block") {
      gsap.to(answer, {
        height: 0,
        duration: 0.3,
        onComplete: () => answer.style.display = "none"
      });
    } else {
      answer.style.display = "block";
      gsap.from(answer, { height: 0, duration: 0.3 });
    }
  });
});

// --- Email Validation ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Error Animation ---
function showError(element, message) {
  element.innerText = message;
  gsap.set(element, { x: 200, opacity: 1 });
  gsap.to(element, {
    duration: 0.5,
    x: 0,
    ease: "power3.out",
    onComplete: () => {
      gsap.fromTo(element, { x: -5 }, {
        x: 5,
        duration: 0.05,
        repeat: 5,
        yoyo: true
      });
    }
  });
}

// --- Success Card ---
function showSuccessCard(message) {
  const card = document.createElement("div");
  card.style.position = "fixed";
  card.style.top = "50%";
  card.style.left = "50%";
  card.style.transform = "translate(-50%,-50%)";
  card.style.background = "#4caf50";
  card.style.borderRadius = "20px";
  card.style.padding = "30px 40px";
  card.style.color = "#fff";
  card.style.textAlign = "center";
  card.style.zIndex = 9999;
  card.style.boxShadow = "0 20px 50px rgba(0,0,0,0.6)";
  card.innerText = message;

  document.body.appendChild(card);

  gsap.from(card, {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    ease: "back.out(1.7)"
  });

  setTimeout(() => {
    gsap.to(card, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      onComplete: () => card.remove()
    });
  }, 1200);
}

// --- Phone Cleaning ---
const regPhoneInput = document.getElementById("regPhone");
const countryCodeSelect = document.getElementById("countryCode");

regPhoneInput.addEventListener("input", () => {
  let value = regPhoneInput.value.replace(/\s+/g, '');
  if (value.startsWith(countryCodeSelect.value))
    value = value.slice(countryCodeSelect.value.length);
  if (value.startsWith('+')) value = value.slice(1);
  regPhoneInput.value = value;
});

// --- Login Form ---
document.getElementById("loginForm").onsubmit = function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");

  if (!email) return showError(error, "✖ Please enter your email");
  if (!validateEmail(email)) return showError(error, "✖ Invalid email");
  if (!pass) return showError(error, "✖ Please enter password");

  fetch("https://blackwave-api.vercel.app/api/v2/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pass })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        showSuccessCard("Logged in successfully!");
        setTimeout(() => {
          window.location.href = "/home";
        }, 1300);
      } else {
        showError(error, data.error || "Login failed");
      }
    })
    .catch(() => showError(error, "✖ Error connecting to server"));
};

// --- Register Form ---
document.getElementById("registerForm").onsubmit = function (e) {
  e.preventDefault();

  const uname = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  let phone = document.getElementById("regPhone").value.trim();
  const pass = document.getElementById("regPassword").value.trim();
  const code = countryCodeSelect.value;
  const error = document.getElementById("regError");

  phone = phone.replace(/\s+/g, '');
  if (phone.startsWith(code)) phone = phone.slice(code.length);
  if (phone.startsWith('+')) phone = phone.slice(1);

  if (!uname) return showError(error, "✖ Username required");
  if (!email || !validateEmail(email)) return showError(error, "✖ Invalid email");
  if (!/^\d{7,15}$/.test(phone)) return showError(error, "✖ Invalid phone");
  if (!pass) return showError(error, "✖ Password required");

  fetch("https://blackwave-api.vercel.app/api/v2/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: uname,
      email,
      phone: code + phone,
      password: pass
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        showSuccessCard("Account created successfully!");
        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      } else {
        showError(error, data.error || "Register failed");
      }
    })
    .catch(() => showError(error, "✖ Error connecting to server"));
};
