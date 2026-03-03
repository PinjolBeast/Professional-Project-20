/* ============================================
   BLOOM & BLUSH - Firebase Authentication
   ============================================ */

// Firebase Configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let auth;
let firebaseApp;
let googleProvider;

// Try to initialize Firebase (will work when properly configured)
try {
  if (typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }
} catch (e) {
  console.log('Firebase not configured - running in demo mode');
}

// DOM Elements
const authTabButtons = document.querySelectorAll('.auth-tabs button');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.querySelector('.auth-error');
const userInfo = document.querySelector('.user-info');
const userAvatar = document.querySelector('.user-avatar');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAuthTabs();
  initAuthForms();
  checkAuthState();
  initProtectedPages();
});

/* ---------- Auth Tabs ---------- */
function initAuthTabs() {
  authTabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tab = this.dataset.tab;
      
      // Update active tab button
      authTabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding form
      authForms.forEach(form => form.classList.remove('active'));
      document.getElementById(tab + 'Form').classList.add('active');
      
      // Hide error message
      if (authError) {
        authError.classList.remove('show');
      }
    });
  });
}

/* ---------- Auth Forms ---------- */
function initAuthForms() {
  // Login Form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register Form
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Logout Button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/* ---------- Handle Login ---------- */
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  
  if (!email || !password) {
    showAuthError('Please fill in all fields');
    return;
  }
  
  // Show loading
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';
  submitBtn.disabled = true;
  
  try {
    if (auth) {
      // Firebase authentication
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      showToast('Welcome back! Login successful.', 'success');
      redirectAfterLogin();
    } else {
      // Demo mode - simulate login
      await simulateAuth(email, password, 'login');
      showToast('Welcome back! (Demo Mode)', 'success');
      redirectAfterLogin();
    }
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    showAuthError(errorMessage);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

/* ---------- Handle Register ---------- */
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  
  if (!name || !email || !password || !confirmPassword) {
    showAuthError('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    showAuthError('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters');
    return;
  }
  
  // Show loading
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';
  submitBtn.disabled = true;
  
  try {
    if (auth) {
      // Firebase authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile
      await user.updateProfile({
        displayName: name
      });
      
      showToast('Account created successfully!', 'success');
      redirectAfterLogin();
    } else {
      // Demo mode - simulate registration
      await simulateAuth(email, password, 'register', name);
      showToast('Account created successfully! (Demo Mode)', 'success');
      redirectAfterLogin();
    }
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
    }
    
    showAuthError(errorMessage);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

/* ---------- Handle Google Sign-In ---------- */
async function handleGoogleLogin() {
  const googleBtn = document.querySelector('.google-login-btn');
  if (!googleBtn) return;
  
  const originalText = googleBtn.innerHTML;
  googleBtn.innerHTML = '<span class="spinner"></span> Signing in...';
  googleBtn.disabled = true;
  
  try {
    if (auth && googleProvider) {
      // Firebase Google authentication
      const result = await auth.signInWithPopup(googleProvider);
      const user = result.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL
      };
      
      localStorage.setItem('bloomblush_user', JSON.stringify(userData));
      
      showToast('Welcome! Google login successful.', 'success');
      redirectAfterLogin();
    } else {
      // Demo mode - simulate Google login
      await simulateGoogleAuth();
      showToast('Welcome! (Demo Mode - Google)', 'success');
      redirectAfterLogin();
    }
  } catch (error) {
    console.error('Google login error:', error);
    let errorMessage = 'Google login failed. Please try again.';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Login popup was closed. Please try again.';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with a different sign-in method.';
    }
    
    showAuthError(errorMessage);
  } finally {
    googleBtn.innerHTML = originalText;
    googleBtn.disabled = false;
  }
}

/* ---------- Simulate Google Auth in Demo Mode ---------- */
function simulateGoogleAuth() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = {
        uid: 'google_demo_' + Date.now(),
        email: 'user@gmail.com',
        displayName: 'Google User',
        name: 'Google User',
        photoURL: 'https://lh3.googleusercontent.com/a/default'
      };
      
      localStorage.setItem('bloomblush_user', JSON.stringify(user));
      localStorage.setItem('bloomblush_token', 'google_demo_token_' + Date.now());
      
      resolve(user);
    }, 1500);
  });
}

/* ---------- Handle Logout ---------- */
async function handleLogout() {
  try {
    if (auth) {
      await auth.signOut();
    }
    
    // Clear local storage
    localStorage.removeItem('bloomblush_user');
    localStorage.removeItem('bloomblush_token');
    
    showToast('Logged out successfully', 'info');
    
    // Redirect to home or login page
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error logging out', 'error');
  }
}

