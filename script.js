(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // An editorial trailing pointer for mouse/trackpad only. Never replace touch,
  // keyboard focus indicators, or the native cursor in text form fields.
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const follower = document.querySelector('.cursor-follower');
    if (follower) {
      document.documentElement.classList.add('has-custom-cursor');
      const label = follower.querySelector('.cursor-label');
      let targetX = -100, targetY = -100, currentX = -100, currentY = -100, raf = 0;
      function animatePointer() {
        currentX += (targetX - currentX) * .28;
        currentY += (targetY - currentY) * .28;
        follower.style.transform = `translate3d(${currentX - follower.offsetWidth / 2}px, ${currentY - follower.offsetHeight / 2}px, 0)`;
        if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .5) raf = window.requestAnimationFrame(animatePointer);
        else raf = 0;
      }
      document.addEventListener('pointermove', event => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        targetX = event.clientX;
        targetY = event.clientY;
        const interactive = event.target instanceof Element ? event.target.closest('a,button,.project-tile') : null;
        follower.classList.add('is-visible');
        follower.classList.toggle('is-interactive', Boolean(interactive));
        if (label) label.textContent = interactive?.matches('button') ? 'CLICK' : 'VIEW';
        if (!raf) raf = window.requestAnimationFrame(animatePointer);
      }, {passive:true});
      document.addEventListener('pointerdown', () => follower.classList.add('is-pressed'));
      document.addEventListener('pointerup', () => follower.classList.remove('is-pressed'));
      document.addEventListener('pointerleave', () => follower.classList.remove('is-visible'));
      window.addEventListener('blur', () => follower.classList.remove('is-visible'));
    }
  }
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  let previousFocus = null;

  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      previousFocus = document.activeElement;
      mobileMenu.querySelector('a')?.focus();
    } else if (mobileMenu.contains(document.activeElement)) {
      (previousFocus || menuButton).focus();
    }
  }

  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
    if (event.key !== 'Tab' || menuButton?.getAttribute('aria-expanded') !== 'true' || !mobileMenu) return;
    const links = [...mobileMenu.querySelectorAll('a')];
    if (!links.length) return;
    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
    else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 970 && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // A small on-device FAQ helper. It is intentionally rules-based:
  // no remote model, chat backend, visitor tracking or automatic sending.
  const chatLauncher = document.querySelector('.chat-launcher');
  const chatPanel = document.getElementById('chat-panel');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatForm = document.getElementById('chat-form');
  const chatAnswers = {
    services: 'Dineshbabu works on responsive business sites, personal portfolios, static and dynamic websites, WordPress, Wix and website redesigns. The right setup depends on your goals.',
    seo: 'Yes. SDB Web Studio offers technical, on-page and local SEO support, such as titles, page structure, indexing checks, content planning and search-friendly foundations. Rankings cannot be guaranteed.',
    worldwide: 'Yes! Dineshbabu is currently based in Chennai, India and welcomes remote freelance projects from clients worldwide.',
    budget: 'You can enquire from a ₹500 budget range for small requests. A complete website is not promised at ₹500. Final estimates depend on scope, content, features and hosting needs.',
    timeline: 'Timing depends on the project scope, content, revisions and integrations. Share your goal and ideal launch date for a realistic schedule.',
    contact: 'Call +91 7904927983, use the contact page, email s.dineshbabu@yahoo.com, or open the WhatsApp button below. WhatsApp prepares a draft; you choose when to send.'
  };
  const chatLabels = {
    services: 'What websites can you create?',
    seo: 'Do you offer SEO?',
    worldwide: 'Do you work worldwide?',
    budget: 'Can I ask with a ₹500 budget?',
    timeline: 'How long will it take?',
    contact: 'How can I contact you?'
  };
  function chooseAnswer(message) {
    const query = message.toLowerCase();
    if (/budget|price|cost|quote|cheap|\b500\b|₹|payment|rate/.test(query)) return chatAnswers.budget;
    if (/seo|google|search|ranking|keyword|traffic/.test(query)) return chatAnswers.seo;
    if (/world|global|remote|chennai|country|location|international/.test(query)) return chatAnswers.worldwide;
    if (/contact|phone|call|whatsapp|email|number|reach/.test(query)) return chatAnswers.contact;
    if (/time|deadline|week|month|long|when|delivery/.test(query)) return chatAnswers.timeline;
    if (/website|site|web|wordpress|wix|design|develop|portfolio|app|service/.test(query)) return chatAnswers.services;
    return 'I can answer basic questions about websites, SEO, budget, timelines and contact details. For a specific project question, please use the WhatsApp link or contact form.';
  }
  function addChatMessage(type, content) {
    if (!chatMessages) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (type === 'user' ? 'chat-user' : 'chat-bot');
    if (type === 'bot') {
      const sender = document.createElement('small');
      sender.textContent = 'SDB / QUICK GUIDE';
      bubble.append(sender);
    }
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    bubble.append(paragraph);
    chatMessages.append(bubble);
    // Avoid unbounded on-page message accumulation.
    while (chatMessages.children.length > 26) chatMessages.firstElementChild?.remove();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  let chatBusy = false;
  function respondToChat(question, answer) {
    if (chatBusy || !chatMessages) return;
    chatBusy = true;
    addChatMessage('user', question);
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.setAttribute('aria-label', 'Quick guide preparing an answer');
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.append(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    window.setTimeout(() => {
      typing.remove();
      addChatMessage('bot', answer);
      chatBusy = false;
    }, prefersReducedMotion ? 0 : 470);
  }
  function setChatOpen(open) {
    if (!chatPanel || !chatLauncher) return;
    chatPanel.hidden = !open;
    chatLauncher.setAttribute('aria-expanded', String(open));
    chatLauncher.setAttribute('aria-label', open ? 'Quick answers open' : 'Open SDB quick answers');
    if (open) chatInput?.focus();
    else if (chatPanel.contains(document.activeElement)) chatLauncher.focus();
  }
  chatLauncher?.addEventListener('click', () => setChatOpen(chatPanel?.hidden ?? true));
  document.querySelector('[data-chat-close]')?.addEventListener('click', () => setChatOpen(false));
  document.querySelectorAll('[data-chat-question]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.chatQuestion;
      if (chatLabels[key] && chatAnswers[key]) respondToChat(chatLabels[key],chatAnswers[key]);
    });
  });
  chatForm?.addEventListener('submit', event => {
    event.preventDefault();
    const question = chatInput?.value.trim();
    if (!question || chatBusy) return;
    chatInput.value = '';
    respondToChat(question,chooseAnswer(question));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chatPanel && !chatPanel.hidden) setChatOpen(false);
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  }

  const deck = document.querySelector('.card-deck');
  if (deck) {
    const cards = [...deck.querySelectorAll('.deck-card')];
    const positionText = document.querySelector('.deck-position');
    let frontIndex = 0;
    let timer;
    let hovering = false;
    let busy = false;
    let visible = true;
    let touchStart = null;
    const delay = 4800;

    function layout() {
      cards.forEach((card, index) => {
        card.dataset.slot = String((index - frontIndex + cards.length) % cards.length);
        card.removeAttribute('data-leaving');
        card.setAttribute('aria-hidden', index === frontIndex ? 'false' : 'true');
      });
      if (positionText) positionText.textContent = `${String(frontIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    }

    function move(delta = 1) {
      if (busy || !cards.length) return;
      if (prefersReducedMotion) {
        frontIndex = (frontIndex + delta + cards.length) % cards.length;
        layout();
        return;
      }
      busy = true;
      const departing = cards[frontIndex];
      departing.dataset.leaving = 'true';
      window.setTimeout(() => {
        frontIndex = (frontIndex + delta + cards.length) % cards.length;
        layout();
        busy = false;
      }, 540);
    }
    function stop() { window.clearInterval(timer); timer = undefined; }
    function start() {
      stop();
      if (!prefersReducedMotion && !hovering && visible) timer = window.setInterval(() => move(1), delay);
    }
    layout();
    start();
    deck.addEventListener('mouseenter', () => { hovering = true; stop(); });
    deck.addEventListener('mouseleave', () => { hovering = false; start(); });
    deck.addEventListener('focusin', stop);
    deck.addEventListener('focusout', start);
    deck.addEventListener('touchstart', e => { touchStart = e.touches[0]?.clientX ?? null; }, { passive: true });
    deck.addEventListener('touchend', e => {
      if (touchStart === null) return;
      const difference = (e.changedTouches[0]?.clientX ?? touchStart) - touchStart;
      touchStart = null;
      if (Math.abs(difference) > 55) { move(difference < 0 ? 1 : -1); start(); }
    }, { passive: true });
    document.querySelector('[data-deck-next]')?.addEventListener('click', () => { move(1); start(); });
    document.querySelector('[data-deck-prev]')?.addEventListener('click', () => { move(-1); start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? true;
        visible ? start() : stop();
      }, { threshold: .15 }).observe(deck);
    }
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  const filters = [...document.querySelectorAll('.filter-btn')];
  const projects = [...document.querySelectorAll('.project-tile')];
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    projects.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
    const count = projects.filter(card => !card.hidden).length;
    const summary = document.getElementById('filter-summary');
    if (summary) summary.textContent = `${count} portfolio ${count === 1 ? 'entry' : 'entries'} shown`;
  }));

  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-expanded', String(!expanded));
      if (answer) answer.hidden = expanded;
    });
  });

  const form = document.getElementById('enquiry-form');
  if (form) {
    const params = new URLSearchParams(window.location.search);
    // Carry visitor-chosen options from the on-page planner, without sending data.
    ['service','budget','timeline','websiteType'].forEach(name => {
      const requestedValue = params.get(name);
      const select = form.querySelector('select[name="' + name + '"]');
      if (!requestedValue || !select) return;
      const match = [...select.options].find(option => option.value.toLowerCase() === requestedValue.toLowerCase());
      if (match) select.value = match.value;
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const status = document.getElementById('form-status');
      if (!form.reportValidity()) {
        if (status) { status.hidden = false; status.textContent = 'Please check the required fields before continuing.'; }
        return;
      }
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const service = String(data.get('service') || '').trim();
      const lines = [
        'Hello Dineshbabu,',
        '',
        'I would like to discuss a website project.',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Company / business: ${data.get('business') || 'Not supplied'}`,
        `Service: ${service}`,
        `Website type: ${data.get('websiteType') || 'Not supplied'}`,
        `Existing website URL: ${data.get('websiteUrl') || 'Not supplied'}`,
        `Budget range: ${data.get('budget') || 'Not supplied'}`,
        `Preferred timeline: ${data.get('timeline') || 'Not supplied'}`,
        '',
        'Project description:',
        String(data.get('description') || '').trim(),
        '',
        'Please reply to the email address above.'
      ];
      const subject = `Website enquiry — ${service || 'New project'} — ${name}`;
      const mailto = `mailto:s.dineshbabu@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      if (status) {
        status.hidden = false;
        status.textContent = 'Your email application should open with a prepared enquiry. Review it and press Send there. Nothing has been submitted automatically; if it does not open, email s.dineshbabu@yahoo.com directly.';
        status.focus();
      }
      window.location.href = mailto;
    });
  }

  const topButton = document.querySelector('.back-to-top');
  if (topButton) {
    const update = () => topButton.classList.toggle('visible', window.scrollY > 700);
    window.addEventListener('scroll', update, { passive: true });
    update();
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' }));
  }

  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let requested = false;
    const paintProgress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1,Math.max(0,window.scrollY / max))})`;
      requested = false;
    };
    window.addEventListener('scroll', () => {
      if (!requested) { requested = true; window.requestAnimationFrame(paintProgress); }
    }, { passive: true });
    window.addEventListener('resize', paintProgress);
    paintProgress();
  }

  document.querySelectorAll('.tech-logo img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  // The interactive style lab is a genuine three-state preview, not a static illustration.
  const labScene = document.querySelector('[data-lab-scene]');
  const labTabs = [...document.querySelectorAll('[data-lab-mode]')];
  const labDirections = {
    identity: {
      kicker: '01 / THE BRAND',
      title: 'MAKE IT<br>MATTER<span>.</span>',
      description: 'One clear idea. An unforgettable digital presence.',
      note: 'BRAND<br>ENERGY'
    },
    motion: {
      kicker: '02 / THE EXPERIENCE',
      title: 'FEEL THE<br>FLOW<span>.</span>',
      description: 'Interfaces that respond, transition and invite exploration.',
      note: 'FLUID<br>FLOW'
    },
    seo: {
      kicker: '03 / DISCOVERABILITY',
      title: 'BE SEEN.<br>BE FOUND<span>.</span>',
      description: 'Thoughtful hierarchy, clean content and search-ready foundations.',
      note: 'SEO<br>READY'
    }
  };
  let labAnimationTimeout;
  function selectLabDirection(button, moveFocus = false) {
    if (!labScene) return;
    const mode = button.dataset.labMode;
    const direction = labDirections[mode];
    if (!direction) return;
    labTabs.forEach(tab => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-active', active);
    });
    labScene.dataset.labScene = mode;
    labScene.setAttribute('aria-labelledby', button.id);
    labScene.querySelector('[data-lab-kicker]').textContent = direction.kicker;
    labScene.querySelector('[data-lab-title]').innerHTML = direction.title;
    labScene.querySelector('[data-lab-description]').textContent = direction.description;
    labScene.querySelector('[data-lab-note]').innerHTML = direction.note;
    const coordinate = labScene.querySelector('.lab-coordinate');
    if (coordinate) coordinate.textContent = 'SDB / EXPERIMENT ' + String(labTabs.indexOf(button) + 1).padStart(2, '0');
    if (!prefersReducedMotion) {
      window.clearTimeout(labAnimationTimeout);
      labScene.classList.remove('is-switching');
      // Restart this short entrance for each deliberate tab selection.
      void labScene.offsetWidth;
      labScene.classList.add('is-switching');
      labAnimationTimeout = window.setTimeout(() => labScene.classList.remove('is-switching'), 850);
    }
    if (moveFocus) button.focus();
  }
  labTabs.forEach((button, index) => {
    button.addEventListener('click', () => selectLabDirection(button));
    button.addEventListener('keydown', event => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % labTabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + labTabs.length) % labTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = labTabs.length - 1;
      else return;
      event.preventDefault();
      selectLabDirection(labTabs[nextIndex], true);
    });
  });

  const planner = document.querySelector('[data-project-planner]');
  if (planner) {
    const choices = { goal: null, budget: null, timeline: null };
    const labels = ['01 / THE PROJECT','02 / EXPECTED BUDGET','03 / TIMELINE','YOUR PROJECT DIRECTION'];
    const servicesByGoal = {
      business: ['Static Website Development','A professional business website is a useful starting direction. The structure and final quote can be shaped around your pages and requirements.'],
      interactive: ['Dynamic Website Development','An interactive experience needs clear functionality and a suitable development approach. We can discuss the features before estimating work.'],
      wordpress: ['WordPress Website Development','A content-managed website could be a good fit if you need the flexibility to edit pages and updates yourself.'],
      seo: ['SEO & Local Search Optimization','An SEO review can help identify practical improvements to structure, content, technical foundations and local relevance.']
    };
    const panels = [...planner.querySelectorAll('[data-planner-step]')];
    const next = planner.querySelector('[data-planner-next]');
    const back = planner.querySelector('[data-planner-back]');
    const reset = planner.querySelector('[data-planner-reset]');
    const status = planner.querySelector('[data-planner-status]');
    const label = planner.querySelector('[data-planner-label]');
    const count = planner.querySelector('[data-planner-count]');
    const track = planner.querySelector('[data-planner-track]');
    let step = 0;
    function showStep(focusHeading = false) {
      panels.forEach((panel, index) => {
        panel.hidden = index !== step;
        panel.classList.remove('is-entering');
        if (index === step && !prefersReducedMotion) {
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });
      if (label) label.textContent = labels[step];
      if (count) count.textContent = step === 3 ? 'YOUR STARTING POINT' : 'STEP 0' + (step + 1) + ' OF 03';
      if (track) track.style.width = Math.min(100, (step + 1) / 3 * 100) + '%';
      if (back) back.hidden = step === 0 || step === 3;
      if (reset) reset.hidden = step !== 3;
      if (next) {
        next.hidden = step === 3;
        next.disabled = !choices[['goal','budget','timeline'][step]];
        next.innerHTML = step === 2 ? 'See my direction <span aria-hidden="true">↗</span>' : 'Continue <span aria-hidden="true">↗</span>';
      }
      if (status) status.textContent = step === 3 ? 'Ready for a conversation' : (choices[['goal','budget','timeline'][step]] ? 'Selection saved' : 'Select one option to continue');
      if (step === 3) {
        const [service,description] = servicesByGoal[choices.goal] || servicesByGoal.business;
        planner.querySelector('[data-planner-service]').textContent = service;
        planner.querySelector('[data-planner-result-description]').textContent = description + ' This is a starting suggestion, not an automatic quote.';
        planner.querySelector('[data-planner-budget]').textContent = choices.budget;
        planner.querySelector('[data-planner-timeline]').textContent = choices.timeline;
        const params = new URLSearchParams({ service, timeline: choices.timeline });
        if (choices.budget !== 'Prefer to discuss') params.set('budget', choices.budget);
        planner.querySelector('[data-planner-contact]').href = new URL('./contact/?' + params.toString(), document.baseURI).href;
      }
      if (focusHeading) panels[step]?.querySelector('h3')?.focus({ preventScroll: true });
    }
    planner.querySelectorAll('[data-planner-choice]').forEach(button => {
      button.addEventListener('click', () => {
        const group = button.dataset.plannerChoice;
        choices[group] = button.dataset.plannerValue;
        planner.querySelectorAll('[data-planner-choice="' + group + '"]').forEach(choice => {
          choice.setAttribute('aria-pressed', String(choice === button));
        });
        showStep();
      });
    });
    next?.addEventListener('click', () => {
      if (step > 2 || !choices[['goal','budget','timeline'][step]]) return;
      step += 1;
      showStep(true);
    });
    back?.addEventListener('click', () => {
      if (step <= 0) return;
      step -= 1;
      showStep(true);
    });
    reset?.addEventListener('click', () => {
      Object.keys(choices).forEach(key => { choices[key] = null; });
      planner.querySelectorAll('[data-planner-choice]').forEach(choice => choice.setAttribute('aria-pressed','false'));
      step = 0;
      showStep(true);
    });
    showStep();
  }

  // Gentle, bounded mouse motion: ignored for touch, keyboard and reduced-motion visitors.
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    if (labScene) {
      labScene.addEventListener('pointermove', event => {
        const bounds = labScene.getBoundingClientRect();
        const dx = (event.clientX - bounds.left) / bounds.width - .5;
        const dy = (event.clientY - bounds.top) / bounds.height - .5;
        labScene.style.setProperty('--tilt-x', (dy * -7).toFixed(2) + 'deg');
        labScene.style.setProperty('--tilt-y', (dx * 7).toFixed(2) + 'deg');
      }, { passive: true });
      labScene.addEventListener('pointerleave', () => {
        labScene.style.setProperty('--tilt-x', '0deg');
        labScene.style.setProperty('--tilt-y', '0deg');
      });
    }
    document.querySelectorAll('.hero-actions .btn, .header-cta, .cta-band .btn').forEach(button => {
      button.dataset.magnetic = '';
      button.addEventListener('pointermove', event => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * .1;
        const y = (event.clientY - bounds.top - bounds.height / 2) * .1;
        button.style.setProperty('--magnet-x', Math.max(-10, Math.min(10, x)).toFixed(1) + 'px');
        button.style.setProperty('--magnet-y', Math.max(-7, Math.min(7, y)).toFixed(1) + 'px');
      }, { passive: true });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--magnet-x', '0px');
        button.style.setProperty('--magnet-y', '0px');
      });
    });
  }

  // Stagger service storytelling without animating hidden, off-screen sections forever.
  document.querySelectorAll('.services-list .service-row, .process-grid .process-step').forEach((item, index) => {
    item.style.setProperty('--reveal-stagger', ((index % 4) * 65) + 'ms');
  });

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const film = document.querySelector('.film-frame video');
  const videoToggle = document.querySelector('[data-video-toggle]');
  if (film) {
    let manuallyPaused = prefersReducedMotion;
    const label = () => {
      if (!videoToggle) return;
      const paused = film.paused || manuallyPaused;
      videoToggle.textContent = paused ? 'Play film ▶' : 'Pause film Ⅱ';
      videoToggle.setAttribute('aria-label', paused ? 'Play cinematic video' : 'Pause cinematic video');
      videoToggle.setAttribute('aria-pressed', String(!paused));
    };
    videoToggle?.addEventListener('click', () => {
      if (film.paused || manuallyPaused) {
        manuallyPaused = false;
        film.play().then(label).catch(() => { videoToggle.textContent = 'Video unavailable'; videoToggle.disabled = true; });
      } else { manuallyPaused = true; film.pause(); label(); }
    });
    film.addEventListener('play', label);
    film.addEventListener('pause', label);
    film.addEventListener('error', () => {
      if (videoToggle) { videoToggle.textContent = 'Video unavailable'; videoToggle.disabled = true; }
    });
    if (prefersReducedMotion) film.pause();
    label();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries[0]?.isIntersecting || prefersReducedMotion || manuallyPaused) film.pause();
        else film.play().catch(() => {});
      }, { threshold: .1 });
      observer.observe(film);
    }
  }
})();

/* Microsoft Clarity Analytics */
(function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() {
        (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "z680gyrosr");
