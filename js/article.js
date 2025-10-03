document.addEventListener("DOMContentLoaded", () => {
  const slidesWrap = document.querySelector(".carbon-slider .slides");
  const slides = slidesWrap.children;
  const dotsContainer = document.querySelector(".carbon-slider .dots");
  const slideCount = slides.length;
  let index = 0;

  for (let i = 0; i < slideCount; i++) {
    const btn = document.createElement("button");
    btn.className = "dot";
    btn.type = "button";
    btn.setAttribute("aria-label", "Slide " + (i + 1));
    btn.addEventListener("click", () => {
      showSlide(i);
    });
    dotsContainer.appendChild(btn);
  }

  const dotButtons = dotsContainer.querySelectorAll(".dot");

  function updateDots() {
    dotButtons.forEach((d, idx) => {
      d.classList.toggle("active", idx === index);
      d.setAttribute("aria-pressed", String(idx === index));
    });
  }

  function showSlide(i) {
    index = (i + slideCount) % slideCount;
    slidesWrap.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }

  function nextSlide() {
    showSlide(index + 1);
  }

  showSlide(0);
});

$(function () {
  const $slider = $("#infinite-slider");
  const $track = $slider.find(".infinite-slider-track");
  const navNext = $slider.find(".next");
  const navPrev = $slider.find(".prev");

  const ORIGINAL_SLIDES = $track.children(".infinite-slider-item").length;
  let slideWidth = 0;
  let slidesPerView = 1;
  let clones = 0;
  let index = 0;
  let isTransitioning = false;
  let autoplayMs = 3000;
  let autoplayTimer = null;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let currentTranslate = 0;

  function getSlidesPerView() {
    const w = $slider.width();
    if (w >= 1024) return 3;
    if (w >= 768) return 2;
    return 1;
  }

  function clearClones() {
    $track.find(".clone").remove();
  }

  function buildClones() {
    clearClones();
    slidesPerView = getSlidesPerView();
    clones = slidesPerView;

    const $realSlides = $track.children(".infinite-slider-item");
    for (let i = clones - 1; i >= 0; i--) {
      const $s = $realSlides
        .eq(ORIGINAL_SLIDES - 1 - i)
        .clone()
        .addClass("clone");
      $track.prepend($s);
    }
    for (let i = 0; i < clones; i++) {
      const $s = $realSlides.eq(i).clone().addClass("clone");
      $track.append($s);
    }
  }

  function refreshSizes() {
    slidesPerView = getSlidesPerView();
    const $first = $track.children(".infinite-slider-item").first();
    $track.css("transition", "none");
    slideWidth = $first.outerWidth(true);
    index = clones;
    $track.css("transform", "translateX(" + -index * slideWidth + "px)");
    setTimeout(() => $track.css("transition", "transform 0.45s ease"), 30);
  }

  function goTo(i, withTransition = true) {
    if (!withTransition) $track.css("transition", "none");
    else $track.css("transition", "transform 0.45s ease");
    $track.css("transform", "translateX(" + -i * slideWidth + "px)");
    index = i;
  }

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    goTo(index + 1);
  }
  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    goTo(index - 1);
  }

  function handleTransitionEnd() {
    isTransitioning = false;
    const total = $track.children(".infinite-slider-item").length;
    if (index >= total - clones) {
      index = clones;
      goTo(index, false);
    }
    if (index < clones) {
      index = total - clones - 1;
      goTo(index, false);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, autoplayMs);
  }
  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function pointerDown(e) {
    startX =
      e.originalEvent.clientX || (e.originalEvent.touches && e.originalEvent.touches[0].clientX);
    startY =
      e.originalEvent.clientY || (e.originalEvent.touches && e.originalEvent.touches[0].clientY);
    dragging = true;
    stopAutoplay();
    currentTranslate = -index * slideWidth;
    $track.css("transition", "none");
  }

  function pointerMove(e) {
    if (!dragging) return;
    const x =
      e.originalEvent.clientX || (e.originalEvent.touches && e.originalEvent.touches[0].clientX);
    const y =
      e.originalEvent.clientY || (e.originalEvent.touches && e.originalEvent.touches[0].clientY);
    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      $track.css("transform", "translateX(" + (currentTranslate + dx) + "px)");
    }
  }

  function pointerUp(e) {
    if (!dragging) return;
    dragging = false;
    const x =
      e.originalEvent.clientX ||
      (e.originalEvent.changedTouches && e.originalEvent.changedTouches[0].clientX);
    const dx = x - startX;
    if (Math.abs(dx) > slideWidth * 0.2) {
      if (dx < 0) next();
      else prev();
    } else {
      goTo(index, true);
    }
    startAutoplay();
  }

  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildClones();
      setTimeout(refreshSizes, 50);
    }, 150);
  }

  function init() {
    buildClones();
    setTimeout(() => {
      refreshSizes();
      navNext.on("click", next);
      navPrev.on("click", prev);
      $track.on("transitionend", handleTransitionEnd);
      $slider.on("mouseenter", stopAutoplay).on("mouseleave", startAutoplay);
      $track.on("pointerdown touchstart", pointerDown);
      $(window).on("pointermove touchmove", pointerMove);
      $(window).on("pointerup touchend touchcancel pointercancel", pointerUp);
      $(window).on("resize", onResize);
      startAutoplay();
    }, 60);
  }

  init();
});

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");
let index = 0;

function activateTab(i) {
  tabs.forEach((t) => t.classList.remove("active"));
  contents.forEach((c) => {
    c.classList.remove("active");
    c.style.display = "none";
  });

  tabs[i].classList.add("active");
  const target = document.getElementById(tabs[i].dataset.target);
  target.style.display = "flex";

  // trigger reflow untuk animasi
  void target.offsetWidth;
  target.classList.add("active");
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => {
    index = i;
    activateTab(i);
  });
});
