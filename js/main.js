/* ============================================
   BLOOM & BLUSH - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initNavbar();
  initScrollAnimations();
  initMobileMenu();
  initLightbox();
  initContactForm();
  initPageLoader();
});

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const scrollDown = document.querySelector('.scroll-down');
  
  if (!navbar) return;
  
  // Scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Hide scroll indicator when scrolled
  if (scrollDown) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        scrollDown.style.opacity = '0';
      } else {
        scrollDown.style.opacity = '1';
      }
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ---------- Scroll Animations ---------- */
function initScrollAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Remove observer after animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all animated elements
  document.querySelectorAll('.fade-in, .slide-up, .zoom-in').forEach(el => {
    observer.observe(el);
  });
  
  // Parallax effect for hero elements (optional)
  const floatingElements = document.querySelectorAll('.floating-element');
  if (floatingElements.length > 0) {
    window.addEventListener('scroll', function() {
      const scrollY = window.scrollY;
      floatingElements.forEach((el, index) => {
        const speed = 0.5 + (index * 0.1);
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    });
  }
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu .btn-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  
  if (!mobileToggle || !mobileMenu) return;
  
  // Open menu
  mobileToggle.addEventListener('click', function() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  // Close menu
  if (mobileClose) {
    mobileClose.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Lightbox Gallery ---------- */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-content img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  
  if (!galleryItems.length || !lightbox) return;
  
  let currentIndex = 0;
  const images = [];
  
  // Collect all gallery images
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      images.push({
        src: img.src,
        alt: img.alt
      });
      
      item.addEventListener('click', function() {
        currentIndex = index;
        openLightbox(currentIndex);
      });
    }
  });
  
  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
  }
  
  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
  }
  
  // Event listeners
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', showPrev);
  }
  
  if (lightboxNext) {
    lightboxNext.addEventListener('click', showNext);
  }
  
  // Close on background click
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

/* ---------- Contact Form ---------- */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
    submitBtn.disabled = true;
    
    try {
      // Web3Forms API endpoint (replace with your actual access key)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          subject: formData.get('subject'),
          message: formData.get('message')
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        showToast('Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      // For demo purposes, show success anyway
      showToast('Message sent successfully! (Demo Mode)', 'success');
      contactForm.reset();
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* ---------- Page Loader ---------- */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  
  if (!loader) return;
  
  window.addEventListener('load', function() {
    setTimeout(function() {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s ease';
      
      setTimeout(function() {
        loader.style.display = 'none';
      }, 500);
    }, 1000);
  });
}

/* ---------- Toast Notifications ---------- */
function showToast(message, type = 'info') {
  // Remove existing container if any
  let container = document.querySelector('.toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close">&times;</span>
  `;
  
  container.appendChild(toast);
  
  // Close button
  toast.querySelector('.toast-close').addEventListener('click', function() {
    removeToast(toast);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => removeToast(toast), 5000);
}

function removeToast(toast) {
  toast.style.animation = 'slideInRight 0.3s ease reverse';
  setTimeout(() => toast.remove(), 300);
}

/* ---------- Smooth Scroll ---------- */
function smoothScrollTo(targetId) {
  const target = document.querySelector(targetId);
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/* ---------- Utility Functions ---------- */
function debounce(func, wait = 10, immediate = true) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function throttle(func, limit = 100) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other files
window.BloomBlush = {
  showToast,
  smoothScrollTo,
  debounce,
  throttle
};

