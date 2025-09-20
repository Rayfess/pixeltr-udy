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

  //carbon cal intro
  let categories = {};

  function loadCategoriesData() {
    return fetch("/data/catdataical.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        categories = data;
        return data;
      })
      .catch((error) => {
        console.error("Error loading categories data:", error);
        return categories;
      });
  }

  function changeCategory(category) {
    const catData = categories[category];

    $("#category-icon")
      .removeClass()
      .addClass("fas " + catData.icon);
    $("#category-title").text(catData.title);
    $("#category-desc").text(catData.desc);
    $("#category-bg").css("background-image", "url('" + catData.bgImage + "')");

    $("#default-category-icon")
      .removeClass()
      .addClass("fas " + catData.icon);
    $("#stat-value-1").text(catData.stats[0]);
    $("#stat-value-2").text(catData.stats[1]);
    $("#stat-value-3").text(catData.stats[2]);

    $("#data-title").text(catData.dataTitle);
    $("#general-overview").text(catData.generalOverview);
    $("#chart-title").text(catData.chartTitle);

    generatePieChart(catData.chartData);

    let factorsHtml = "";
    catData.factors.forEach((factor) => {
      factorsHtml += `<li>${factor}</li>`;
    });
    $("#factors-list").html(factorsHtml).removeClass("expanded");

    let impactsHtml = "";
    catData.impacts.forEach((impact) => {
      impactsHtml += `<li>${impact}</li>`;
    });
    $("#impacts-list").html(impactsHtml).removeClass("expanded");

    $(".category-btn").removeClass("active");
    $(`.category-btn[data-category="${category}"]`).addClass("active");

    $(".read-more")
      .removeClass("expanded")
      .html('Lihat selengkapnya <i class="fas fa-chevron-down"></i>');
  }

  function generatePieChart(chartData) {
    let conicGradient = "";
    let legendHtml = "";
    let accumulatedPercent = 0;

    chartData.forEach((item, index) => {
      const startPercent = accumulatedPercent;
      accumulatedPercent += item.value;
      const endPercent = accumulatedPercent;

      conicGradient += `${item.color} ${startPercent}% ${endPercent}%`;
      if (index < chartData.length - 1) {
        conicGradient += ", ";
      }

      legendHtml += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${item.color};"></div>
                    <div class="legend-label">
                        ${item.label} <span class="legend-value">${item.value}%</span>
                    </div>
                </div>
            `;
    });

    $("#pie-chart").css("background", `conic-gradient(${conicGradient})`);

    $("#pie-legend").html(legendHtml);
  }

  $(".carbon-data-content").html(`
          <div class="loading">
            <div class="loading-spinner"></div>
            <span>Memuat data...</span>
          </div>
        `);

  loadCategoriesData().then(() => {
    // Sembunyikan loading state dan tampilkan konten
    $(".carbon-data-content").html(`
            <h2 id="data-title">Data Emisi Karbon Rumah Tangga di Indonesia</h2>
            <div class="data-card active" id="general-card">
              <h3>Gambaran Umum</h3>
              <p id="general-overview">${categories.home.generalOverview}</p>
            </div>
            <div class="chart-container active" id="chart-card">
              <h3 class="chart-title" id="chart-title">${categories.home.chartTitle}</h3>
              <div class="pie-chart-container">
                <div class="pie-chart" id="pie-chart">
                  <div class="pie-center"><i class="fa-solid fa-wind"></i></div>
                </div>
                <div class="pie-legend" id="pie-legend"></div>
              </div>
            </div>
            <div class="data-card active" id="factors-card">
              <h3>Faktor Penentu</h3>
              <ul class="factors-list" id="factors-list"></ul>
              <div class="read-more">Lihat selengkapnya <i class="fas fa-chevron-down"></i></div>
            </div>
            <div class="data-card active" id="impacts-card">
              <h3>Dampak Lingkungan</h3>
              <ul class="impacts-list" id="impacts-list"></ul>
              <div class="read-more">Lihat selengkapnya <i class="fas fa-chevron-down"></i></div>
            </div>
          `);

    changeCategory("home");

    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    $(".category-btn").click(function () {
      const category = $(this).data("category");
      changeCategory(category);
    });

    $(".calculator-btn").click(function () {
      window.location.href = "./pages/carboncal.html";
    });

    $(".read-more").click(function () {
      const list = $(this).prev();
      if (list.hasClass("expanded")) {
        list.removeClass("expanded");
        $(this)
          .removeClass("expanded")
          .html('Lihat selengkapnya <i class="fas fa-chevron-down"></i>');
      } else {
        list.addClass("expanded");
        $(this).addClass("expanded").html('Lihat lebih sedikit <i class="fas fa-chevron-up"></i>');
      }
    });

    function checkOverflow() {
      const content = $(".carbon-data-content");
      content.each(function () {
        if (this.scrollHeight > this.clientHeight) {
          $(this).siblings(".scroll-indicator").show();
        } else {
          $(this).siblings(".scroll-indicator").hide();
        }
      });
    }

    setTimeout(checkOverflow, 500);
    $(window).resize(checkOverflow);
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
