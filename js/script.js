const burger = document.querySelector('.burger');
const menu= document.querySelector('.nav__list');
const menuLinks = document.querySelectorAll('.nav__link');

const navigationEntry = performance.getEntriesByType('navigation')[0];
const isReload = navigationEntry
    ? navigationEntry.type === 'reload'
    : performance.navigation?.type === 1;

if (isReload) {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    window.addEventListener('pageshow', () => {
        history.replaceState(history.state, '', window.location.pathname + window.location.search);
        setTimeout(() => {
            const root = document.documentElement;
            const scrollBehavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, 0);
            root.scrollTop = 0;
            document.body.scrollTop = 0;
            root.style.scrollBehavior = scrollBehavior;
        }, 50);
    }, { once: true });
}

function closeMenu() {
    burger.classList.remove('burger--open');
    menu.classList.remove('nav__list--open');
    document.body.classList.remove('no-scroll');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
}

burger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = burger.classList.toggle('burger--open');
    menu.classList.toggle('nav__list--open', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('click', (event) => {
    const isMenuOpen = menu.classList.contains('nav__list--open');
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnBurger = burger.contains(event.target);

    if (isMenuOpen && !isClickInsideMenu && !isClickOnBurger) {
        closeMenu();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('nav__list--open')) {
        closeMenu();
    }
});



const workProcessSteps = document.querySelectorAll('.working-process__step');

workProcessSteps.forEach((step) => {
  const toggleBtn = step.querySelector('.working-process__toggle');
  const content = step.querySelector('.working-process__content');

  if (toggleBtn && content) {
    if (step.classList.contains('working-process__step--active')) {
      content.style.maxHeight = content.scrollHeight + 30 + 'px';
    }

    step.addEventListener('click', (event) => {
      if (event.target.closest('a, button:not(.working-process__toggle)') || window.getSelection().toString()) {
        return;
      }

      const isActive = step.classList.toggle('working-process__step--active');
      toggleBtn.setAttribute('aria-expanded', String(isActive));

      if (isActive) {
        content.style.maxHeight = content.scrollHeight + 30 + 'px';
      } else {
        content.style.maxHeight = '0px';
      }
    });
  }
});


const sliderWrapper = document.querySelector('.testimonials__slider-wrapper');
const track = document.querySelector('.testimonials__grid');
const originalSlides = Array.from(document.querySelectorAll('.testimonial-slide'));
const prevBtn = document.querySelector('.testimonials__arrow--prev');
const nextBtn = document.querySelector('.testimonials__arrow--next');
const dots = document.querySelectorAll('.testimonials__dot');

if (track && sliderWrapper && originalSlides.length > 0) {
    const totalSlides = originalSlides.length;
    const clonesCount = 2;

    for (let i = totalSlides - clonesCount; i < totalSlides; i++) {
        const clone = originalSlides[i].cloneNode(true);
        clone.classList.add('is-clone');
        track.insertBefore(clone, track.firstChild);
    }

    for (let i = 0; i < clonesCount; i++) {
        const clone = originalSlides[i].cloneNode(true);
        clone.classList.add('is-clone');
        track.appendChild(clone);
    }

    const allSlides = Array.from(track.querySelectorAll('.testimonial-slide'));
    let currentIndex = clonesCount;
    let isTransitioning = false;
    let pointerStartX = 0;
    let pointerStartY = 0;

    function getTranslate(animate = true) {
        const slideWidth = allSlides[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const centerOffset = (sliderWrapper.clientWidth - slideWidth) / 2;
        const slideOffset = currentIndex * (slideWidth + gap);

        if (animate) {
            track.style.transition = 'transform 0.4s ease';
        } else {
            track.style.transition = 'none';
        }

        const translate = centerOffset - slideOffset;
        track.style.transform = `translateX(${translate}px)`;
        return translate;
    }

    function updateDots() {
        const realIndex = (currentIndex - clonesCount + totalSlides) % totalSlides;
        dots.forEach((dot, index) => {
            const isActive = index === realIndex;
            dot.classList.toggle('testimonials__dot--active', isActive);
            if (isActive) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    }

    function setPosition(animate = true) {
        getTranslate(animate);
        updateDots();
    }

    function unlockTransition() {
        isTransitioning = false;
    }

    function goToNext() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        setPosition(true);
        window.setTimeout(unlockTransition, 450);
    }

    function goToPrev() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        setPosition(true);
        window.setTimeout(unlockTransition, 450);
    }

    track.addEventListener('transitionend', (event) => {
        if (event.target !== track) return;
        isTransitioning = false;

        if (currentIndex < clonesCount) {
            currentIndex += totalSlides;
            setPosition(false);
        } else if (currentIndex >= totalSlides + clonesCount) {
            currentIndex -= totalSlides;
            setPosition(false);
        }
    });

    prevBtn?.addEventListener('click', goToPrev);
    nextBtn?.addEventListener('click', goToNext);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex = index + clonesCount;
            setPosition(true);
            window.setTimeout(unlockTransition, 450);
        });
    });

    sliderWrapper.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.testimonials__controls')) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        track.style.transition = 'none';
        sliderWrapper.setPointerCapture?.(event.pointerId);
    });

    sliderWrapper.addEventListener('pointermove', (event) => {
        if (!pointerStartX && !pointerStartY) return;

        const distanceX = event.clientX - pointerStartX;
        const distanceY = event.clientY - pointerStartY;
        if (Math.abs(distanceY) > Math.abs(distanceX)) return;

        const baseTranslate = getTranslate(false);
        track.style.transform = `translateX(${baseTranslate + distanceX}px)`;
    });

    sliderWrapper.addEventListener('pointerup', (event) => {
        if (!pointerStartX && !pointerStartY) return;

        const distanceX = event.clientX - pointerStartX;
        const distanceY = event.clientY - pointerStartY;
        pointerStartX = 0;
        pointerStartY = 0;

        if (Math.abs(distanceX) >= 45 && Math.abs(distanceX) > Math.abs(distanceY)) {
            distanceX < 0 ? goToNext() : goToPrev();
        } else {
            setPosition(true);
        }
    });

    sliderWrapper.addEventListener('pointercancel', () => {
        pointerStartX = 0;
        pointerStartY = 0;
        setPosition(true);
    });

    window.addEventListener('resize', () => setPosition(false));
    setPosition(false);
}




