// SPACED - Space Travel & YOLO Detection System
// Global variables and configuration
const DETECTION_CLASSES = [
  {id: 0, name: "OxygenTank", icon: "🫁", color: "#00ff88", sound: "oxygen-detected"},
  {id: 1, name: "NitrogenTank", icon: "🧪", color: "#ff6b6b", sound: "nitrogen-detected"},
  {id: 2, name: "FirstAidBox", icon: "🏥", color: "#4ecdc4", sound: "firstaid-detected"},
  {id: 3, name: "FireAlarm", icon: "🚨", color: "#ff9ff3", sound: "firealarm-detected"},
  {id: 4, name: "SafetySwitchPanel", icon: "🔘", color: "#54a0ff", sound: "switch-detected"},
  {id: 5, name: "EmergencyPhone", icon: "📞", color: "#5f27cd", sound: "phone-detected"},
  {id: 6, name: "FireExtinguisher", icon: "🧯", color: "#ff9f43", sound: "extinguisher-detected"}
];

let cameraStream = null;
let detectionActive = false;
let audioEnabled = true;
let detectionHistory = [];
let animationFrameId = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing SPACED application...');
  
  // Initialize all components
  initializeAnimations();
  initializeNavigation();
  initializeDetectionSystem();
  initializeForms();
  initializeFAQ();
  initializeScrollAnimations();
  populateDetectionClasses();
  
  console.log('SPACED application initialized successfully');
});

// Hero Section Animations using Anime.js
function initializeAnimations() {
  // Wait a bit for the page to fully load
  setTimeout(() => {
    // Animate hero title lines with stagger effect
    if (typeof anime !== 'undefined') {
      anime.timeline()
        .add({
          targets: '.title-line',
          opacity: [0, 1],
          translateY: [50, 0],
          delay: anime.stagger(200, {start: 500}),
          duration: 800,
          easing: 'easeOutExpo'
        })
        .add({
          targets: '.hero-description',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutExpo'
        }, '-=400')
        .add({
          targets: '.hero-actions',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutExpo'
        }, '-=400')
        .add({
          targets: '.hero-features',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutExpo'
        }, '-=400')
        .add({
          targets: '.astronaut-container',
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 800,
          easing: 'easeOutElastic(1, .8)'
        }, '-=600');

      // Floating planets animation
      anime({
        targets: '.planet',
        translateY: ['-10px', '10px'],
        duration: 4000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
        delay: anime.stagger(500)
      });
    }
    
    // Initialize stats counter animation
    animateStatsCounters();
  }, 100);

  // Navigation scroll effect
  window.addEventListener('scroll', handleNavbarScroll);
}

function animateStatsCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
          const finalValue = stat.textContent;
          if (finalValue.includes('%')) {
            animateNumber(stat, 0, parseInt(finalValue), '%');
          } else if (finalValue.includes('+')) {
            animateNumber(stat, 0, parseInt(finalValue), '+');
          } else {
            stat.textContent = finalValue;
            if (typeof anime !== 'undefined') {
              anime({
                targets: stat,
                scale: [0.5, 1],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutElastic(1, .8)'
              });
            }
          }
        });
        observer.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('.about-stats').forEach(stats => {
    observer.observe(stats);
  });
}

function animateNumber(element, start, end, suffix = '') {
  if (typeof anime !== 'undefined') {
    anime({
      targets: { value: start },
      value: end,
      duration: 2000,
      easing: 'easeOutExpo',
      update: function() {
        element.textContent = Math.round(this.targets[0].value) + suffix;
      }
    });
  } else {
    element.textContent = end + suffix;
  }
}

function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(12, 12, 12, 0.98)';
      navbar.style.backdropFilter = 'blur(30px)';
    } else {
      navbar.style.background = 'rgba(12, 12, 12, 0.95)';
      navbar.style.backdropFilter = 'blur(20px)';
    }
  }
}

// Navigation System
function initializeNavigation() {
  console.log('Initializing navigation...');
  
  const navLinks = document.querySelectorAll('.nav-link');
  const ctaBtn = document.getElementById('ctaBtn');
  const demoBtn = document.getElementById('demoBtn');
  
  // Setup navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      scrollToSection(targetId);
    });
  });

  // Setup CTA buttons
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection('booking');
      showNotification('🚀 Ready to book your space journey!', 'success');
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection('detection');
      showNotification('🤖 Try our AI detection system!', 'info');
    });
  }

  // Setup pricing card selections
  const pricingSelects = document.querySelectorAll('.pricing-select');
  pricingSelects.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mission = btn.dataset.mission;
      scrollToSection('booking');
      
      // Pre-select mission in form
      setTimeout(() => {
        const missionSelect = document.getElementById('mission');
        if (missionSelect && mission) {
          missionSelect.value = mission;
          showNotification(`🚀 Selected ${mission} mission! Please complete the booking form.`, 'success');
        }
      }, 500);
    });
  });

  console.log('Navigation initialized');
}

