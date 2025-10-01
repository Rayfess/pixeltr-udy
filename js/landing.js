$(document).ready(function () {
  // slider mini,, sec2
  const statSliders = $("#statsSlider");
  const statCardsSlider = $(".stats-card");
  const statDotsSlider = $(".slider-dot");
  const statPrevBtnSlider = $(".prev-btn");
  const statNextBtnSlider = $(".next-btn");
  let currentIndex = 0;
  const cardCount = statCardsSlider.length;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  function updateSlider() {
    const translateX = -currentIndex * 100 + "%";
    statSliders.css("transform", `translateX(${translateX})`);

    statDotsSlider.removeClass("active");
    statDotsSlider.eq(currentIndex).addClass("active");
  }

  statPrevBtnSlider.click(function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
      resetAutoSlide();
    }
  });

  statNextBtnSlider.click(function () {
    if (currentIndex < cardCount - 1) {
      currentIndex++;
      updateSlider();
      resetAutoSlide();
    }
  });

  statDotsSlider.click(function () {
    currentIndex = $(this).data("index");
    updateSlider();
    resetAutoSlide();
  });

  function setSliderPosition() {
    statSliders.css("transform", `translateX(${currentTranslate}px)`);
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  statSliders.on("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
    startPos = e.clientX;
    animationID = requestAnimationFrame(animation);
    statSliders.css("cursor", "grabbing");
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

      if (movedBy < -100 && currentIndex < cardCount - 1) {
        currentIndex++;
      } else if (movedBy > 100 && currentIndex > 0) {
        currentIndex--;
      }

      currentTranslate = -currentIndex * statSliders.width();
      prevTranslate = currentTranslate;
      setSliderPosition();
      updateSlider();
      resetAutoSlide();
      statSliders.css("cursor", "grab");
    }
  });

  // mobile slde
  let touchStartX = 0;
  let touchEndX = 0;

  statSliders.on("touchstart", function (e) {
    touchStartX = e.originalEvent.touches[0].clientX;
  });

  statSliders.on("touchmove", function (e) {
    touchEndX = e.originalEvent.touches[0].clientX;
  });

  statSliders.on("touchend", function () {
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;

    if (touchEndX < touchStartX - swipeThreshold) {
      statNextBtnSlider.click();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      statPrevBtnSlider.click();
    }
  }

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

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  startAutoSlide();

  statSliders
    .add(statDotsSlider)
    .add(statPrevBtnSlider)
    .add(statNextBtnSlider)
    .hover(
      function () {
        clearInterval(autoSlideInterval);
      },
      function () {
        resetAutoSlide();
      }
    );

  // comparisonslider,, sec2
  const containercs = $(".comparison-container");
  const beforeimgc = $(".before-img");
  const shandlec = $(".slider-handle");
  const beforelabelcs = $(".label.before");
  const afterlabelcs = $(".label.after");

  function initSlider() {
    beforeimgc.css("width", "50%");
    shandlec.css("left", "50%");
    updateLabelVisibility(50);
  }

  initSlider();

  function moveSlider(x) {
    const containerOffset = containercs.offset().left;
    const containerWidth = containercs.width();
    let position = x - containerOffset;

    if (position < 0) position = 0;
    if (position > containerWidth) position = containerWidth;

    const percent = (position / containerWidth) * 100;
    beforeimgc.css("width", percent + "%");
    shandlec.css("left", percent + "%");

    updateLabelVisibility(percent);
  }

  function updateLabelVisibility(percent) {
    beforelabelcs.removeClass("visible");
    afterlabelcs.removeClass("visible");

    if (percent <= 5) {
      beforelabelcs.addClass("visible");
    } else if (percent >= 95) {
      afterlabelcs.addClass("visible");
    }
  }

  shandlec.on("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
    $("body").css("cursor", "ew-resize");
  });

  $(document).on("mousemove", function (e) {
    if (isDragging) {
      moveSlider(e.pageX);
    }
  });

  $(document).on("mouseup", function () {
    if (isDragging) {
      isDragging = false;
      $("body").css("cursor", "");
    }
  });

  shandlec.on("touchstart", function (e) {
    e.preventDefault();
    isDragging = true;
  });

  $(document).on("touchmove", function (e) {
    if (isDragging && e.originalEvent.touches.length > 0) {
      moveSlider(e.originalEvent.touches[0].pageX);
    }
  });

  $(document).on("touchend", function () {
    isDragging = false;
  });

  containercs.on("click", function (e) {
    moveSlider(e.pageX);
  });

  let resizeTimer;
  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const currentPercent = (parseFloat(beforeimgc.css("width")) / containercs.width()) * 100;
      beforeimgc.css("width", currentPercent + "%");
      shandlec.css("left", currentPercent + "%");
      updateLabelVisibility(currentPercent);
    }, 250);
  });

  //sec3
  function showMoreCards() {
    $(".hidden-card").each(function () {
      $(this).fadeIn(500).removeClass("hidden-card");
    });

    $("#showMoreBtn").parent().fadeOut(500);
  }

  $("#showMoreBtn").on("click", showMoreCards);

  function checkScreenSize() {
    if ($(window).width() >= 993) {
      $(".hidden-card").removeClass("hidden-card").show();
      $(".container-button-showmore").hide();
    } else {
      $(".card-row .col-lg-4:not(:first-child)").addClass("hidden-card").hide();
      $(".container-button-showmore").show();
    }
  }

  // Jalankan saat halaman dimuat
  checkScreenSize();

  // Jalankan saat ukuran jendela berubah
  $(window).on("resize", checkScreenSize);
});
