(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (header && toggle && nav) {
    var closeNav = function () {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) {
        closeNav();
      }
    });
  }

  var isEmbed = document.documentElement.classList.contains("embed-mode");

  if (isEmbed) {
    var embedLinks = document.querySelectorAll("a[href]");
    embedLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.indexOf("#") === 0 || link.target) {
        return;
      }
      if (/\.html([?#]|$)/.test(href) || /\.(pdf|docx|xlsx)([?#]|$)/.test(href)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      }
    });

    var reportHeight = function () {
      var height = Math.ceil(document.documentElement.scrollHeight);
      try {
        window.parent.postMessage({ type: "aquapave:height", height: height }, "*");
      } catch (error) {}
    };

    if ("ResizeObserver" in window) {
      var heightFrame = null;
      new ResizeObserver(function () {
        window.cancelAnimationFrame(heightFrame);
        heightFrame = window.requestAnimationFrame(reportHeight);
      }).observe(document.documentElement);
    } else {
      window.addEventListener("resize", reportHeight);
    }

    window.addEventListener("load", reportHeight);
    reportHeight();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reportHeight);
    }
  } else {
    var topButton = document.createElement("button");
    topButton.type = "button";
    topButton.className = "to-top";
    topButton.setAttribute("aria-label", "Back to top");
    topButton.innerHTML = "&#8593;";
    document.body.appendChild(topButton);

    var updateTopButton = function () {
      if (window.scrollY > 640) {
        topButton.classList.add("is-visible");
      } else {
        topButton.classList.remove("is-visible");
      }
    };

    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", updateTopButton, { passive: true });
    updateTopButton();
  }

  var anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }
      var target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) {
          history.replaceState(null, "", targetId);
        }
      }
    });
  });
})();
