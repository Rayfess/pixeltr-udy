$(document).ready(function () {
  // Comparison slider functionality
  const slider = document.querySelector(".slider-handle");
  const beforeImage = document.querySelector("#before-image");
  const beforeLabel = document.querySelector(".before-label");
  const afterLabel = document.querySelector(".after-label");
  const sliderPercentage = document.querySelector(".slider-percentage");
  let isSliding = false;

  // Update labels based on slider position
  function updateLabels(position) {
    const percent = Math.round(position * 100);

    // Adjust label opacity based on position
    beforeLabel.style.opacity = 1 - (position - 0.5) * 2;
    afterLabel.style.opacity = 0.5 + (position - 0.5) * 2;
  }

  // Mouse events
  slider.addEventListener("mousedown", function () {
    isSliding = true;
  });

  document.addEventListener("mouseup", function () {
    isSliding = false;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isSliding) return;

    const sliderPos =
      (e.clientX - slider.parentElement.getBoundingClientRect().left) /
      slider.parentElement.offsetWidth;
    const sliderPercentage = Math.max(0, Math.min(1, sliderPos));

    beforeImage.style.width = `${sliderPercentage * 100}%`;
    slider.style.left = `${sliderPercentage * 100}%`;

    updateLabels(sliderPercentage);
  });

  // Touch events for mobile
  slider.addEventListener("touchstart", function () {
    isSliding = true;
  });

  document.addEventListener("touchend", function () {
    isSliding = false;
  });

  document.addEventListener("touchmove", function (e) {
    if (!isSliding) return;

    const touch = e.touches[0];
    const sliderPos =
      (touch.clientX - slider.parentElement.getBoundingClientRect().left) /
      slider.parentElement.offsetWidth;
    const sliderPercentage = Math.max(0, Math.min(1, sliderPos));

    beforeImage.style.width = `${sliderPercentage * 100}%`;
    slider.style.left = `${sliderPercentage * 100}%`;

    updateLabels(sliderPercentage);
  });

  // Initialize slider position
  beforeImage.style.width = "50%";
  slider.style.left = "50%";
  updateLabels(0.5);

  // Animation for stats
  $(".stat-container").each(function (index) {
    $(this)
      .delay(300 * index)
      .fadeTo(700, 1);
  });

  // Animation for header underline
  $(".header-title").hover(
    function () {
      $(this).find("::after").css("width", "100%");
    },
    function () {
      $(this).find("::after").css("width", "80px");
    }
  );

  //

  const $slider = $("#statsSlider");
  const $cards = $(".stats-card");
  const $dots = $(".slider-dot");
  const $prevBtn = $(".prev-btn");
  const $nextBtn = $(".next-btn");
  let currentIndex = 0;
  const cardCount = $cards.length;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Fungsi untuk memperbarui tampilan slider
  function updateSlider() {
    // Geser slider ke card yang aktif
    const translateX = -currentIndex * 100 + "%";
    $slider.css("transform", `translateX(${translateX})`);

    // Perbarui dots
    $dots.removeClass("active");
    $dots.eq(currentIndex).addClass("active");
  }

  // Navigasi ke card sebelumnya
  $prevBtn.click(function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
      resetAutoSlide();
    }
  });

  // Navigasi ke card berikutnya
  $nextBtn.click(function () {
    if (currentIndex < cardCount - 1) {
      currentIndex++;
      updateSlider();
      resetAutoSlide();
    }
  });

  // Klik pada dot untuk navigasi langsung
  $dots.click(function () {
    currentIndex = $(this).data("index");
    updateSlider();
    resetAutoSlide();
  });

  // Fungsi untuk mengatur posisi slider saat drag
  function setSliderPosition() {
    $slider.css("transform", `translateX(${currentTranslate}px)`);
  }

  // Animasi smooth untuk slider
  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  // Event listeners untuk desktop drag
  $slider.on("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
    startPos = e.clientX;
    animationID = requestAnimationFrame(animation);
    $slider.css("cursor", "grabbing");
  });

  $(document).on("mousemove", function (e) {
    if (isDragging) {
      const currentPosition = e.clientX;
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  });

  $(document).on("mouseup", function () {
    if (isDragging) {
      cancelAnimationFrame(animationID);
      isDragging = false;
      const movedBy = currentTranslate - prevTranslate;

      // Jika drag cukup jauh, ubah slide
      if (movedBy < -100 && currentIndex < cardCount - 1) {
        currentIndex++;
      } else if (movedBy > 100 && currentIndex > 0) {
        currentIndex--;
      }

      // Reset posisi
      currentTranslate = -currentIndex * $slider.width();
      prevTranslate = currentTranslate;
      setSliderPosition();
      updateSlider();
      resetAutoSlide();
      $slider.css("cursor", "grab");
    }
  });

  // Swipe untuk perangkat mobile
  let touchStartX = 0;
  let touchEndX = 0;

  $slider.on("touchstart", function (e) {
    touchStartX = e.originalEvent.touches[0].clientX;
  });

  $slider.on("touchmove", function (e) {
    touchEndX = e.originalEvent.touches[0].clientX;
  });

  $slider.on("touchend", function () {
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;

    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe kiri - next card
      $nextBtn.click();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe kanan - previous card
      $prevBtn.click();
    }
  }

  // Auto slide
  let autoSlideInterval;

  function startAutoSlide() {
    autoSlideInterval = setInterval(function () {
      if (currentIndex < cardCount - 1) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateSlider();
    }, 5000);
  }

  // Reset auto slide timer
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Inisialisasi
  startAutoSlide();

  // Hentikan auto slide ketika berinteraksi
  $slider
    .add($dots)
    .add($prevBtn)
    .add($nextBtn)
    .hover(
      function () {
        clearInterval(autoSlideInterval);
      },
      function () {
        resetAutoSlide();
      }
    );
});
