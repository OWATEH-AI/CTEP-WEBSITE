/* === CTEP — Creative & Technology Exposure Program === */
/* === Main JavaScript — Slideshow, Navigation, Forms, Animations === */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroSlideshow();
  initMobileNav();
  initScrollReveal();
  initFAQ();
  initApplicationForm();
  initSmoothScroll();
  initImageAnimations();
  initDarkMode();
  initDonateModal();
});

/* ============================
   HEADER — Sticky + Scroll Effect
   ============================ */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link, .mobile-nav .nav__link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 120;
      if (window.scrollY >= top) current = s.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }, { passive: true });
}

/* ============================
   HERO SLIDESHOW — CSS-driven (no JS needed)
   Continuous crossfade handled entirely by @keyframes heroFade in style.css.
   Dots are hidden. No intervals or class-toggling required.
   ============================ */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero__slide');
  if (slides.length <= 1) return;

  let currentSlide = 0;
  const slideInterval = 6000; // 6 seconds per photo

  // Helper function to lazy load a slide's background
  const loadSlideBg = (index) => {
    const s = slides[index];
    if (s && s.hasAttribute('data-bg') && !s.style.backgroundImage) {
      s.style.backgroundImage = s.getAttribute('data-bg');
    }
  };

  // Initialize all slides to zero opacity
  slides.forEach((s, idx) => {
    s.style.opacity = '0';
    s.style.zIndex = '0';
  });

  // Load the first and second slides immediately
  loadSlideBg(0);
  loadSlideBg(1);

  // Start the first slide
  slides[currentSlide].classList.add('animating');
  slides[currentSlide].style.opacity = '1';
  slides[currentSlide].style.zIndex = '1';

  setInterval(() => {
    const prevSlide = currentSlide;
    
    // Move to next
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Lazy load the newly active slide and the one after it
    loadSlideBg(currentSlide);
    loadSlideBg((currentSlide + 1) % slides.length);

    // Keep old slide exactly where it is (animating and fully opaque) but at lower z-index
    slides[prevSlide].style.zIndex = '1';
    
    // Bring new slide to front and start its animation
    slides[currentSlide].classList.add('animating');
    slides[currentSlide].style.zIndex = '2';
    
    // Trigger the crossfade by setting opacity to 1 (CSS transition handles the smooth fade)
    setTimeout(() => {
      slides[currentSlide].style.opacity = '1';
    }, 50);
    
    // After the 2.5s crossfade is FULLY complete, safely reset the old slide in the background
    setTimeout(() => {
      slides[prevSlide].style.transition = 'none'; // Instantly hide without ghosting backwards
      slides[prevSlide].style.opacity = '0';
      slides[prevSlide].style.zIndex = '0';
      slides[prevSlide].classList.remove('animating');
      slides[prevSlide].classList.remove('active'); // Clean up any lingering HTML classes
      
      // Restore its transition property for the next time it loops around
      setTimeout(() => {
        slides[prevSlide].style.transition = '';
      }, 50);
    }, 2600); 
    
  }, slideInterval);
}

/* ============================
   MOBILE NAVIGATION
   ============================ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ============================
   SCROLL REVEAL — IntersectionObserver
   ============================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));
}

/* ============================
   IMAGE HOVER ANIMATIONS
   ============================ */
function initImageAnimations() {
  // Parallax-lite on gallery items
  const galleryItems = document.querySelectorAll('.gallery-mosaic__item');
  galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.zIndex = '2';
    });
    item.addEventListener('mouseleave', () => {
      item.style.zIndex = '';
    });
  });

  // Counter animation for stats
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let count = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
          count += step;
          if (count >= target) { count = target; clearInterval(timer); }
          el.textContent = count + suffix;
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));
}

/* ============================
   FAQ ACCORDION
   ============================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => i.classList.remove('open'));
      // Open clicked if was closed
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ============================
   APPLICATION FORM — Multi-step
   ============================ */
