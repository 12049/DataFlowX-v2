// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");
const errorText = document.getElementById("errorText");
const loader = document.getElementById("loaderOverlay");
const userIdInput = document.getElementById("userId");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

// Toggle Password Visibility
togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

// Input Validation
function validateInputs() {
  let isValid = true;
  
  // Clear previous error states
  userIdInput.classList.remove("error", "success");
  passwordInput.classList.remove("error", "success");
  errorMsg.style.display = "none";
  
  // Validate User ID
  if (!userIdInput.value.trim()) {
    userIdInput.classList.add("error");
    isValid = false;
  } else {
    userIdInput.classList.add("success");
  }
  
  // Validate Password
  if (!passwordInput.value.trim()) {
    passwordInput.classList.add("error");
    isValid = false;
  } else {
    passwordInput.classList.add("success");
  }
  
  return isValid;
}

// Show Error Message
function showError(message) {
  errorText.textContent = message;
  errorMsg.style.display = "flex";
  
  // Auto-hide error after 5 seconds
  setTimeout(() => {
    errorMsg.style.display = "none";
  }, 5000);
}

// Show Success State
function showSuccess() {
  userIdInput.classList.add("success");
  passwordInput.classList.add("success");
}

// Login Function
async function login() {
  if (!validateInputs()) {
    showError("Please fill in all required fields");
    return;
  }

  const id = userIdInput.value.trim();
  const pass = passwordInput.value.trim();

  // Show loader
  loader.style.display = "flex";
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Authenticating...</span>';

  try {
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const res = await fetch(`https://blackwave-api.vercel.app/get-user?id=${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();

    if (!data.success || !data.user) {
      throw new Error("Invalid user credentials");
    }

    const role = data.user.role?.toLowerCase();
    const username = data.user.username || "Administrator";

    if (role === "admin" || role === "owner") {
      // Show success state
      showSuccess();
      
      // Success message
      errorMsg.style.display = "flex";
      errorMsg.style.background = "rgba(92, 219, 149, 0.1)";
      errorMsg.style.borderColor = "var(--success)";
      errorText.innerHTML = `<i class="fas fa-check-circle"></i> Welcome back, ${username}. Redirecting...`;
      errorText.style.color = "var(--success)";
      
      // Store user data in localStorage for session
      localStorage.setItem("user", JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        timestamp: Date.now()
      }));
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = "https://blackwave-api.vercel.app/admin/panel";
      }, 1500);
      
    } else {
      showError("Access Denied — Insufficient permissions. This portal is restricted to administrators only.");
    }

  } catch (error) {
    console.error("Login error:", error);
    
    if (error.message.includes("HTTP")) {
      showError("Network Error — Unable to reach authentication server");
    } else if (error.message.includes("Invalid")) {
      showError("Authentication Failed — Invalid credentials or user not found");
    } else {
      showError("System Error — Please try again or contact support");
    }
    
    // Clear password field on error
    passwordInput.value = "";
    passwordInput.focus();
    
  } finally {
    // Hide loader and reset button
    loader.style.display = "none";
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Authenticate</span>';
  }
}

// Event Listeners
loginBtn.addEventListener("click", login);

// Allow Enter key to submit
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    login();
  }
});

// Input field focus effects
[userIdInput, passwordInput].forEach(input => {
  input.addEventListener("focus", () => {
    input.classList.remove("error");
  });
  
  input.addEventListener("input", () => {
    if (input.value.trim()) {
      input.classList.remove("error");
    }
  });
});

// Initial focus
window.addEventListener("load", () => {
  userIdInput.focus();
});
