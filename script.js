// Supabase Configuration
// Supabase Configuration - Load from server config
let supabase = null;

async function initSupabase() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    const SUPABASE_URL = config.supabase?.url;
    const SUPABASE_KEY = config.supabase?.key;
    if (SUPABASE_URL && SUPABASE_KEY && window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
  }
}

initSupabase();

// Ultra-Smooth 400fps Performance Script
document.addEventListener('DOMContentLoaded', function() {
  // Enable hardware acceleration (disabled for modal alignment)
  // document.body.style.transform = 'translateZ(0)';
  
  // Ultra-smooth scrolling with 120fps target
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        // Ultra-smooth scroll with 120fps animation
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 600;
        let start = null;

        function ultraSmoothAnimation(currentTime) {
          if (start === null) start = currentTime;
          const timeElapsed = currentTime - start;
          const run = easeOutQuart(timeElapsed, startPosition, distance, duration);
          window.scrollTo(0, run);

          if (timeElapsed < duration) {
            requestAnimationFrame(ultraSmoothAnimation);
          }
        }

        // Ultra-smooth easing function
        function easeOutQuart(t, b, c, d) {
          t /= d;
          t--;
          return -c * (t*t*t*t - 1) + b;
        }

        requestAnimationFrame(ultraSmoothAnimation);
      }
    });
  });

  // High-performance parallax with throttling
  let ticking = false;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const glows = document.querySelectorAll('.absolute');
    
    glows.forEach((glow, index) => {
      if (glow.classList.contains('blur-3xl')) {
        const speed = index === 0 ? 0.3 : 0.2;
        glow.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
      }
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // Ultra-smooth reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translate3d(0, 0, 0)';
      }
    });
  }, observerOptions);

  // Apply smooth animations to all sections
  document.querySelectorAll('section, article').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translate3d(0, 20px, 0)';
    element.style.transition = 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    element.style.willChange = 'transform, opacity';
    observer.observe(element);
  });

  // Smooth hover effects for interactive elements
  document.querySelectorAll('a, button, [role="button"]').forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'translate3d(0, -2px, 0) scale(1.02)';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
  });

  // Optimize images for smooth loading
  document.querySelectorAll('img').forEach(img => {
    img.style.transform = 'translateZ(0)';
    img.style.backfaceVisibility = 'hidden';
  });
});

// Ultra-smooth back to top with 120fps
function scrollToTop() {
  const currentPosition = window.pageYOffset;
  const duration = 500;
  let start = null;

  function ultraSmoothToTop(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const run = easeOutExpo(timeElapsed, currentPosition, -currentPosition, duration);
    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      requestAnimationFrame(ultraSmoothToTop);
    }
  }

  function easeOutExpo(t, b, c, d) {
    return c * (-Math.pow(2, -10 * t/d) + 1) + b;
  }

  requestAnimationFrame(ultraSmoothToTop);
}

// Preload critical resources for instant response
window.addEventListener('load', function() {
  // Force hardware acceleration on all elements
  document.querySelectorAll('*').forEach(el => {
    if (el.offsetParent !== null) {
      el.style.transform = el.style.transform || 'translateZ(0)';
    }
  });
});

// Input validation helper
function validateContactForm(data) {
  const errors = [];
  
  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.push('Valid email is required');
  } else if (data.email.trim().length > 100) {
    errors.push('Email must not exceed 100 characters');
  }
  
  // Phone validation
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone is required');
  } else if (data.phone.trim().length < 10) {
    errors.push('Phone must be at least 10 characters');
  } else if (data.phone.trim().length > 20) {
    errors.push('Phone must not exceed 20 characters');
  }
  
  // Requirement validation
  if (!data.requirement || data.requirement.trim().length === 0) {
    errors.push('Requirement is required');
  } else if (data.requirement.trim().length > 50) {
    errors.push('Requirement must not exceed 50 characters');
  }
  
  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.trim().length > 500) {
    errors.push('Description must not exceed 500 characters');
  }
  
  return errors;
}

// Contact form submission with Supabase integration
async function submitContactForm(event) {
  event.preventDefault();
  
  // Get form data
  const formData = new FormData(event.target);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    requirement: formData.get('requirement'),
    description: formData.get('description')
  };
  
  // Validate input
  const errors = validateContactForm(data);
  if (errors.length > 0) {
    alert('Please fix the following errors:\n\n' + errors.join('\n'));
    return;
  }
  
  // Sanitize input
  const sanitizedData = {
    name: data.name.trim().substring(0, 100),
    email: data.email.trim().substring(0, 100),
    phone: data.phone.trim().substring(0, 20),
    requirement: data.requirement.trim().substring(0, 50),
    description: data.description.trim().substring(0, 500)
  };
  
  try {
    if (!supabase) {
      alert('Application not ready. Please refresh the page.');
      return;
    }
    
    // Save to Supabase
    const { data: insertData, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          requirement: sanitizedData.requirement,
          description: sanitizedData.description,
          submitted_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error saving to Supabase:', error);
      alert('Error submitting form. Please try again.');
      return;
    }
    
    alert('Thank you for your interest! We will contact you shortly.');
    event.target.reset();
  } catch (err) {
    console.error('Error:', err);
    alert('Error submitting form. Please try again.');
  }
}