// Smooth scrolling function with anime.js
function scrollToSection(targetId) {
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    const offsetTop = targetSection.offsetTop - 80;
    
    if (typeof anime !== 'undefined') {
      anime({
        targets: document.scrollingElement || document.documentElement,
        scrollTop: offsetTop,
        duration: 1000,
        easing: 'easeInOutQuart'
      });
    } else {
      // Fallback smooth scroll
      targetSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}

// Detection System
function initializeDetectionSystem() {
  console.log('Initializing detection system...');
  
  const startCameraBtn = document.getElementById('startCameraBtn');
  const uploadImageBtn = document.getElementById('uploadImageBtn');
  const audioToggle = document.getElementById('audioToggle');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const imageUpload = document.getElementById('imageUpload');

  // Setup event listeners
  if (startCameraBtn) {
    startCameraBtn.addEventListener('click', toggleCamera);
  }
  
  if (uploadImageBtn) {
    uploadImageBtn.addEventListener('click', () => {
      if (imageUpload) {
        imageUpload.click();
      }
    });
  }
  
  if (audioToggle) {
    audioToggle.addEventListener('change', toggleAudio);
  }
  
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }
  
  if (imageUpload) {
    imageUpload.addEventListener('change', handleImageUpload);
  }

  // Initialize audio system
  initializeAudioSystem();
  
  console.log('Detection system initialized');
}

async function toggleCamera() {
  console.log('Camera toggle requested');
  
  const startBtn = document.getElementById('startCameraBtn');
  const video = document.getElementById('cameraVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const canvas = document.getElementById('detectionCanvas');

  if (!detectionActive) {
    try {
      // Update button state
      if (startBtn) {
        startBtn.innerHTML = '<span class="btn-icon">⏳</span>Starting...';
        startBtn.disabled = true;
      }

      // Request camera access
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        }
      });

      console.log('Camera access granted');

      // Setup video stream
      if (video) {
        video.srcObject = cameraStream;
        video.style.display = 'block';
      }
      
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      // Setup canvas
      if (canvas) {
        canvas.width = 640;
        canvas.height = 480;
        canvas.style.display = 'block';
      }

      detectionActive = true;
      
      if (startBtn) {
        startBtn.innerHTML = '<span class="btn-icon">⏹️</span>Stop Camera';
        startBtn.disabled = false;
      }
      
      // Start detection loop
      startDetectionLoop();
      showNotification('📹 Camera started! Detection is now active.', 'success');
      
    } catch (error) {
      console.error('Camera access error:', error);
      showNotification('❌ Camera access denied. Please allow camera permissions and try again.', 'error');
      
      if (startBtn) {
        startBtn.innerHTML = '<span class="btn-icon">📹</span>Start Camera';
        startBtn.disabled = false;
      }
    }
  } else {
    stopCamera();
  }
}

function stopCamera() {
  console.log('Stopping camera');
  
  const startBtn = document.getElementById('startCameraBtn');
  const video = document.getElementById('cameraVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const canvas = document.getElementById('detectionCanvas');

  // Stop camera stream
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  // Stop detection loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Reset UI
  if (video) video.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';
  if (canvas) canvas.style.display = 'none';
  
  detectionActive = false;
  
  if (startBtn) {
    startBtn.innerHTML = '<span class="btn-icon">📹</span>Start Camera';
  }
  
  clearDetectionStats();
  showNotification('⏹️ Camera stopped.', 'info');
}

function startDetectionLoop() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('detectionCanvas');
  
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');

  function detect() {
    if (!detectionActive || !video || !video.videoWidth) {
      if (detectionActive) {
        animationFrameId = requestAnimationFrame(detect);
      }
      return;
    }

    // Simulate detection every 2-3 seconds with random chance
    if (Math.random() < 0.02) { // ~2% chance per frame at 60fps = ~1 detection every 1-2 seconds
      const detections = generateRandomDetections();
      if (detections.length > 0) {
        drawDetections(ctx, detections, canvas.width, canvas.height);
        updateDetectionStats(detections);
        addToHistory(detections);
        
        if (audioEnabled) {
          playDetectionAlerts(detections);
        }
      }
    }

    animationFrameId = requestAnimationFrame(detect);
  }

  detect();
}

