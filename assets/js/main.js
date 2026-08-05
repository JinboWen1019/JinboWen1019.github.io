(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (links.length && sections.length) {
    let updateQueued = false;

    const updateActiveLink = () => {
      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      const activationLine = window.scrollY + headerHeight + 32;
      let activeSection = sections[0];

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= activationLine) activeSection = section;
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        activeSection = sections[sections.length - 1];
      }

      links.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${activeSection.id}`);
      });
    };

    const queueActiveLinkUpdate = () => {
      if (updateQueued) return;
      updateQueued = true;
      window.requestAnimationFrame(() => {
        updateActiveLink();
        updateQueued = false;
      });
    };

    window.addEventListener('scroll', queueActiveLinkUpdate, { passive: true });
    window.addEventListener('resize', queueActiveLinkUpdate);
    window.addEventListener('hashchange', queueActiveLinkUpdate);
    updateActiveLink();
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
