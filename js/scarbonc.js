class CarbonStatsManager {
  constructor() {
    this.categories = {};
    this.currentCategory = "home";
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await this.loadCategoriesData();
      this.setupEventListeners();
      this.renderInitialCategory();
      this.setupScrollAnimations();
      this.isInitialized = true;

      console.log("CarbonStatsManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize CarbonStatsManager:", error);
      this.handleInitializationError();
    }
  }

  async loadCategoriesData() {
    try {
      const response = await fetch("../data/catdatalan.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.categories = await response.json();
    } catch (error) {
      console.error("Error loading categories data:", error);
      throw new Error("Failed to load categories data");
    }
  }

  setupEventListeners() {
    // Category button clicks
    $(".category-btn").on("click", (e) => this.handleCategoryChange(e));

    // Detail toggle
    $("#toggle-details").on("click", () => this.toggleDetails());

    // Action buttons
    $("#calculator-btn").on("click", (e) => this.handleCalculatorClick(e));
    $("#learn-more-btn").on("click", (e) => this.handleLearnMoreClick(e));
  }

  handleCategoryChange(event) {
    event.stopPropagation();
    const category = $(event.currentTarget).data("category");

    if (this.categories[category]) {
      this.updateActiveCategoryButton(event.currentTarget);
      this.transitionToCategory(category);
    }
  }

  updateActiveCategoryButton(activeButton) {
    $(".category-btn").removeClass("active");
    $(activeButton).addClass("active");
  }

  transitionToCategory(category) {
    $(".carbon-card").css("opacity", "0.7");

    setTimeout(() => {
      this.renderCategory(category);
      $(".carbon-card").css("opacity", "1");
      this.currentCategory = category;
    }, 300);
  }

  renderInitialCategory() {
    this.renderCategory(this.currentCategory);
  }

  renderCategory(category) {
    const categoryData = this.categories[category];

    if (!categoryData) {
      console.error(`Category data not found: ${category}`);
      return;
    }

    this.updateCategoryTitle(categoryData.title);
    this.updateStatsGrid(categoryData.stats);
    this.updateOverviewSection(categoryData);
    this.updateChartSection(categoryData);
    this.updateDataLists(categoryData);
  }

  updateCategoryTitle(title) {
    $("#category-title").text(title);
  }

  updateStatsGrid(stats) {
    const statsHtml = stats
      .map((stat, index) => {
        const isImpactCard = index === 1;
        const impactClass = isImpactCard ? "impact" : "";

        return `
                <div class="stat-card ${impactClass}">
                    <div class="stat-icon">
                        <i class="fas ${stat.icon}"></i>
                    </div>
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-source">Sumber: ${stat.source}</div>
                </div>
            `;
      })
      .join("");

    $("#stats-grid").html(statsHtml);
  }

  updateOverviewSection(categoryData) {
    $("#overview-title").text(categoryData.overviewTitle);
    $("#overview-text").text(categoryData.overviewText);
    $("#overview-source").text(categoryData.overviewSource);
    $("#overview-image").css("background-image", `url('${categoryData.overviewImage}')`);
  }

  updateChartSection(categoryData) {
    $("#chart-title").text(categoryData.chartTitle);
    this.renderPieChart(categoryData.chartData);
  }

  renderPieChart(chartData) {
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
                    <div class="legend-label">${item.label} (${item.value}%)</div>
                </div>
            `;
    });

    $("#pie-chart").css("background", `conic-gradient(${conicGradient})`);
    $("#chart-legend").html(legendHtml);
  }

  updateDataLists(categoryData) {
    this.updateList("factors-list", categoryData.factors);
    this.updateList("impacts-list", categoryData.impacts);
    this.updateList("solutions-list", categoryData.solutions);
  }

  updateList(listId, items) {
    const listHtml = items.map((item) => `<li>${item}</li>`).join("");
    $(`#${listId}`).html(listHtml);
  }

  toggleDetails() {
    const detailSection = $("#detail-content");
    const toggleButton = $("#toggle-details");
    const isCollapsed = detailSection.hasClass("collapsed");

    if (isCollapsed) {
      detailSection.removeClass("collapsed");
      toggleButton.html('<i class="fas fa-chevron-up"></i> Sembunyikan Detail');
    } else {
      detailSection.addClass("collapsed");
      toggleButton.html('<i class="fas fa-chevron-down"></i> Tampilkan Detail Lengkap');
    }
  }

  handleCalculatorClick(event) {
    event.stopPropagation();
    this.showNotification("Beralih Page Ke Carbon Calculator...");
  }

  handleLearnMoreClick(event) {
    event.stopPropagation();
    this.showNotification(
      "Anda akan diarahkan ke halaman dengan informasi lebih detail tentang cara mengurangi jejak karbon."
    );
  }

  showNotification(message) {
    alert(message);
  }

  setupScrollAnimations() {
    $(window).on("scroll", () => this.animateOnScroll());
    this.animateOnScroll(); // Initial check
  }

  animateOnScroll() {
    $(".fade-in").each((index, element) => {
      const $element = $(element);
      const elementTop = $element.offset().top;
      const elementBottom = elementTop + $element.outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();

      if (elementBottom > viewportTop && elementTop < viewportBottom) {
        $element.addClass("fade-in");
      }
    });
  }

  handleInitializationError() {
    const errorHtml = `
            <div class="alert alert-danger text-center" role="alert">
                <h4 class="alert-heading">Terjadi Kesalahan</h4>
                <p>Gagal memuat data statistik emisi karbon. Silakan refresh halaman atau coba lagi nanti.</p>
            </div>
        `;
    $(".carbon-card").html(errorHtml);
  }

  getCurrentCategory() {
    return this.categories[this.currentCategory];
  }

  getAvailableCategories() {
    return Object.keys(this.categories);
  }
}

$(document).ready(() => {
  const carbonStatsManager = new CarbonStatsManager();
  carbonStatsManager.initialize();
});
