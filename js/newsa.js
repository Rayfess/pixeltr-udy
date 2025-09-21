// berita

$(document).ready(function () {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const current = document.querySelector(".content.show.active");
      const target = document.getElementById(tab.dataset.target);
      if (current === target) return;
      if (current) {
        current.classList.remove("active");
        setTimeout(() => {
          current.classList.remove("show");
          current.style.display = "none";
          target.style.display = "grid";
          target.classList.add("show");
          setTimeout(() => target.classList.add("active"), 50);
        }, 600);
      } else {
        target.style.display = "grid";
        target.classList.add("show");
        setTimeout(() => target.classList.add("active"), 50);
      }
    });
  });

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

  const $wrapper = $(".card-wrapper-carousel");
  const $cards = $(".card-item-carousel");
  const cardCount = $cards.length;
  let currentIndex = 0;
  let itemsPerSlide = getItemsPerSlide();

  function getItemsPerSlide() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function updateSlide() {
    const offset = -(currentIndex * (100 / itemsPerSlide));
    $wrapper.css("transform", `translateX(${offset}%)`);
  }

  $(".next-btn").click(function () {
    if (currentIndex < cardCount - itemsPerSlide) {
      currentIndex++;
    } else {
      currentIndex = 0; // loop
    }
    updateSlide();
  });

  $(".prev-btn").click(function () {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = cardCount - itemsPerSlide; // loop
    }
    updateSlide();
  });

  // Responsive
  $(window).resize(function () {
    itemsPerSlide = getItemsPerSlide();
    updateSlide();
  });

  //footer
  function animateFooter() {
    $(".animate-footer").each(function () {
      let position = $(this).offset().top;
      let scroll = $(window).scrollTop();
      let windowHeight = $(window).height();

      if (scroll + windowHeight - 100 > position) {
        $(this).addClass("visible");
      }
    });
  }

  // Panggil saat load dan scroll
  animateFooter();
  $(window).scroll(function () {
    animateFooter();
  });

  // Validasi form sederhana
  $("form").submit(function (e) {
    e.preventDefault();
    const email = $(this).find("input[type='email']").val();

    if (email === "") {
      alert("Silakan masukkan alamat email Anda");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Silakan masukkan alamat email yang valid");
      return;
    }

    alert("Terima kasih! Anda telah berlangganan newsletter kami.");
    $(this).find("input[type='email']").val("");
  });

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Animasi untuk judul footer saat dihover
  $(".footer-title", ".main-title").hover(
    function () {
      $(this).css("transform", "translateY(-2px)");
    },
    function () {
      $(this).css("transform", "translateY(0)");
    }
  );
});
