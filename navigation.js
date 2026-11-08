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
