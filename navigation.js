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
  let swipeStart = null;

  const largestSource = img => {
    const set = img.getAttribute('srcset');
    if (!set) return img.currentSrc || img.src;
    return set.split(',').map(part => part.trim().split(/\s+/)).sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10))[0][0];
  };

  const showImage = index => {
    current = (index + lightboxImages.length) % lightboxImages.length;
    const img = lightboxImages[current];
    lightboxImg.src = largestSource(img);
    lightboxImg.alt = img.alt;
    lightboxCount.textContent = `${current + 1} / ${lightboxImages.length}`;
  };

  const openLightbox = index => {
    showImage(index);
    lightbox.showModal();
    document.documentElement.classList.add('lightbox-open');
  };

  lightboxImages.forEach((img, index) => {
    img.tabIndex = 0;
    img.addEventListener('click', () => openLightbox(index));
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightbox.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    lightboxImages[current].focus({ preventScroll: true });
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