/* ---------- Auth State Listener ---------- */
function checkAuthState() {
  if (!auth) {
    // Demo mode - check local storage
    const savedUser = localStorage.getItem('bloomblush_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      updateUIForLoggedInUser(user);
    }
    return;
  }
  
  auth.onAuthStateChanged(function(user) {
    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL
      };
      
      // Save to local storage for persistence
      localStorage.setItem('bloomblush_user', JSON.stringify(userData));
      
      updateUIForLoggedInUser(userData);
    } else {
      updateUIForLoggedOutUser();
      localStorage.removeItem('bloomblush_user');
    }
  });
}

/* ---------- Update UI ---------- */
function updateUIForLoggedInUser(user) {
  // Update navbar user info
  if (userInfo) {
    userInfo.style.display = 'flex';
    const userName = userInfo.querySelector('.user-name');
    if (userName) {
      userName.textContent = user.displayName || user.name || 'User';
    }
  }
  
  // Update user avatar
  if (userAvatar) {
    const initials = getInitials(user.displayName || user.name || 'User');
    userAvatar.textContent = initials;
  }
  
  // Update login/register links
  const loginLink = document.querySelector('.nav-links a[href="login.html"]');
  const registerLink = document.querySelector('.nav-links a[href="register.html"]');
  
  if (loginLink) loginLink.style.display = 'none';
  if (registerLink) registerLink.style.display = 'none';
  
  // Add logout button if not exists
  if (logoutBtn) {
    logoutBtn.style.display = 'block';
  } else {
    const navAuth = document.querySelector('.nav-auth');
    if (navAuth) {
      const logoutBtnNew = document.createElement('button');
      logoutBtnNew.id = 'logoutBtn';
      logoutBtnNew.className = 'btn btn-secondary btn-sm';
      logoutBtnNew.textContent = 'Logout';
      logoutBtnNew.addEventListener('click', handleLogout);
      navAuth.appendChild(logoutBtnNew);
    }
  }
}

function updateUIForLoggedOutUser() {
  // Hide user info
  if (userInfo) {
    userInfo.style.display = 'none';
  }
  
  // Show login/register links
  const loginLink = document.querySelector('.nav-links a[href="login.html"]');
  const registerLink = document.querySelector('.nav-links a[href="register.html"]');
  
  if (loginLink) loginLink.style.display = '';
  if (registerLink) registerLink.style.display = '';
  
  // Hide logout button
  if (logoutBtn) {
    logoutBtn.style.display = 'none';
  }
}

/* ---------- Protected Pages ---------- */
function initProtectedPages() {
  const orderPage = document.querySelector('.order-page');
  if (!orderPage) return;
  
  // Check if user is logged in
  const savedUser = localStorage.getItem('bloomblush_user');
  const isLoggedIn = savedUser || (auth && auth.currentUser);
  
  if (!isLoggedIn) {
    // Store current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    
    // Show login required message
    const orderContainer = document.querySelector('.order-container');
    if (orderContainer) {
      orderContainer.innerHTML = `
        <div class="login-required" style="text-align: center; padding: 80px 20px;">
          <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
          <h2 style="margin-bottom: 15px;">Login Required</h2>
          <p style="color: var(--text-gray); margin-bottom: 30px;">Please login to access the order form and place your bouquet orders.</p>
          <a href="login.html" class="btn btn-primary">Login / Register</a>
        </div>
      `;
    }
  }
}

/* ---------- Helper Functions ---------- */
function showAuthError(message) {
  if (authError) {
    authError.textContent = message;
    authError.classList.add('show');
  } else {
    showToast(message, 'error');
  }
}

function redirectAfterLogin() {
  // Check for redirect URL
  const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
  
  if (redirectUrl) {
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectUrl;
  } else {
    // Default redirect
    window.location.href = 'index.html';
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/* ---------- Demo Mode Simulation ---------- */
function simulateAuth(email, password, type, name = null) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation for demo
      if (!email || !password) {
        reject(new Error('Invalid credentials'));
        return;
      }
      
      // Create demo user
      const user = {
        uid: 'demo_' + Date.now(),
        email: email,
        displayName: name || email.split('@')[0],
        name: name || email.split('@')[0]
      };
      
      // Save to local storage
      localStorage.setItem('bloomblush_user', JSON.stringify(user));
      localStorage.setItem('bloomblush_token', 'demo_token_' + Date.now());
      
      resolve(user);
    }, 1500);
  });
}

/* ---------- Check Auth for Order Form ---------- */
window.checkAuthForOrder = function() {
  const savedUser = localStorage.getItem('bloomblush_user');
  return !!savedUser;
};

/* ---------- Get Current User ---------- */
window.getCurrentUser = function() {
  const savedUser = localStorage.getItem('bloomblush_user');
  if (savedUser) {
    return JSON.parse(savedUser);
  }
  return null;
};

/* ---------- Export Functions ---------- */
window.BloomBlushAuth = {
  logout: handleLogout,
  isLoggedIn: window.checkAuthForOrder,
  getCurrentUser: window.getCurrentUser
};