const form = document.querySelector('.contact__form');

if (form) {
    const submitButton = form.querySelector('[type="submit"]');
    const formStatus = form.querySelector('.contact__form-status');
    const phoneInput = form.querySelector('input[name="phone"]');
    const nameInput = form.elements.name;
    const emailInput = form.elements.email;
    const messageInput = form.elements.message;

    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/[^\d+\-\s()]/g, '');
        });
    }

    function validateField(field) {
        let errorMessage = '';

        if (field === nameInput) {
            if (field.value.trim().length === 0) {
                errorMessage = 'Введите имя.';
            } else if (field.value.trim().length < 2) {
                errorMessage = 'Введите имя не короче двух символов.';
            }
        } else if (field === emailInput) {
            if (field.value.trim().length === 0) {
                errorMessage = 'Введите адрес электронной почты.';
            } else if (field.validity.typeMismatch) {
                errorMessage = 'Введите корректный адрес электронной почты.';
            }
        } else if (field === messageInput) {
            if (field.value.trim().length === 0) {
                errorMessage = 'Введите сообщение.';
            } else if (field.value.length > 200) {
                errorMessage = 'Сообщение не может быть длиннее 200 символов.';
            }
        }

        field.setCustomValidity(errorMessage);

        if (field.value.length > 0 || field.hasAttribute('aria-invalid')) {
            if (field.checkValidity()) {
                field.removeAttribute('aria-invalid');
            } else {
                field.setAttribute('aria-invalid', 'true');
            }
        }

        return field.checkValidity();
    }

    [nameInput, emailInput, messageInput].forEach((field) => {
        if (!field) return;
        field.addEventListener('input', () => validateField(field));
        field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const fields = [nameInput, emailInput, messageInput].filter(Boolean);
        const areValid = fields.map(validateField).every(Boolean);

        if (!areValid) {
            formStatus.className = 'contact__form-status contact__form-status--error';
            formStatus.textContent = 'Please check the highlighted fields and try again.';
            const invalidField = fields.find((field) => !field.checkValidity());
            invalidField?.focus();
            return;
        }

        fields.forEach((field) => field.removeAttribute('aria-invalid'));
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formStatus.className = 'contact__form-status';
        formStatus.textContent = 'Sending your message…';

        window.setTimeout(() => {
            form.reset();
            fields.forEach((field) => {
                field.setCustomValidity('');
                field.removeAttribute('aria-invalid');
            });
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            formStatus.className = 'contact__form-status contact__form-status--success';
            formStatus.textContent = 'Thank you! Your message was sent successfully (demo mode).';
        }, 1000);
    });
}

const footerSubscribeForm = document.querySelector('.footer__subscribe');
if (footerSubscribeForm) {
    footerSubscribeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!footerSubscribeForm.checkValidity()) {
            footerSubscribeForm.reportValidity();
            return;
        }
        const button = footerSubscribeForm.querySelector('button');
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Subscribed';
        footerSubscribeForm.reset();
        window.setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
        }, 1000);
    });
}


const cookieBanner = document.getElementById('cookieBanner');
const cookieModal = document.getElementById('cookieModal');

const acceptBtn = document.getElementById('cookieAcceptBtn');
const declineBtn = document.getElementById('cookieDeclineBtn');
const customizeBtn = document.getElementById('cookieCustomizeBtn');

const modalCloseBtn = document.getElementById('cookieModalClose');
const savePrefsBtn = document.getElementById('cookieSaveBtn');
const modalAcceptAllBtn = document.getElementById('cookieModalAcceptAllBtn');

const analyticsCheckbox = document.getElementById('cookieAnalytics');
const marketingCheckbox = document.getElementById('cookieMarketing');

if (cookieBanner && cookieModal) {
 
  function saveCookieSettings(preferences) {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    cookieBanner.classList.remove('cookie-banner--visible');
    if (cookieModal.open) {
      cookieModal.close();
    }
  }


  const savedPrefs = localStorage.getItem('cookiePreferences');
  if (!savedPrefs) {
    cookieBanner.classList.add('cookie-banner--visible');
  }

  acceptBtn?.addEventListener('click', () => {
    saveCookieSettings({ necessary: true, analytics: true, marketing: true });
  });

  declineBtn?.addEventListener('click', () => {
    saveCookieSettings({ necessary: true, analytics: false, marketing: false });
  });

  customizeBtn?.addEventListener('click', () => {
    cookieModal.showModal(); 
  });


  modalCloseBtn?.addEventListener('click', () => {
    cookieModal.close();
  });

  savePrefsBtn?.addEventListener('click', () => {
    saveCookieSettings({
      necessary: true,
      analytics: analyticsCheckbox.checked,
      marketing: marketingCheckbox.checked
    });
  });

  modalAcceptAllBtn?.addEventListener('click', () => {
    analyticsCheckbox.checked = true;
    marketingCheckbox.checked = true;
    saveCookieSettings({ necessary: true, analytics: true, marketing: true });
  });


  cookieModal.addEventListener('click', (event) => {
    if (event.target === cookieModal) {
      cookieModal.close();
    }
  });
}