function generateRandomDetections() {
  const numDetections = Math.floor(Math.random() * 3) + 1; // 1-3 detections
  const detections = [];
  
  for (let i = 0; i < numDetections; i++) {
    const classId = Math.floor(Math.random() * DETECTION_CLASSES.length);
    const confidence = 0.75 + Math.random() * 0.20; // 0.75 - 0.95
    
    // Generate realistic bounding box
    const x = Math.random() * 0.6; // 0-60% from left
    const y = Math.random() * 0.6; // 0-60% from top
    const w = 0.15 + Math.random() * 0.25; // 15-40% width
    const h = 0.15 + Math.random() * 0.25; // 15-40% height
    
    detections.push({
      class: classId,
      confidence: confidence,
      bbox: [x, y, Math.min(w, 1 - x), Math.min(h, 1 - y)]
    });
  }
  
  return detections;
}

function drawDetections(ctx, detections, canvasWidth, canvasHeight) {
  // Clear previous detections
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  detections.forEach((detection, index) => {
    const classInfo = DETECTION_CLASSES[detection.class];
    const [x, y, w, h] = detection.bbox;
    
    // Convert to canvas coordinates
    const canvasX = x * canvasWidth;
    const canvasY = y * canvasHeight;
    const canvasW = w * canvasWidth;
    const canvasH = h * canvasHeight;
    
    // Draw bounding box with glow effect
    ctx.shadowColor = classInfo.color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = classInfo.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(canvasX, canvasY, canvasW, canvasH);
    
    // Draw label background
    const label = `${classInfo.name} ${Math.round(detection.confidence * 100)}%`;
    ctx.font = 'bold 14px Inter, sans-serif';
    const metrics = ctx.measureText(label);
    const textWidth = metrics.width;
    const textHeight = 20;
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = classInfo.color;
    ctx.fillRect(canvasX, canvasY - textHeight - 4, textWidth + 12, textHeight + 4);
    
    // Draw label text
    ctx.fillStyle = '#000000';
    ctx.fillText(label, canvasX + 6, canvasY - 8);
    
    // Add pulsing animation effect
    if (typeof anime !== 'undefined') {
      setTimeout(() => {
        anime({
          targets: ctx.canvas,
          opacity: [0.8, 1],
          duration: 300,
          easing: 'easeOutQuart'
        });
      }, index * 100);
    }
  });
}

