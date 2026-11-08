const siteMenu = document.querySelector('.site-menu');
const siteMenuButton = document.querySelector('.site-menu-button');
const siteNavigation = document.getElementById('site-navigation');
const desktopNavigation = matchMedia('(min-width: 1200px)');

function setMenuOpen(open) {
  siteMenu.classList.toggle('is-open', open);
  siteMenuButton.setAttribute('aria-expanded', String(open));
  siteMenuButton.textContent = open ? 'Zamknij' : 'Menu';
}

siteMenuButton.addEventListener('click', () => {
  setMenuOpen(siteMenuButton.getAttribute('aria-expanded') !== 'true');
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
