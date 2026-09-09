(() => {
  'use strict';

  const triggers = Array.from(document.querySelectorAll('[data-certificate]'));
  const viewer = document.getElementById('certificate-viewer');
  if (!viewer || !triggers.length) return;

  const canvas = viewer.querySelector('canvas');
  const context = canvas.getContext('2d');
  const sheet = viewer.querySelector('.certificate-sheet');
  const viewport = viewer.querySelector('.certificate-viewport');
  const title = viewer.querySelector('#certificate-title');
  const status = viewer.querySelector('.certificate-status');
  const count = viewer.querySelector('.certificate-count');
  const closeButton = viewer.querySelector('.certificate-close');
  const zoomButton = viewer.querySelector('.certificate-zoom');
  let activeIndex = 0;
  let requestId = 0;
  let returnFocus = null;
  let scrollPosition = 0;
  let zoomed = false;
  let restored = true;
  let fallbackSiblings = [];

  const fitSheet = () => {
    if (!viewer.open || sheet.hidden || !canvas.width || !canvas.height) return;
    const availableWidth = Math.max(1, viewport.clientWidth - 32);
    const availableHeight = Math.max(1, viewport.clientHeight - 32);
    const scale = zoomed
      ? Math.max(availableWidth, Math.min(canvas.width, 1100)) / canvas.width
      : Math.min(availableWidth / canvas.width, availableHeight / canvas.height, 1);
    sheet.style.width = `${Math.round(canvas.width * scale)}px`;
    sheet.style.height = `${Math.round(canvas.height * scale)}px`;
  };

  const resetZoom = () => {
    zoomed = false;
    zoomButton.disabled = true;
    zoomButton.textContent = 'Besarkan';
    zoomButton.setAttribute('aria-pressed', 'false');
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
  };

  // A deterrent to casual saving, not access control or DRM. Source files
  // delivered by a public website can still be copied outside this viewer.
  const drawReferenceMark = () => {
    const { width, height } = canvas;
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(-Math.PI / 7);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `600 ${Math.max(16, width * 0.023)}px Arial, sans-serif`;
    [-height * 0.27, 0, height * 0.27].forEach((y) => {
      context.fillStyle = 'rgba(255, 255, 255, 0.40)';
      context.fillRect(-width, y - width * 0.035, width * 2, width * 0.07);
      context.fillStyle = 'rgba(12, 24, 52, 0.52)';
      context.fillText('KENCANA BAIDURI ENTERPRISE', 0, y - width * 0.014, width * 0.88);
      context.font = `600 ${Math.max(13, width * 0.016)}px Arial, sans-serif`;
      context.fillText('UNTUK RUJUKAN SAHAJA', 0, y + width * 0.016, width * 0.8);
      context.font = `600 ${Math.max(16, width * 0.023)}px Arial, sans-serif`;
    });
    context.restore();
  };

  const renderCertificate = () => {
    const currentRequest = ++requestId;
    const trigger = triggers[activeIndex];
    title.textContent = trigger.dataset.caption;
    count.textContent = `${activeIndex + 1} / ${triggers.length}`;
    canvas.setAttribute('aria-label', `${trigger.dataset.caption}. Untuk rujukan sahaja.`);
    sheet.hidden = true;
    canvas.width = canvas.height = 1;
    status.hidden = false;
    status.textContent = 'Memuatkan sijil…';
    viewport.setAttribute('aria-busy', 'true');
    resetZoom();

    const showError = () => {
      if (currentRequest !== requestId || !viewer.open) return;
      status.textContent = 'Sijil tidak dapat dipaparkan. Tutup paparan dan cuba semula.';
      viewport.setAttribute('aria-busy', 'false');
    };
    if (!context) { showError(); return; }

    // Keep the source image off the DOM: no image link, image context menu,
    // native PDF toolbar, or downloadable image element is shown to visitors.
    const source = new Image();
    source.decoding = 'async';
    source.onload = () => {
      if (currentRequest !== requestId || !viewer.open) return;
      if (!source.naturalWidth || !source.naturalHeight) { showError(); return; }
      const scale = Math.min(1, 1800 / Math.max(source.naturalWidth, source.naturalHeight));
      canvas.width = Math.round(source.naturalWidth * scale);
      canvas.height = Math.round(source.naturalHeight * scale);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      drawReferenceMark();
      status.hidden = true;
      sheet.hidden = false;
      zoomButton.disabled = false;
      viewport.setAttribute('aria-busy', 'false');
      fitSheet();
    };
    source.onerror = showError;
    source.src = trigger.dataset.certificate;
  };

  const restorePage = () => {
    if (restored) return;
    restored = true;
    ++requestId;
    canvas.width = canvas.height = 1;
    sheet.hidden = true;
    document.body.classList.remove('certificate-open-page');
    document.body.style.removeProperty('--certificate-scroll-y');
    fallbackSiblings.forEach(([element, wasInert]) => { element.inert = wasInert; });
    fallbackSiblings = [];
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollPosition);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  };

  const closeViewer = () => {
    if (!viewer.open) return;
    if (typeof viewer.close === 'function') viewer.close();
    else viewer.removeAttribute('open');
    restorePage();
  };

  const openViewer = (index) => {
    if (viewer.open) return;
    activeIndex = index;
    returnFocus = document.activeElement;
    scrollPosition = window.scrollY;
    restored = false;
    document.body.style.setProperty('--certificate-scroll-y', `-${scrollPosition}px`);
    document.body.classList.add('certificate-open-page');
    if (typeof viewer.showModal === 'function') viewer.showModal();
    else {
      viewer.setAttribute('open', '');
      viewer.setAttribute('role', 'dialog');
      viewer.setAttribute('aria-modal', 'true');
      fallbackSiblings = Array.from(document.body.children)
        .filter((element) => element !== viewer)
        .map((element) => [element, element.inert]);
      fallbackSiblings.forEach(([element]) => { element.inert = true; });
    }
    renderCertificate();
    closeButton.focus({ preventScroll: true });
  };

  const move = (direction) => {
    activeIndex = (activeIndex + direction + triggers.length) % triggers.length;
    renderCertificate();
  };

  triggers.forEach((trigger, index) => trigger.addEventListener('click', () => openViewer(index)));
  closeButton.addEventListener('click', closeViewer);
  viewer.querySelector('.certificate-prev').addEventListener('click', () => move(-1));
  viewer.querySelector('.certificate-next').addEventListener('click', () => move(1));
  viewer.addEventListener('close', restorePage);
  viewer.addEventListener('cancel', (event) => { event.preventDefault(); closeViewer(); });
  zoomButton.addEventListener('click', () => {
    zoomed = !zoomed;
    zoomButton.textContent = zoomed ? 'Muatkan' : 'Besarkan';
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    fitSheet();
  });

  ['contextmenu', 'dragstart', 'selectstart', 'copy', 'cut'].forEach((eventName) => {
    viewer.addEventListener(eventName, (event) => event.preventDefault());
  });
  document.addEventListener('keydown', (event) => {
    if (!viewer.open) return;
    if ((event.ctrlKey || event.metaKey) && ['s', 'p', 'c'].includes(event.key.toLowerCase())) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Escape') { event.preventDefault(); closeViewer(); }
    if (event.key === 'ArrowLeft' && !zoomed) { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight' && !zoomed) { event.preventDefault(); move(1); }
    if (event.key === 'Tab') {
      const focusable = Array.from(viewer.querySelectorAll('button:not(:disabled), [tabindex="0"]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  if (typeof ResizeObserver === 'function') new ResizeObserver(fitSheet).observe(viewport);
  else window.addEventListener('resize', fitSheet, { passive: true });
  window.addEventListener('pagehide', closeViewer);
})();