function initApplicationForm() {
  const form = document.getElementById('application-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 3;

  const panels = form.querySelectorAll('.step-panel');
  const indicators = document.querySelectorAll('.step-indicator');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const successMsg = document.getElementById('form-success');

  // Booking option selection
  const bookingOptions = document.querySelectorAll('.booking-option');
  bookingOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      bookingOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      document.getElementById('booking-type').value = opt.dataset.value;
      updateDynamicFields(opt.dataset.value);
      
      // Auto-advance to step 2 after a short delay for feedback
      setTimeout(() => {
        goToStep(2);
      }, 400);
    });
  });

  function updateDynamicFields(type) {
    const facilitatorGroup = document.getElementById('facilitator-group');
    const eventTypeGroup = document.getElementById('event-type-group');
    const budgetGroup = document.getElementById('budget-group');
    if (facilitatorGroup) {
      facilitatorGroup.style.display =
        (type === 'quiz-debate' || type === 'venue-booking' || type === 'custom-event') ? 'flex' : 'none';
    }
    if (eventTypeGroup) {
      eventTypeGroup.style.display =
        (type === 'quiz-debate' || type === 'custom-event') ? 'flex' : 'none';
    }
    if (budgetGroup) {
      budgetGroup.style.display = (type === 'custom-event') ? 'flex' : 'none';
    }
  }

  function showStep(step) {
    panels.forEach((p, i) => {
      p.classList.toggle('active', i === step - 1);
    });
    indicators.forEach((ind, i) => {
      ind.classList.remove('active', 'done');
      if (i < step - 1) ind.classList.add('done');
      if (i === step - 1) ind.classList.add('active');
    });
    if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    if (nextBtn) {
      nextBtn.textContent = step === totalSteps ? 'Submit Application' : 'Next →';
    }
    currentStep = step;
  }

  function validateStep(step) {
    const panel = panels[step - 1];
    if (!panel) return true;
    let valid = true;

    if (step === 1) {
      const selected = document.querySelector('.booking-option.selected');
      if (!selected) {
        alert('Please select a booking type.');
        return false;
      }
    }

    if (step === 2) {
      panel.querySelectorAll('[required]').forEach(field => {
        field.classList.remove('error');
        const errEl = document.getElementById(field.id + '-error');
        if (errEl) errEl.textContent = '';
        if (!field.value.trim()) {
          field.classList.add('error');
          if (errEl) errEl.textContent = 'This field is required';
          valid = false;
        }
      });
      // Validate email
      const email = panel.querySelector('#app-email');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error');
        const errEl = document.getElementById('app-email-error');
        if (errEl) errEl.textContent = 'Please enter a valid email';
        valid = false;
      }
    }
    return valid;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      if (currentStep === totalSteps) {
        submitForm();
      } else {
        showStep(currentStep + 1);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) showStep(currentStep - 1);
    });
  }

  function submitForm() {
    const btn = nextBtn;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    // Collect form data for WhatsApp
    const bookingType = document.getElementById('booking-type').value;
    const school = document.getElementById('app-school')?.value || '';
    const contact = document.getElementById('app-contact')?.value || '';
    const role = document.getElementById('app-role')?.value || '';
    const phone = document.getElementById('app-phone')?.value || '';
    const whatsapp = document.getElementById('app-whatsapp')?.value || '';
    const email = document.getElementById('app-email')?.value || '';
    const participants = document.getElementById('app-participants')?.value || '';
    const dates = document.getElementById('app-dates')?.value || '';
    const session = document.getElementById('app-session')?.value || '';
    const budgetAmount = document.getElementById('app-budget-amount')?.value || '';
    const budgetType = document.getElementById('app-budget-type')?.value || '';
    const notes = document.getElementById('app-notes')?.value || '';

    let budgetText = '';
    if (bookingType === 'custom-event' && budgetAmount) {
      budgetText = `💰 *Preferred Budget:* $${budgetAmount} (${budgetType})\n`;
    }

    const text = encodeURIComponent(
      `*CTEP Booking Application*\n\n` +
      `📋 *Booking Type:* ${bookingType}\n` +
      `🏫 *School:* ${school}\n` +
      `👤 *Contact Person:* ${contact}\n` +
      `💼 *Role:* ${role}\n` +
      `📞 *Phone:* ${phone}\n` +
      `💬 *WhatsApp:* ${whatsapp}\n` +
      `📧 *Email:* ${email}\n` +
      `👥 *Participants:* ${participants}\n` +
      `📅 *Preferred Dates:* ${dates}\n` +
      `⏰ *Session:* ${session}\n` +
      budgetText +
      `📝 *Notes:* ${notes}`
    );

    // Open WhatsApp with form data
    window.open(`https://wa.me/263786367366?text=${text}`, '_blank');

    // Show success
    setTimeout(() => {
      form.style.display = 'none';
      document.querySelector('.stepper-progress').style.display = 'none';
      document.querySelector('.form-actions').style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';
    }, 500);
  }

  showStep(1);
}