function updateDetectionStats(detections) {
  const objectCount = document.getElementById('objectCount');
  const avgConfidence = document.getElementById('avgConfidence');
  
  if (objectCount && avgConfidence) {
    objectCount.textContent = detections.length;
    
    const avgConf = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
    avgConfidence.textContent = Math.round(avgConf * 100) + '%';
    
    // Animate the stats update
    if (typeof anime !== 'undefined') {
      anime({
        targets: [objectCount, avgConfidence],
        scale: [1.2, 1],
        duration: 300,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }
}

function addToHistory(detections) {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;
  
  const emptyState = historyList.querySelector('.history-empty');
  
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  detections.forEach(detection => {
    const classInfo = DETECTION_CLASSES[detection.class];
    const timestamp = new Date().toLocaleTimeString();
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.style.borderLeftColor = classInfo.color;
    
    historyItem.innerHTML = `
      <span class="class-icon" style="color: ${classInfo.color}">${classInfo.icon}</span>
      <div class="history-info">
        <div class="history-name">${classInfo.name}</div>
        <div class="history-time">${timestamp}</div>
      </div>
      <div class="history-confidence">${Math.round(detection.confidence * 100)}%</div>
    `;
    
    // Add to beginning of list
    if (historyList.children.length > 0 && !historyList.querySelector('.history-empty')) {
      historyList.insertBefore(historyItem, historyList.children[0]);
    } else {
      historyList.appendChild(historyItem);
    }
    
    // Animate in
    if (typeof anime !== 'undefined') {
      anime({
        targets: historyItem,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutExpo'
      });
    }
    
    // Keep only last 10 items
    while (historyList.children.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
  });
}

function clearDetectionStats() {
  const objectCount = document.getElementById('objectCount');
  const avgConfidence = document.getElementById('avgConfidence');
  
  if (objectCount) objectCount.textContent = '0';
  if (avgConfidence) avgConfidence.textContent = '0%';
}

function toggleAudio() {
  const audioToggleEl = document.getElementById('audioToggle');
  audioEnabled = audioToggleEl ? audioToggleEl.checked : false;
  const message = audioEnabled ? '🔊 Audio alerts enabled' : '🔇 Audio alerts disabled';
  showNotification(message, 'info');
}

function toggleFullscreen() {
  const container = document.getElementById('cameraContainer');
  
  if (!container) return;
  
  if (document.fullscreenElement) {
    document.exitFullscreen().then(() => {
      showNotification('↙️ Exited fullscreen mode', 'info');
    });
  } else {
    container.requestFullscreen().then(() => {
      showNotification('↗️ Entered fullscreen mode', 'success');
    }).catch(err => {
      console.error('Fullscreen error:', err);
      showNotification('❌ Fullscreen not supported', 'error');
    });
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  console.log('Image upload triggered:', file);
  
  if (!file || !file.type.startsWith('image/')) {
    showNotification('❌ Please select a valid image file', 'error');
    return;
  }
  
  showNotification('📤 Processing image...', 'info');
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      processImageDetection(img);
    };
    img.onerror = function() {
      showNotification('❌ Error loading image', 'error');
    };
    img.src = e.target.result;
  };
  reader.onerror = function() {
    showNotification('❌ Error reading file', 'error');
  };
  reader.readAsDataURL(file);
}

function processImageDetection(img) {
  const canvas = document.getElementById('detectionCanvas');
  const video = document.getElementById('cameraVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Setup canvas for image
  const maxWidth = 640;
  const maxHeight = 480;
  
  let displayWidth = img.width;
  let displayHeight = img.height;
  
  // Scale down if too large
  if (displayWidth > maxWidth || displayHeight > maxHeight) {
    const scale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
    displayWidth *= scale;
    displayHeight *= scale;
  }
  
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  canvas.style.display = 'block';
  
  // Hide video and placeholder
  if (video) video.style.display = 'none';
  if (placeholder) placeholder.style.display = 'none';
  
  // Draw image
  ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
  
  // Simulate processing delay
  setTimeout(() => {
    const detections = generateRandomDetections();
    drawDetections(ctx, detections, canvas.width, canvas.height);
    updateDetectionStats(detections);
    addToHistory(detections);
    
    if (audioEnabled) {
      playDetectionAlerts(detections);
    }
    
    showNotification(`🎯 Found ${detections.length} object(s) in image!`, 'success');
  }, 1500);
}

// Audio System
function initializeAudioSystem() {
  // Initialize audio context for better browser compatibility
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (typeof AudioContext !== 'undefined') {
      const audioCtx = new AudioContext();
      window.spaceAudioContext = audioCtx;
    }
  } catch (error) {
    console.warn('Audio context not available:', error);
  }
}

function playDetectionAlerts(detections) {
  detections.forEach((detection, index) => {
    setTimeout(() => {
      playBeepSound(DETECTION_CLASSES[detection.class]);
    }, index * 300);
  });
}

function playBeepSound(classInfo) {
  // Try Web Audio API first
  if (window.spaceAudioContext) {
    try {
      const audioCtx = window.spaceAudioContext;
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Different frequencies for different classes
      const baseFreq = 440;
      const classFreq = baseFreq + (classInfo.id * 50);
      
      oscillator.frequency.setValueAtTime(classFreq, audioCtx.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }
  
  // Use Speech Synthesis as backup
  if ('speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(`${classInfo.name} detected`);
      utterance.volume = 0.3;
      utterance.rate = 1.2;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
    }
  }
}

function populateDetectionClasses() {
  const classGrid = document.getElementById('classGrid');
  if (!classGrid) return;
  
  classGrid.innerHTML = ''; // Clear existing content
  
  DETECTION_CLASSES.forEach((classInfo, index) => {
    const classItem = document.createElement('div');
    classItem.className = 'class-item';
    classItem.innerHTML = `
      <span class="class-icon" style="color: ${classInfo.color}">${classInfo.icon}</span>
      <span>${classInfo.name}</span>
    `;
    
    classGrid.appendChild(classItem);
    
    // Animate in with stagger
    if (typeof anime !== 'undefined') {
      anime({
        targets: classItem,
        translateY: [20, 0],
        opacity: [0, 1],
        delay: index * 100,
        duration: 500,
        easing: 'easeOutExpo'
      });
    }
  });
}

// Forms and Interactions
function initializeForms() {
  console.log('Initializing forms...');
  
  const bookingForm = document.getElementById('bookingForm');
  
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmission(bookingForm);
    });
  }
  
  // Add form field animations
  const formControls = document.querySelectorAll('.form-control');
  formControls.forEach(control => {
    control.addEventListener('focus', (e) => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: e.target,
          borderColor: '#ff851b',
          duration: 200
        });
      }
    });
    
    control.addEventListener('blur', (e) => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: e.target,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          duration: 200
        });
      }
    });
  });
  
  console.log('Forms initialized');
}

