const siteMenu = document.querySelector('.site-menu');
const siteMenuButton = document.querySelector('.site-menu-button');
const siteNavigation = document.getElementById('site-navigation');
const desktopNavigation = matchMedia('(min-width: 1200px)');

const siteMenuClose = siteNavigation.querySelector('.site-nav-close');

function setMenuOpen(open) {
  siteMenu.classList.toggle('is-open', open);
  siteMenuButton.setAttribute('aria-expanded', String(open));
  siteMenuButton.textContent = open ? 'Zamknij' : 'Menu';
  document.documentElement.classList.toggle('site-menu-open', open && !desktopNavigation.matches);
}

siteMenuButton.addEventListener('click', () => {
  const open = siteMenuButton.getAttribute('aria-expanded') !== 'true';
  setMenuOpen(open);
  if (open && siteMenuClose && !desktopNavigation.matches) siteMenuClose.focus();
});

if (siteMenuClose) {
  siteMenuClose.addEventListener('click', () => {
    setMenuOpen(false);
    siteMenuButton.focus();
  });
}

siteMenu.addEventListener('click', event => {
  if (event.target === siteMenu) setMenuOpen(false);
});

siteNavigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenuOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && siteMenu.classList.contains('is-open')) {
    setMenuOpen(false);
    siteMenuButton.focus();
  }
});

document.addEventListener('click', event => {
  if (!siteMenu.contains(event.target)) setMenuOpen(false);
});

document.addEventListener('focusin', event => {
  if (!siteMenu.contains(event.target)) setMenuOpen(false);
});

desktopNavigation.addEventListener('change', () => setMenuOpen(false));

const disclosureQuery = matchMedia('(max-width: 760px)');
const responsiveDetails = [...document.querySelectorAll('details[data-responsive-disclosure]')];
const applyResponsiveDetails = () => {
  responsiveDetails.forEach(detail => { detail.open = !disclosureQuery.matches; });
};
applyResponsiveDetails();
disclosureQuery.addEventListener('change', applyResponsiveDetails);

const revealAnchoredDisclosure = () => {
  const id = location.hash.slice(1);
  if (!id) return;
  let target = null;
  try { target = document.getElementById(decodeURIComponent(id)); } catch (_) {}
  const disclosure = target && (target.closest('details[data-responsive-disclosure]') || target.querySelector('details[data-responsive-disclosure]'));
  if (disclosure) disclosure.open = true;
};
window.addEventListener('hashchange', revealAnchoredDisclosure);
revealAnchoredDisclosure();

const galleryTrack = document.getElementById('galTrack');
if (galleryTrack) {
  const filters = document.querySelector('.gallery-filters');
  const filterButtons = [...filters.querySelectorAll('[data-gallery-filter]')];
  const items = [...galleryTrack.querySelectorAll('.gal-item')];
  const previous = document.querySelector('.gal-prev');
  const next = document.querySelector('.gal-next');
  const status = document.querySelector('.gallery-status');

  const updateGalleryControls = () => {
    previous.disabled = galleryTrack.scrollLeft <= 2;
    next.disabled = galleryTrack.scrollLeft >= galleryTrack.scrollWidth - galleryTrack.clientWidth - 2;
  };

  const selectCategory = button => {
    const category = button.dataset.galleryFilter;
    items.forEach(item => {
      item.hidden = category !== 'all' && item.dataset.category !== category;
    });
    filterButtons.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    galleryTrack.scrollTo({ left: 0, behavior: 'instant' });
    status.textContent = `${button.textContent}. Liczba zdjęć ${items.filter(item => !item.hidden).length}.`;
    updateGalleryControls();
  };

  const scrollGallery = direction => {
    const item = items.find(item => !item.hidden);
    const gap = parseFloat(getComputedStyle(galleryTrack).columnGap) || 0;
    const step = item.getBoundingClientRect().width + gap;
    galleryTrack.scrollBy({
      left: direction * step,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  };

  filterButtons.forEach(button => button.addEventListener('click', () => selectCategory(button)));
  previous.addEventListener('click', () => scrollGallery(-1));
  next.addEventListener('click', () => scrollGallery(1));
  galleryTrack.addEventListener('scroll', updateGalleryControls, { passive: true });
  window.addEventListener('resize', updateGalleryControls);
  filters.hidden = false;
  selectCategory(filterButtons[0]);
}

const lightboxImages = [...document.querySelectorAll('.gal-item img, .car-gallery img')];
if (lightboxImages.length) {
  const lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-label', 'Powiększone zdjęcie');
  lightbox.innerHTML = '<img class="lightbox-img" alt="" draggable="false"><button class="lightbox-close" type="button" aria-label="Zamknij">×</button><button class="lightbox-prev" type="button" aria-label="Poprzednie zdjęcie">‹</button><button class="lightbox-next" type="button" aria-label="Następne zdjęcie">›</button><p class="lightbox-count" aria-live="polite"></p>';
  document.body.append(lightbox);
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCount = lightbox.querySelector('.lightbox-count');
  let current = 0;
  let activeImages = lightboxImages;
  let lightboxOpener = null;
  let swipeStart = null;

  const largestSource = img => {
    const set = img.getAttribute('srcset');
    if (!set) return img.currentSrc || img.src;
    return set.split(',').map(part => part.trim().split(/\s+/)).sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10))[0][0];
  };

  const showImage = index => {
    current = (index + activeImages.length) % activeImages.length;
    const img = activeImages[current];
    lightboxImg.src = largestSource(img);
    lightboxImg.alt = img.alt;
    lightboxCount.textContent = `${current + 1} / ${activeImages.length}`;
  };

  const openLightbox = img => {
    lightboxOpener = img.closest('button');
    activeImages = lightboxImages.filter(image => !image.closest('[hidden]'));
    showImage(activeImages.indexOf(img));
    lightbox.showModal();
    document.documentElement.classList.add('lightbox-open');
  };

  lightboxImages.forEach(img => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-image-button';
    button.setAttribute('aria-label', `Powiększ zdjęcie. ${img.alt}`);
    img.before(button);
    button.append(img);
    button.addEventListener('click', () => openLightbox(img));
  });

  lightbox.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    lightboxOpener.focus({ preventScroll: true });
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(current - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(current + 1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showImage(current - 1);
    if (event.key === 'ArrowRight') showImage(current + 1);
  });
  lightboxImg.addEventListener('pointerdown', event => { swipeStart = event.clientX; });
  lightboxImg.addEventListener('pointerup', event => {
    if (swipeStart === null) return;
    const distance = event.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(distance) > 40) showImage(current + (distance < 0 ? 1 : -1));
  });
  lightboxImg.addEventListener('pointercancel', () => { swipeStart = null; });
}
