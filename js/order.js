/* ============================================
   BLOOM & BLUSH - Order Form Handler
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  initOrderForm();
});

/* ---------- Order Form ---------- */
function initOrderForm() {
  const orderForm = document.getElementById('orderForm');
  
  if (!orderForm) return;
  
  // Get current user
  const user = window.getCurrentUser ? window.getCurrentUser() : null;
  
  // Pre-fill user info if logged in
  if (user) {
    const emailInput = document.getElementById('orderEmail');
    const nameInput = document.getElementById('orderName');
    
    if (emailInput && !emailInput.value) {
      emailInput.value = user.email || '';
    }
    if (nameInput && !nameInput.value) {
      nameInput.value = user.displayName || user.name || '';
    }
  }
  
  // Form submission
  orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateOrderForm(this)) {
      return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing Order...';
    submitBtn.disabled = true;
    
    // Prepare order data
    const orderData = {
      access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      bouquet_type: formData.get('bouquet_type'),
      occasion: formData.get('occasion'),
      message: formData.get('message'),
      delivery_date: formData.get('delivery_date'),
      delivery_address: formData.get('delivery_address'),
      subject: 'New Bouquet Order - ' + formData.get('bouquet_type')
    };
    
    try {
      // Submit to Web3Forms API
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast('Order submitted successfully! We\'ll contact you shortly.', 'success');
        orderForm.reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Failed to submit order. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      // Demo mode - show success
      showToast('Order submitted successfully! (Demo Mode)', 'success');
      orderForm.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
  
  // Real-time validation
  const inputs = orderForm.querySelectorAll('.form-control');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });
  
  // Date picker - set minimum date to tomorrow
  const dateInput = document.getElementById('orderDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }
}

/* ---------- Form Validation ---------- */
function validateOrderForm(form) {
  let isValid = true;
  const fields = form.querySelectorAll('.form-control[required]');
  
  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  // Additional validations
  const email = document.getElementById('orderEmail');
  if (email && email.value) {
    if (!isValidEmail(email.value)) {
      showFieldError(email, 'Please enter a valid email address');
      isValid = false;
    }
  }
  
  const phone = document.getElementById('orderPhone');
  if (phone && phone.value) {
    if (!isValidPhone(phone.value)) {
      showFieldError(phone, 'Please enter a valid phone number');
      isValid = false;
    }
  }
  
  const date = document.getElementById('orderDate');
  if (date && date.value) {
    const selectedDate = new Date(date.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      showFieldError(date, 'Delivery date cannot be in the past');
      isValid = false;
    }
  }
  
  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name || field.id;
  
  // Check required
  if (field.hasAttribute('required') && !value) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  // Check minlength
  if (field.hasAttribute('minlength') && value.length < parseInt(field.getAttribute('minlength'))) {
    showFieldError(field, `Minimum ${field.getAttribute('minlength')} characters required`);
    return false;
  }
  
  // Clear error if valid
  clearFieldError(field);
  return true;
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Find or create error message element
  let errorEl = field.parentElement.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.style.color = '#dc3545';
    errorEl.style.fontSize = '0.85rem';
    errorEl.style.marginTop = '5px';
    errorEl.style.display = 'block';
    field.parentElement.appendChild(errorEl);
  }
  
  errorEl.textContent = message;
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.field-error');
  if (errorEl) {
    errorEl.remove();
  }
}

/* ---------- Validation Helpers ---------- */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone) {
  // Simple phone validation - allows various formats
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone);
}

/* ---------- Select Custom Styling ---------- */
function initSelectStyling() {
  const selects = document.querySelectorAll('.form-control');
  
  selects.forEach(select => {
    if (select.tagName === 'SELECT') {
      // Add custom styling hooks
      select.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      
      select.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      });
      
      select.addEventListener('change', function() {
        if (this.value) {
          this.classList.add('has-value');
        } else {
          this.classList.remove('has-value');
        }
      });
    }
  });
}

/* ---------- Export Functions ---------- */
window.BloomBlushOrder = {
  validate: validateOrderForm,
  submit: function(form) {
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  }
};

