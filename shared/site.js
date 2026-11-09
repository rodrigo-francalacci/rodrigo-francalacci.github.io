// site.js: the small amount of behaviour every page shares.
// 1. Marks the page as JavaScript-enabled (so the phone menu can fold away).
// 2. The "Menu" button on narrow screens opens and closes the sidebar.
// 3. Highlights the current page in the sidebar (aria-current="page").
(function () {
  document.documentElement.classList.add("js");
  document.addEventListener("DOMContentLoaded", function () {
    var side = document.querySelector(".side");
    var btn = document.querySelector(".menu-toggle");
    if (side && btn) {
      btn.addEventListener("click", function () {
        var open = side.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var here = location.pathname.replace(/index\.html$/, "");
    document.querySelectorAll(".side nav a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return; // in-page or placeholder links are never "the current page"
      var url = new URL(href, location.href);
      if (url.origin === location.origin && url.pathname.replace(/index\.html$/, "") === here) a.setAttribute("aria-current", "page");
    });
  });
})();
