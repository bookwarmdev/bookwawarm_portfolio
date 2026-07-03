(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "bwd-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  var storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) applyTheme(storedTheme);

  var themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      applyTheme(current === "light" ? "dark" : "light");
    });
  }

  // View mode: "app" = simulated phone screen with its own scroll container,
  // "web" = a plain scrolling webpage (same content, no phone chrome)
  var VIEW_KEY = "bwd-view";
  var content = document.querySelector("[data-app-content]");
  var topbar = document.querySelector("[data-topbar]");

  function isWebMode() {
    return root.getAttribute("data-view") === "web";
  }

  function scrollToEl(el) {
    if (!el) return;
    if (isWebMode()) {
      var top = el.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: top, behavior: "smooth" });
    } else if (content) {
      content.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    }
  }

  function updateTopbarShadow() {
    if (!topbar) return;
    var scrollTop = isWebMode() ? window.scrollY : content ? content.scrollTop : 0;
    topbar.classList.toggle("is-scrolled", scrollTop > 8);
  }

  if (content) content.addEventListener("scroll", updateTopbarShadow, { passive: true });
  window.addEventListener("scroll", updateTopbarShadow, { passive: true });

  var viewToggle = document.querySelector("[data-view-toggle]");
  var storedView = localStorage.getItem(VIEW_KEY);
  if (storedView) root.setAttribute("data-view", storedView);

  if (viewToggle) {
    viewToggle.addEventListener("click", function () {
      var next = isWebMode() ? "app" : "web";
      root.setAttribute("data-view", next);
      localStorage.setItem(VIEW_KEY, next);
      window.scrollTo(0, 0);
      if (content) content.scrollTo(0, 0);
      updateTopbarShadow();
      initObservers();
    });
  }

  // Live status-bar clock
  var clockEl = document.querySelector("[data-clock]");
  function updateClock() {
    if (!clockEl) return;
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    clockEl.textContent = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }
  updateClock();
  setInterval(updateClock, 15000);

  // Today date line
  var dateEl = document.querySelector("[data-today-date]");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Tab bar + scrollspy. In "app" mode the scroll root is the internal
  // phone-screen container; in "web" mode it's the real page/viewport.
  var tabButtons = document.querySelectorAll("[data-tab-target]");
  var sections = document.querySelectorAll("[data-section]");
  var revealEls = document.querySelectorAll(".reveal");
  var scrollspyObserver = null;
  var revealObserver = null;

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToEl(document.getElementById(btn.getAttribute("data-tab-target")));
    });
  });

  function initObservers() {
    if (scrollspyObserver) scrollspyObserver.disconnect();
    if (revealObserver) revealObserver.disconnect();

    var observerRoot = isWebMode() ? null : content;

    if (sections.length && tabButtons.length) {
      scrollspyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.id;
              tabButtons.forEach(function (btn) {
                btn.classList.toggle("is-active", btn.getAttribute("data-tab-target") === id);
              });
            }
          });
        },
        { root: observerRoot, rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { scrollspyObserver.observe(s); });
    }

    if ("IntersectionObserver" in window && revealEls.length) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { root: observerRoot, threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );
      revealEls.forEach(function (el) {
        if (!el.classList.contains("is-visible")) revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  initObservers();

  // GET -> OPEN micro-interaction on the hero CTA
  var getBtn = document.querySelector("[data-get-btn]");
  if (getBtn) {
    getBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var targetId = getBtn.getAttribute("data-get-btn");
      if (getBtn.classList.contains("is-loading")) return;
      var originalText = getBtn.textContent;
      getBtn.classList.add("is-loading");
      getBtn.innerHTML = '<span class="spinner"></span>' + originalText;
      setTimeout(function () {
        getBtn.classList.remove("is-loading");
        getBtn.textContent = "OPEN";
        scrollToEl(document.getElementById(targetId));
        setTimeout(function () { getBtn.textContent = originalText; }, 2200);
      }, 650);
    });
  }

  // Project modal
  var projectData = {
    konga: {
      name: "Konga",
      sub: "Shopping · iOS & Android",
      icon: "grad-orange",
      initials: "K",
      developer: "Faruk Owolabi",
      category: "Shopping",
      platforms: "iOS & Android",
      released: "2024",
      desc: "A comprehensive e-commerce platform to shop, manage orders, and track deliveries seamlessly. Architected and developed the iOS application end-to-end, lifting user engagement by 35% and helping drive a 25% increase in successful transactions through a rebuilt payment flow.",
      shots: [
        "assets/img/projects/konga/1.jpg",
        "assets/img/projects/konga/2.jpg",
        "assets/img/projects/konga/3.jpg",
        "assets/img/projects/konga/4.jpg",
      ],
    },
    altconnect: {
      name: "Altconnect",
      sub: "Finance · iOS & Android",
      icon: "grad-blue",
      initials: "A",
      developer: "Faruk Owolabi",
      category: "Finance",
      platforms: "iOS & Android",
      released: "2024",
      desc: "A product by ALTBANK offering seamless digital banking experiences, fostering connectivity between users and financial services for improved accessibility.",
    },
    altbank: {
      name: "Altbank",
      sub: "Finance · iOS & Android",
      icon: "grad-teal",
      initials: "AB",
      developer: "Faruk Owolabi",
      category: "Finance",
      platforms: "iOS & Android",
      released: "2023",
      desc: "A digital banking platform offering interest-free banking solutions, enabling users to manage finances seamlessly across web and mobile platforms.",
    },
    ayrem: {
      name: "Ayrem",
      sub: "Finance · iOS & Android",
      icon: "grad-purple",
      initials: "Ay",
      developer: "Faruk Owolabi",
      category: "Finance",
      platforms: "iOS & Android",
      released: "2021",
      desc: "A digital platform facilitating the exchange of digital assets, including cryptocurrencies and gift cards, aiming to redefine Africa's digital transaction space.",
    },
    kootmart: {
      name: "Kootmart",
      sub: "Utilities · iOS & Android",
      icon: "grad-green",
      initials: "Ko",
      developer: "Faruk Owolabi",
      category: "Utilities",
      platforms: "iOS & Android",
      released: "2021",
      desc: "Kuwait's number-one mobile app for booking ministry appointments, paying fines and online bills, and staying up to date with the latest online offers.",
    },
    saukalafiya: {
      name: "Saukalafiya",
      sub: "Travel · iOS & Android",
      icon: "grad-pink",
      initials: "S",
      developer: "Faruk Owolabi",
      category: "Travel",
      platforms: "iOS & Android",
      released: "2020",
      desc: "Hausa for “safe ride” — an affordable tricycle app offering location-based, on-demand service under the ownership of Life Helpers Initiative.",
    },
    bincomlms: {
      name: "Bincom LMS",
      sub: "Education · iOS & Android",
      icon: "grad-yellow",
      initials: "B",
      developer: "Faruk Owolabi",
      category: "Education",
      platforms: "iOS & Android",
      released: "2020",
      desc: "A Learning Management System developed to manage knowledge tracks and facilitate training and development in technology and innovation, adopted by 50+ institutions.",
    },
  };

  var modalOverlay = document.querySelector("[data-modal-overlay]");
  var modalIcon = document.querySelector("[data-modal-icon]");
  var modalName = document.querySelector("[data-modal-name]");
  var modalSub = document.querySelector("[data-modal-sub]");
  var modalDesc = document.querySelector("[data-modal-desc]");
  var modalDeveloper = document.querySelector("[data-modal-developer]");
  var modalCategory = document.querySelector("[data-modal-category]");
  var modalPlatforms = document.querySelector("[data-modal-platforms]");
  var modalReleased = document.querySelector("[data-modal-released]");
  var modalShots = document.querySelector("[data-modal-shots]");

  // Generic outline icons cycled through the abstract mockup screens
  var MOCKUP_ICONS = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15v3M12 10v8M17 6v12"/></svg>',
  ];

  function renderShots(p) {
    if (!modalShots) return;
    if (p.shots && p.shots.length) {
      modalShots.innerHTML = p.shots
        .map(function (src) {
          return '<div class="shot shot-image"><img src="' + src + '" alt="' + p.name + ' app screenshot" loading="lazy"></div>';
        })
        .join("");
      return;
    }
    modalShots.innerHTML = MOCKUP_ICONS
      .map(function (icon) {
        return (
          '<div class="shot mockup ' + p.icon + '">' +
          '<div class="mockup-icon">' + icon + "</div>" +
          '<div class="mockup-bar"></div>' +
          '<div class="mockup-block"></div>' +
          '<div class="mockup-line w-70"></div>' +
          '<div class="mockup-line w-45"></div>' +
          "</div>"
        );
      })
      .join("");
  }

  function openModal(key) {
    var p = projectData[key];
    if (!p || !modalOverlay) return;
    modalIcon.textContent = p.initials;
    modalIcon.className = "app-icon-xl " + p.icon;
    modalName.textContent = p.name;
    modalSub.textContent = p.sub;
    modalDesc.textContent = p.desc;
    modalDeveloper.textContent = p.developer;
    modalCategory.textContent = p.category;
    modalPlatforms.textContent = p.platforms;
    modalReleased.textContent = p.released;
    renderShots(p);
    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-project]").forEach(function (el) {
    el.addEventListener("click", function () {
      openModal(el.getAttribute("data-project"));
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();