function handleBookingSubmission(form) {
  console.log('Processing booking submission...');
  
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  
  const originalText = submitBtn.innerHTML;
  
  // Update button state
  submitBtn.innerHTML = '<span class="btn-icon">⏳</span>Processing...';
  submitBtn.disabled = true;
  
  // Simulate form processing
  setTimeout(() => {
    submitBtn.innerHTML = '<span class="btn-icon">✅</span>Booking Confirmed!';
    
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      form.reset();
      
      showNotification('🚀 Booking request submitted! We\'ll contact you soon.', 'success');
      createConfettiEffect();
    }, 2000);
  }, 1500);
}

function createConfettiEffect() {
  if (typeof anime === 'undefined') return;
  
  const colors = ['#ff851b', '#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4'];
  
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -10px;
      width: 8px;
      height: 8px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      pointer-events: none;
      z-index: 9999;
      border-radius: 50%;
    `;
    
    document.body.appendChild(confetti);
    
    anime({
      targets: confetti,
      translateY: '110vh',
      translateX: () => anime.random(-100, 100),
      rotate: '2turn',
      duration: () => anime.random(2000, 4000),
      easing: 'easeInQuart',
      complete: () => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti);
        }
      }
    });
  }
}

// FAQ System
function initializeFAQ() {
  console.log('Initializing FAQ...');
  
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    
    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQs
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            const otherIcon = otherItem.querySelector('.faq-icon');
            if (otherAnswer) otherAnswer.style.maxHeight = '0';
            if (otherIcon) otherIcon.textContent = '+';
          }
        });
        
        // Toggle current FAQ
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = '0';
          if (icon) icon.textContent = '+';
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          if (icon) icon.textContent = '−';
        }
      });
    }
  });
  
  console.log('FAQ initialized');
}

// Scroll Animations
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        if (typeof anime !== 'undefined') {
          if (element.classList.contains('destination-card')) {
            animateDestinationCard(element);
          } else if (element.classList.contains('pricing-card')) {
            animatePricingCard(element);
          } else if (element.classList.contains('tech-card')) {
            animateTechCard(element);
          } else {
            // Generic fade in animation
            anime({
              targets: element,
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 600,
              easing: 'easeOutExpo'
            });
          }
        }
        
        observer.unobserve(element);
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animateElements = document.querySelectorAll('.destination-card, .pricing-card, .tech-card, .about-text');
  animateElements.forEach(el => {
    observer.observe(el);
  });
}

function animateDestinationCard(card) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: card,
      opacity: [0, 1],
      scale: [0.8, 1],
      rotateY: [-10, 0],
      duration: 800,
      easing: 'easeOutElastic(1, .8)'
    });
  }
}

function animatePricingCard(card) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: card,
      opacity: [0, 1],
      translateY: [50, 0],
      scale: [0.9, 1],
      duration: 600,
      easing: 'easeOutExpo'
    });
  }
}

function animateTechCard(card) {
  if (typeof anime !== 'undefined') {
    anime({
      targets: card,
      opacity: [0, 1],
      translateX: [Math.random() > 0.5 ? -30 : 30, 0],
      duration: 500,
      easing: 'easeOutQuart'
    });
  }
}

// Utility Functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${icons[type]}</span>
      <span class="notification-message">${message}</span>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: rgba(12, 12, 12, 0.95);
    color: white;
    border: 1px solid #ff851b;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 30px rgba(255, 133, 27, 0.3);
    z-index: 10000;
    max-width: 350px;
    backdrop-filter: blur(20px);
    transform: translateX(100%);
    opacity: 0;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  if (typeof anime !== 'undefined') {
    anime({
      targets: notification,
      translateX: [100, 0],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutExpo'
    });
  } else {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (typeof anime !== 'undefined') {
      anime({
        targets: notification,
        translateX: [0, 100],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInExpo',
        complete: () => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }
      });
    } else {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }
  }, 4000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .notification-icon {
    font-size: 18px;
  }
  
  .notification-message {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }
`;
document.head.appendChild(notificationStyles);

// Initialize when document is ready
if (document.readyState === 'loading') {
  // Already handled by DOMContentLoaded listener above
} else {
  // Document already loaded, initialize immediately
  setTimeout(() => {
    initializeAnimations();
    initializeNavigation();
    initializeDetectionSystem();
    initializeForms();
    initializeFAQ();
    initializeScrollAnimations();
    populateDetectionClasses();
  }, 100);
}

console.log('🚀 SPACED - Space Travel & Detection System Ready!');
console.log('📡 All systems online. Ready for space exploration!');