/* ============================
   SMOOTH SCROLL
   ============================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================
   DARK MODE TOGGLE
   ============================ */
function initDarkMode() {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;
  const moon = toggleBtn.querySelector('.moon-icon');
  const sun = toggleBtn.querySelector('.sun-icon');

  const savedTheme = localStorage.getItem('ctep-theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark-theme');
    moon.style.display = 'block';
    sun.style.display = 'none';
  } else {
    // Default is dark (already added in HTML, just updating icons)
    document.documentElement.classList.add('dark-theme');
    moon.style.display = 'none';
    sun.style.display = 'block';
  }

  toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-theme');
    const isDark = document.documentElement.classList.contains('dark-theme');
    
    moon.style.display = isDark ? 'none' : 'block';
    sun.style.display = isDark ? 'block' : 'none';
    
    localStorage.setItem('ctep-theme', isDark ? 'dark' : 'light');
  });
}

/* ============================
   DONATE MODAL
   ============================ */
function initDonateModal() {
  const openBtn     = document.getElementById('donate-open');
  const overlay     = document.getElementById('donate-overlay');
  const closeBtn    = document.getElementById('donate-close');
  const form        = document.getElementById('donate-form');
  const amountBtns  = document.querySelectorAll('.donate-amount');
  const customGrp   = document.getElementById('custom-amount-group');
  const customInp   = document.getElementById('donate-custom');
  const amountVal   = document.getElementById('donate-amount-val');
  const typeVal     = document.getElementById('donate-type-val');

  const platOverlay = document.getElementById('platform-overlay');
  const platClose   = document.getElementById('platform-close');
  const sendWA      = document.getElementById('send-whatsapp');
  const sendGmail   = document.getElementById('send-gmail');

  // Payment details toggle
  const showPayBtn    = document.getElementById('show-payment-btn');
  const payDetailsBox = document.getElementById('payment-details-box');

  if (!openBtn || !overlay) return;

  // ─── Open / Close modal ────────────────────────────
  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closePlatform(); }
  });

  // ─── Tab switching (Money / Items) ────────────────
  const tabs   = document.querySelectorAll('.donate-tab');
  const panels = document.querySelectorAll('.donate-tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.add('active');
      if (typeVal) typeVal.value = tab.dataset.tab;
    });
  });

  // ─── Payment details reveal button ────────────────
  if (showPayBtn && payDetailsBox) {
    showPayBtn.addEventListener('click', () => {
      const isVisible = payDetailsBox.style.display !== 'none';
      payDetailsBox.style.display = isVisible ? 'none' : 'block';
      showPayBtn.textContent = isVisible ? 'View Payment Details' : 'Hide Payment Details';
    });
  }

  // ─── Amount buttons ───────────────────────────────
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (btn.dataset.amount === 'custom') {
        if (customGrp) customGrp.style.display = 'flex';
        if (customInp) customInp.focus();
        amountVal.value = '';
      } else {
        if (customGrp) customGrp.style.display = 'none';
        amountVal.value = '$' + btn.dataset.amount;
      }
    });
  });

  if (customInp) {
    customInp.addEventListener('input', () => {
      amountVal.value = '$' + (customInp.value || '?');
    });
  }

  // ─── Validation ───────────────────────────────────
  function validateDonate() {
    let valid = true;
    const fields = [
      { id: 'd-name',  errId: 'd-name-error',  msg: 'Full name is required' },
      { id: 'd-phone', errId: 'd-phone-error', msg: 'Phone number is required' },
      { id: 'd-email', errId: 'd-email-error', msg: 'Email address is required' }
    ];
    fields.forEach(f => {
      const el  = document.getElementById(f.id);
      const err = document.getElementById(f.errId);
      if (!el) return;
      el.classList.remove('error');
      if (err) err.textContent = '';
      if (!el.value.trim()) {
        el.classList.add('error');
        if (err) err.textContent = f.msg;
        valid = false;
      }
    });
    const emailEl  = document.getElementById('d-email');
    const emailErr = document.getElementById('d-email-error');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      if (emailErr) emailErr.textContent = 'Please enter a valid email address';
      valid = false;
    }
    // Only require amount on money tab
    const currentType = typeVal ? typeVal.value : 'money';
    if (currentType === 'money' && !amountVal.value) {
      alert('Please select a donation amount first.');
      valid = false;
    }
    return valid;
  }

  // ─── Build WhatsApp / Gmail message ───────────────
  function buildMessage() {
    const currentType = typeVal ? typeVal.value : 'money';
    const name    = (document.getElementById('d-name')?.value || '').trim();
    const phone   = (document.getElementById('d-phone')?.value || '').trim();
    const email   = (document.getElementById('d-email')?.value || '').trim();
    const note    = (document.getElementById('d-message')?.value || '').trim();

    let donationDetail = '';
    if (currentType === 'money') {
      donationDetail = 'Donation Type: Money\nAmount: ' + (amountVal.value || 'Not specified');
    } else {
      const checked = [...document.querySelectorAll('input[name="donate-item"]:checked')]
        .map(cb => cb.value).join(', ');
      const other   = (document.getElementById('d-other-item')?.value || '').trim();
      const qty     = (document.getElementById('d-item-qty')?.value || '').trim();
      donationDetail =
        'Donation Type: Items\n' +
        'Items: ' + (checked || 'Not specified') +
        (other ? ', ' + other : '') +
        (qty   ? '\nQuantity / Description: ' + qty : '');
    }

    return (
      'CTEP Donation Enquiry\n' +
      'Hosted by ARTGALZIM CENTER | OWA TECHNOLOGIES\n\n' +
      donationDetail + '\n' +
      'Name: '  + name  + '\n' +
      'Phone: ' + phone + '\n' +
      'Email: ' + email + '\n' +
      (note ? 'Message: ' + note + '\n' : '') +
      '\nctep@artgalzim.com'
    );
  }

  // ─── Form submit → platform popup ─────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateDonate()) return;
    closeModal();
    setTimeout(() => { if (platOverlay) platOverlay.classList.add('open'); }, 220);
  });

  // ─── Platform popup close ─────────────────────────
  function closePlatform() {
    if (platOverlay) platOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (platClose)   platClose.addEventListener('click', closePlatform);
  if (platOverlay) platOverlay.addEventListener('click', (e) => {
    if (e.target === platOverlay) closePlatform();
  });

  // ─── Send via WhatsApp ────────────────────────────
  if (sendWA) {
    sendWA.addEventListener('click', () => {
      window.open('https://wa.me/263786367366?text=' + encodeURIComponent(buildMessage()), '_blank');
      closePlatform();
    });
  }

  // ─── Send via Gmail ───────────────────────────────
  if (sendGmail) {
    sendGmail.addEventListener('click', () => {
      const name    = (document.getElementById('d-name')?.value || '').trim();
      const typeLabel = (typeVal && typeVal.value === 'items') ? 'Item Donation' : ('Money - ' + (amountVal.value || ''));
      const subject   = encodeURIComponent('CTEP Donation from ' + name + ' (' + typeLabel + ')');
      const body      = encodeURIComponent(buildMessage());
      window.open(
        'https://mail.google.com/mail/?view=cm&fs=1&to=ctep@artgalzim.com&su=' + subject + '&body=' + body,
        '_blank'
      );
      closePlatform();
    });
  }
}
