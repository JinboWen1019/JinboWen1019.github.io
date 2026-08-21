(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];

  const getSavedTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      return null;
    }
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';
    if (themeToggle) {
      const nextTheme = isDark ? 'light' : 'dark';
      themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      themeToggle.setAttribute('title', `Switch to ${nextTheme} mode`);
      themeToggle.setAttribute('aria-pressed', String(isDark));
    }
    if (themeColor) themeColor.setAttribute('content', isDark ? '#1b1715' : '#c43d3d');
  };

  applyTheme(root.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', nextTheme);
      } catch (error) {
        // The selected theme still applies for this visit if storage is unavailable.
      }
      applyTheme(nextTheme);
    });
  }

  systemTheme.addEventListener('change', (event) => {
    if (!getSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });

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

  const visitorStat = document.querySelector('#visitor-stat');
  const visitorCount = document.querySelector('#visitor-count');

  if (visitorStat && visitorCount) {
    fetch('assets/data/visitor-count.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Visitor count is unavailable.');
        return response.json();
      })
      .then((data) => {
        if (!Number.isSafeInteger(data.visitors) || data.visitors < 0 || !data.updatedAt) return;
        visitorCount.textContent = new Intl.NumberFormat('en-US').format(data.visitors);
        visitorStat.hidden = false;
      })
      .catch(() => {
        // Keep the optional public counter hidden until fresh data is available.
      });
  }
})();
