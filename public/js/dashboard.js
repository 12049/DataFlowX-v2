
/* =======================
   Initialization
======================= */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations and effects
  initUserData();
  initSidebar();
  initNotifications();
  initStats();
  initCodeTabs();
  initParticles();
  initThreeJSBackground();
  initLoader();
  initHoverEffects();
  initMenuVisibility();
});

/* =======================
   User Data & Session
======================= */
function initUserData() {
  // حاول الحصول على بيانات المستخدم من localStorage
  let storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser) {
    // إذا لم يوجد، أنشئ مستخدم افتراضي
    storedUser = {
      username: 'Admin',
      id: 'ADMIN-001',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0a0c10&color=b8a074&bold=true'
    };
    localStorage.setItem("user", JSON.stringify(storedUser));
  }

  // تحديث واجهة المستخدم
  document.getElementById('username').textContent = storedUser.username || 'User';
  document.getElementById('userid').textContent = `ID: ${storedUser.id || 'USER-000'}`;
  document.getElementById('userRole').textContent = storedUser.role?.toUpperCase() || 'USER';

  const welcomeTitle = document.getElementById('welcomeTitle');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome Back, ${storedUser.username || 'User'}!`;
  }

  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar && storedUser.avatar) {
    userAvatar.src = storedUser.avatar;
  }
}
/* =======================
   Sidebar & Navigation
======================= */
function initSidebar() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const mainContainer = document.getElementById('mainContainer');
  const closeBtn = document.getElementById('closeSidebar');
  const dashboardBtn = document.getElementById('dashboardBtn');

  // Toggle sidebar
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mainContainer.classList.toggle('shift');
    
    // GSAP animation for menu button
    gsap.to(menuBtn, {
      rotation: sidebar.classList.contains('active') ? 90 : 0,
      duration: 0.3,
      ease: "back.out(1.2)"
    });
  });

  // Close sidebar
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    mainContainer.classList.remove('shift');
    gsap.to(menuBtn, { rotation: 0, duration: 0.3 });
  });

  // Dashboard button
  dashboardBtn.addEventListener('click', () => {
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to dashboard
    dashboardBtn.classList.add('active');
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      sidebar.classList.remove('active');
      mainContainer.classList.remove('shift');
    }
  });

  // Submenu toggle
  document.querySelectorAll('.menu-item[data-target]').forEach(item => {
    const target = document.getElementById(item.dataset.target);
    const arrow = item.querySelector('.arrow');
    
    item.addEventListener('click', () => {
      const isOpen = target.style.maxHeight && target.style.maxHeight !== "0px";

      // Close other submenus
      document.querySelectorAll('.submenu').forEach(s => {
        if (s !== target) {
          s.style.maxHeight = null;
          const parent = s.parentElement.querySelector('.menu-item');
          if (parent) {
            gsap.to(parent.querySelector('.arrow'), { rotation: 0, duration: 0.3 });
          }
        }
      });

      // Toggle current submenu
      if (!isOpen) {
        target.style.maxHeight = target.scrollHeight + "px";
        gsap.to(arrow, { rotation: 180, duration: 0.3 });
      } else {
        target.style.maxHeight = null;
        gsap.to(arrow, { rotation: 0, duration: 0.3 });
      }
    });
  });

  // Menu item click effects
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      if (!this.dataset.target) {
        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(el => {
          el.classList.remove('active');
        });
        
        // Add active class to clicked item
        this.classList.add('active');
      }
    });
  });
}

/* =======================
   Notifications Panel
======================= */
function initNotifications() {
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsPanel = document.getElementById('notificationsPanel');
  const closeNotifications = document.getElementById('closeNotifications');
  const notificationBadge = document.querySelector('.notification-badge');

  // Toggle notifications panel
  notificationsBtn.addEventListener('click', () => {
    notificationsPanel.classList.toggle('active');
    
    // Hide badge when panel is opened
    if (notificationsPanel.classList.contains('active')) {
      notificationBadge.style.display = 'none';
      
      // GSAP animation
      gsap.fromTo(notificationsPanel, 
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  });

  // Close notifications panel
  closeNotifications.addEventListener('click', () => {
    notificationsPanel.classList.remove('active');
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!notificationsPanel.contains(e.target) && 
        !notificationsBtn.contains(e.target) &&
        notificationsPanel.classList.contains('active')) {
      notificationsPanel.classList.remove('active');
    }
  });
}

/* =======================
   Platform Stats & API Counts
======================= */

function initStats() {
  // Simulate online users count
  let onlineCount = 342;
  const onlineSpan = document.getElementById('onlineCount');

  if(onlineSpan){
    setInterval(() => {
      const change = Math.floor(Math.random() * 7) - 3;
      onlineCount += change;
      if (onlineCount < 300) onlineCount = 300 + Math.floor(Math.random() * 50);  
      if (onlineCount > 400) onlineCount = 400 - Math.floor(Math.random() * 50);  
      gsap.to(onlineSpan, {  
        innerText: onlineCount,  
        duration: 0.5,  
        snap: { innerText: 1 },  
        ease: "power1.out"  
      });
    }, 3000);
  }

  async function updateAPICounts() {
    try {
      const res = await fetch("https://blackwave-api.vercel.app/api/v1");
      const data = await res.json();

      if (!data.docs) throw new Error("No docs found");

      const apiSections = ['ai', 'search', 'download', 'tools', 'games', 'islamic'];
      let totalGET = 0;

      apiSections.forEach(section => {
        const element = document.querySelector(`.api-count[data-section="${section}"]`);
        const count = data.docs[section] && Array.isArray(data.docs[section]) ? data.docs[section].length : 0;

        if (element) {
          gsap.to(element, {
            innerText: count,
            duration: 1,
            delay: 0.5,
            snap: { innerText: 1 },
            ease: "power2.out"
          });
        }

        if (data.docs[section] && Array.isArray(data.docs[section])) {
          totalGET += data.docs[section].filter(api => api.method === "GET").length;
        }
      });

      const totalSpan = document.getElementById("apiGetCount");
      if (totalSpan) {
        gsap.to(totalSpan, {
          innerText: totalGET,
          duration: 1.5,
          delay: 0.7,
          snap: { innerText: 1 },
          ease: "elastic.out(1, 0.5)"
        });
      }

    } catch (err) {
      console.error("Error fetching platform stats:", err);
      document.querySelectorAll('.api-count').forEach(span => span.innerText = 0);
      const totalSpan = document.getElementById("apiGetCount");
      if(totalSpan) totalSpan.innerText = 0;
    }
  }

  updateAPICounts();
  setInterval(updateAPICounts, 10000);
}



/* =======================
   Particles Background
======================= */
function initParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random properties
    const size = Math.random() * 3 + 1;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 10;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    
    // Add to container
    particlesContainer.appendChild(particle);
    
    // Animate
    gsap.to(particle, {
      x: `+=${(Math.random() - 0.5) * 100}`,
      y: `+=${(Math.random() - 0.5) * 100}`,
      duration: duration,
      delay: delay,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
}

/* =======================
   Three.js Background
======================= */
function initThreeJSBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  
  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Create floating geometry
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0xb8a074,
    wireframe: true,
    transparent: true,
    opacity: 0.05
  });
  
  const objects = [];
  const objectCount = 8;
  
  for (let i = 0; i < objectCount; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    
    // Random position
    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.y = (Math.random() - 0.5) * 20;
    mesh.position.z = (Math.random() - 0.5) * 10;
    
    // Random scale
    const scale = Math.random() * 0.5 + 0.2;
    mesh.scale.set(scale, scale, scale);
    
    // Random rotation speed
    mesh.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005
      },
      floatSpeed: Math.random() * 0.002 + 0.001,
      floatDirection: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      )
    };
    
    scene.add(mesh);
    objects.push(mesh);
  }
  
  camera.position.z = 15;
  
  // Animation
  function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach(obj => {
      // Rotation
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;
      
      // Floating movement
      obj.position.x += obj.userData.floatDirection.x;
      obj.position.y += obj.userData.floatDirection.y;
      obj.position.z += obj.userData.floatDirection.z;
      
      // Boundary check
      if (Math.abs(obj.position.x) > 12) obj.userData.floatDirection.x *= -1;
      if (Math.abs(obj.position.y) > 12) obj.userData.floatDirection.y *= -1;
      if (Math.abs(obj.position.z) > 8) obj.userData.floatDirection.z *= -1;
    });
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* =======================
   Loader Animation
======================= */
function initLoader() {
  const loaderOverlay = document.getElementById('loaderOverlay');
  const loaderCard = document.getElementById('loaderCard');
  
  // Show loader on page load
  loaderOverlay.classList.add('active');
  gsap.fromTo(loaderCard, 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
  );
  
  // Hide loader after 1.5 seconds
  setTimeout(() => {
    gsap.to(loaderCard, {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        loaderOverlay.classList.remove('active');
      }
    });
  }, 1500);
  
  // Show loader before page unload
  window.addEventListener('beforeunload', () => {
    loaderOverlay.classList.add('active');
    gsap.to(loaderCard, { scale: 1, opacity: 1, duration: 0.3 });
  });
}

/* =======================
   Hover Effects
======================= */
function initHoverEffects() {
  // Card hover effects
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Glow effect
      const glow = document.createElement('div');
      glow.style.position = 'absolute';
      glow.style.top = '0';
      glow.style.left = '0';
      glow.style.width = '100%';
      glow.style.height = '100%';
      glow.style.borderRadius = '18px';
      glow.style.background = 'radial-gradient(circle at center, rgba(184,160,116,0.1) 0%, transparent 70%)';
      glow.style.pointerEvents = 'none';
      glow.style.zIndex = '-1';
      card.appendChild(glow);
      
      gsap.fromTo(glow,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Remove glow
      const glow = card.querySelector('div:last-child');
      if (glow) {
        gsap.to(glow, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => glow.remove()
        });
      }
    });
  });
  
  // Button hover effects
  document.querySelectorAll('button, .tab, .menu-item').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      });
    });
    
    btn.addEventListener('mouseleave', function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    });
  });
}

/* =======================
   Admin Menu Visibility
======================= */
function initMenuVisibility() {
  const adminSection = document.getElementById('adminSection');
  if (!adminSection) return; // لو العنصر مش موجود، نخرج

  // جلب بيانات المستخدم من localStorage
  const userData = JSON.parse(localStorage.getItem("user"));

  // إظهار قسم الإدارة فقط للمستخدمين بصلاحية admin أو owner
  if (userData && (userData.role === 'admin' || userData.role === 'owner')) {
    adminSection.style.display = 'block';
  } else {
    adminSection.style.display = 'none';
  }
}

// نفّذ الدالة بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', initMenuVisibility);
/* =======================
   Real-time Updates
======================= */
function simulateRealTimeUpdates() {
  // Simulate API response times
  setInterval(() => {
    const cards = document.querySelectorAll('.card .card-value');
    cards.forEach(card => {
      const current = parseInt(card.textContent);
      if (!isNaN(current)) {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newValue = Math.max(0, current + change);
        
        if (change !== 0) {
          // Animate the change
          gsap.to(card, {
            innerText: newValue,
            duration: 0.5,
            snap: { innerText: 1 },
            ease: "power1.out",
            onStart: () => {
              card.style.color = change > 0 ? 'var(--success)' : 'var(--danger)';
            },
            onComplete: () => {
              gsap.to(card, {
                color: 'var(--accent)',
                duration: 0.5
              });
            }
          });
        }
      }
    });
  }, 10000);
}

// Start real-time updates after a delay
setTimeout(simulateRealTimeUpdates, 5000);
