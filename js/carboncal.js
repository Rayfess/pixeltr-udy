$(".category-opt").click(function (e) {
  e.preventDefault();

  // Remove active class from all options
  $(".category-opt").removeClass("active");

  // Add active class to clicked option
  $(this).addClass("active");

  // Update current category
  currentCategory = $(this).data("category");

  // Update dropdown button text and icon
  updateCategoryButton();
});

function updateCategoryButton() {
  let categoryText, badgeClass, iconClass;

  switch (currentCategory) {
    case "home":
      categoryText = "Home";
      badgeClass = "home-badge";
      iconClass = "fa-solid fa-house me-1";
      break;
    case "transport":
      categoryText = "Transport";
      badgeClass = "transport-badge";
      iconClass = "fa-solid fa-car me-1";
      break;
    case "food":
      categoryText = "Food";
      badgeClass = "food-badge";
      iconClass = "fa-solid fa-utensils me-1";
      break;
  }

  // Update button content
  $("#categoryDropdownBtn").html(`
                    <span class="category-badge ${badgeClass}">
                        <i class="${iconClass}"></i>
                    </span>
                    ${categoryText}
                `);

  // Update current category text
  $(".current-category").text(categoryText);
}
