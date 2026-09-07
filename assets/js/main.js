(() => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  scrollProgress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(scrollProgress);

  const pageCurtain = document.createElement('div');
  pageCurtain.className = 'page-curtain';
  pageCurtain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pageCurtain);
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('page-ready')));

  const setHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 30);
  };

  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const updateScrollProgress = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const progress = available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0;
    scrollProgress.style.width = `${progress}%`;
  };
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navMenu.classList.toggle('open', !isOpen);
      document.body.classList.toggle('nav-open', !isOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-menu a').forEach((link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('h1:not(.hero h1), h2').forEach((heading) => {
    if (!heading.classList.contains('reveal') && !heading.closest('.reveal')) return;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode);
    }

    let wordIndex = 0;
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement('span');
        word.className = 'kinetic-word';
        word.style.setProperty('--word-index', wordIndex);
        word.textContent = part;
        wordIndex += 1;
        fragment.appendChild(word);
      });
      node.replaceWith(fragment);
    });
    heading.classList.add('kinetic-title');
  });

  document.querySelectorAll('.service-card .number').forEach((number) => {
    number.dataset.ghost = number.textContent.trim();
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-year]').forEach((item) => {
    item.textContent = new Date().getFullYear();
  });

  const icons = {
    up: '<svg class="stroke-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',
    menu: '<svg class="stroke-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7h8M6 12h12M9 17h6"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"/></svg>',
    phone: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.299c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58z"/></svg>',
    mail: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zm6.761 4.396L0 13.24V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.76l-6.761-4.147L8 9.914zM10.197 8.243 16 11.801V4.697z"/></svg>',
    whatsapp: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.493.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.066-.315-.099-.445.099-.132.197-.513.646-.627.775-.116.132-.231.148-.429.05-.197-.1-.836-.308-1.592-.984-.59-.525-.987-1.175-1.104-1.373-.115-.198-.013-.304.087-.402.09-.088.197-.23.296-.346.1-.116.132-.198.198-.33.066-.132.033-.248-.017-.347-.05-.099-.445-1.076-.61-1.47-.16-.389-.323-.335-.445-.341-.115-.006-.247-.007-.379-.007a.73.73 0 0 0-.528.248c-.182.198-.691.677-.691 1.654s.708 1.916.806 2.049c.099.132 1.394 2.132 3.378 2.992.47.204.84.326 1.127.417.473.15.904.129 1.244.078.38-.057 1.171-.479 1.337-.943.164-.462.164-.858.115-.941-.05-.082-.182-.132-.38-.23"/></svg>'
  };

  const contactType = (element) => {
    const href = element.getAttribute('href') || '';
    if (href.includes('wa.me')) return 'whatsapp';
    if (href.startsWith('tel:')) return 'phone';
    if (href.startsWith('mailto:')) return 'mail';
    return '';
  };

  document.querySelectorAll('.float-btn').forEach((button) => {
    const type = button.classList.contains('back-top') ? 'up' : contactType(button);
    if (!type || !icons[type]) return;
    button.innerHTML = icons[type];
    if (type !== 'up') {
      button.dataset.contact = type;
      button.classList.add('contact-link');
    }
  });

  document.querySelectorAll('.contact-option').forEach((option) => {
    const type = contactType(option);
    const icon = option.querySelector('.contact-icon');
    if (type && icon) icon.innerHTML = icons[type];
  });

  document.querySelectorAll('.document-card').forEach((card) => {
    const previewImage = card.querySelector('.document-preview img');
    if (!previewImage) return;

    let downloadLink = card.querySelector('.document-actions a[download]');
    if (!downloadLink) {
      downloadLink = document.createElement('a');
      downloadLink.href = previewImage.getAttribute('src');
      downloadLink.setAttribute('download', '');
      card.querySelector('.document-actions')?.appendChild(downloadLink);
    }

    const documentTitle = card.querySelector('h3')?.textContent.trim() || 'dokumen';
    const sourceName = previewImage.getAttribute('src')?.split('/').pop() || 'dokumen.png';
    downloadLink.classList.add('document-download');
    downloadLink.setAttribute('download', `Kencana-Baiduri-${sourceName}`);
    downloadLink.setAttribute('aria-label', `Muat turun ${documentTitle}`);
    downloadLink.setAttribute('title', `Muat turun ${documentTitle}`);
    downloadLink.innerHTML = icons.download;
  });

  const floatingContact = document.querySelector('.floating-contact');
  if (floatingContact) {
    const contactToggle = document.createElement('button');
    contactToggle.type = 'button';
    contactToggle.className = 'float-btn contact-toggle';
    contactToggle.setAttribute('aria-label', 'Buka pilihan hubungan');
    contactToggle.setAttribute('aria-expanded', 'false');
    contactToggle.innerHTML = icons.menu;
    floatingContact.appendChild(contactToggle);

    const closeContact = () => {
      floatingContact.classList.remove('expanded');
      contactToggle.setAttribute('aria-expanded', 'false');
      contactToggle.setAttribute('aria-label', 'Buka pilihan hubungan');
    };

    const updateContactVisibility = () => {
      const isVisible = window.scrollY > 220;
      floatingContact.classList.toggle('is-visible', isVisible);
      floatingContact.toggleAttribute('inert', !isVisible);
      floatingContact.setAttribute('aria-hidden', String(!isVisible));
      if (!isVisible) closeContact();
    };

    contactToggle.addEventListener('click', () => {
      const expanded = !floatingContact.classList.contains('expanded');
      floatingContact.classList.toggle('expanded', expanded);
      contactToggle.setAttribute('aria-expanded', String(expanded));
      contactToggle.setAttribute('aria-label', expanded ? 'Tutup pilihan hubungan' : 'Buka pilihan hubungan');
    });

    floatingContact.querySelectorAll('.contact-link').forEach((link) => link.addEventListener('click', closeContact));
    updateContactVisibility();
    window.addEventListener('scroll', updateContactVisibility, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeContact();
    });
  }

  if (!reduceMotion) {
    document.querySelectorAll('.service-card, .document-card, .project-row').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -2.2;
        const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 2.2;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });

    document.querySelectorAll('.company-profile-stage').forEach((stage) => {
      stage.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        const rect = stage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        stage.style.setProperty('--profile-x', `${x}%`);
        stage.style.setProperty('--profile-y', `${y}%`);
      });
      stage.addEventListener('pointerleave', () => {
        stage.style.removeProperty('--profile-x');
        stage.style.removeProperty('--profile-y');
      });
    });

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (finePointer) {
      const ambientCursor = document.createElement('div');
      ambientCursor.className = 'ambient-cursor';
      ambientCursor.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ambientCursor);

      let cursorX = -300;
      let cursorY = -300;
      let cursorFrame = 0;
      const paintCursor = () => {
        ambientCursor.style.left = `${cursorX}px`;
        ambientCursor.style.top = `${cursorY}px`;
        cursorFrame = 0;
      };

      document.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        cursorX = event.clientX;
        cursorY = event.clientY;
        ambientCursor.classList.add('is-active');
        if (!cursorFrame) cursorFrame = requestAnimationFrame(paintCursor);
      }, { passive: true });

      document.querySelectorAll('a, button, .service-card, .project-row, .gallery-item, .document-card, .company-detail, .org-node').forEach((target) => {
        target.addEventListener('pointerenter', () => ambientCursor.classList.add('is-hovering'));
        target.addEventListener('pointerleave', () => ambientCursor.classList.remove('is-hovering'));
      });

      document.querySelectorAll('.btn').forEach((button) => {
        button.addEventListener('pointermove', (event) => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
          const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
          button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        button.addEventListener('pointerleave', () => {
          button.style.transform = '';
        });
      });

      document.querySelectorAll('.hero, .page-hero, .section, .cta-band').forEach((surface) => {
        surface.addEventListener('pointermove', (event) => {
          const rect = surface.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          const prefix = surface.matches('.hero, .page-hero') ? 'hero' : 'section';
          surface.style.setProperty(`--${prefix}-x`, `${x}%`);
          surface.style.setProperty(`--${prefix}-y`, `${y}%`);
        });
      });
    }

    const numberItems = document.querySelectorAll('.stat strong, .metric strong');
    const numberObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const original = element.textContent.trim();
        const match = original.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
        if (!match) {
          observer.unobserve(element);
          return;
        }

        const prefix = match[1];
        const target = Number(match[2].replace(/,/g, ''));
        const suffix = match[3];
        const decimals = (match[2].split('.')[1] || '').length;
        const useGrouping = match[2].includes(',');
        const startValue = target > 1900 && target < 2100 ? target - 24 : 0;
        const startedAt = performance.now();
        const duration = target > 10000 ? 1700 : 1250;

        const tick = (now) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = startValue + (target - startValue) * eased;
          element.textContent = prefix + value.toLocaleString('en-MY', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping
          }) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.unobserve(element);
      });
    }, { threshold: 0.45 });
    numberItems.forEach((item) => numberObserver.observe(item));
  }

  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.hash) return;

      event.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => window.location.assign(destination.href), reduceMotion ? 0 : 560);
    });
  });

  const backTop = document.querySelector('.back-top');
  if (backTop) {
    const updateBackTop = () => backTop.classList.toggle('visible', window.scrollY > 550);
    updateBackTop();
    window.addEventListener('scroll', updateBackTop, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const lightboxItems = Array.from(document.querySelectorAll('.document-preview[data-lightbox], .gallery-item[data-lightbox]'));
  if (lightboxItems.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Paparan imej penuh');
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Tutup paparan">&times;</button>
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Imej sebelumnya">&#8592;</button>
      <figure class="lightbox-figure">
        <img src="" alt="">
        <figcaption></figcaption>
      </figure>
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Imej seterusnya">&#8594;</button>`;
    document.body.appendChild(lightbox);

    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('figcaption');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');
    let activeIndex = 0;
    let lastFocus = null;

    const renderLightbox = () => {
      const item = lightboxItems[activeIndex];
      const itemImage = item.querySelector('img');
      image.src = item.dataset.full || itemImage.src;
      image.alt = itemImage.alt || '';
      image.className = '';
      if (item.classList.contains('gallery-item')) image.classList.add('gallery-lightbox-image');
      if (item.dataset.crop === 'photo') image.classList.add('gallery-photo-crop');
      caption.textContent = item.dataset.caption || itemImage.alt || '';
    };

    const openLightbox = (index) => {
      activeIndex = index;
      lastFocus = document.activeElement;
      renderLightbox();
      lightbox.classList.add('open');
      document.body.classList.add('lightbox-open');
      closeButton.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      if (lastFocus) lastFocus.focus();
    };

    const moveLightbox = (direction) => {
      activeIndex = (activeIndex + direction + lightboxItems.length) % lightboxItems.length;
      renderLightbox();
    };

    lightboxItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index)));
    document.querySelectorAll('.document-actions [data-lightbox]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const triggerImage = trigger.querySelector('img');
        const matchingIndex = lightboxItems.findIndex((item) => {
          const itemImage = item.querySelector('img');
          return itemImage && triggerImage && itemImage.src === triggerImage.src;
        });
        if (matchingIndex >= 0) openLightbox(matchingIndex);
      });
    });
    closeButton.addEventListener('click', closeLightbox);
    prevButton.addEventListener('click', () => moveLightbox(-1));
    nextButton.addEventListener('click', () => moveLightbox(1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') moveLightbox(-1);
      if (event.key === 'ArrowRight') moveLightbox(1);
    });
  }
})();
