$(function () {
  let currentCategory = "home";
  let emissionData = {};

  if (currentCategory === "transportation") {
    $(".norm").addClass("d-none");
    $(".trnsp").removeClass("d-none");
  } else {
    $(".norm").removeClass("d-none");
    $(".trnsp").addClass("d-none");
  }

  $.getJSON("/data/emisi.json", function (data) {
    emissionData = data;
    populateUsageTypes();
  });

  function populateUsageTypes() {
    const types = Object.keys(emissionData[currentCategory].type);
    $("#usage-type").empty();
    types.forEach((t) => {
      $("#usage-type").append(new Option(t, t));
    });
    updateUnits();
  }

  $("#usage-type").on("change", updateUnits);
  function updateUnits() {
    const type = $("#usage-type").val();
    const units = Object.keys(emissionData[currentCategory].type[type]);
    $("#unit").empty();
    units.forEach((u) => {
      $("#unit").append(new Option(u, u));
    });
  }

  $(".category-opt").on("click", function () {
    $(".category-opt").removeClass("active");
    $(this).addClass("active");

    currentCategory = $(this).data("category");

    if (currentCategory === "transportation") {
      $(".norm").addClass("d-none");
      $(".trnsp").removeClass("d-none");
    } else {
      $(".norm").removeClass("d-none");
      $(".trnsp").addClass("d-none");
    }

    $(".current-category").text;
    populateUsageTypes();
    updateCategoryDropdown();
  });

  $("#btn-calc").on("click", function () {
    $(".card-show").removeClass("d-none");

    const type = $("#usage-type").val();

    let emission = 0;
    let tangguhan = 0;
    let row = "";

    if (currentCategory === "transportation") {
      const distance = parseFloat($("#distance").val());
      const efficiency = parseFloat($("#efficiency").val());

      if (isNaN(distance) || distance <= 0 || isNaN(efficiency) || efficiency <= 0) {
        $(".card-show").addClass("d-none");
        alert("Masukkan jarak dan efisiensi yang valid");
        return;
      }

      const factor = 2.31;
      const fuelUsed = distance / efficiency;
      emission = fuelUsed * factor;
      tangguhan = emission * 2000;

      row = `
      <tr>
        <td>${type}</td>
        <td>${distance} km || ${efficiency} km/l</td>
        <td>${emission.toFixed(2)}</td>
        <td>${tangguhan.toLocaleString("id-ID")}</td>
        <td><button class="btn btn-sm btn-danger btn-remove"><i class="ri-delete-bin-line"></i></button></td>
      </tr>`;
    } else {
      const amount = parseFloat($("#amount").val());
      const unit = $("#unit").val();
      const freq = $("#frequency").val();

      if (isNaN(amount) || amount <= 0) {
        $(".card-show").addClass("d-none");
        alert("Masukkan jumlah yang valid");
        return;
      }

      const factor = emissionData[currentCategory].type[type][unit];
      const multiplier = { harian: 365, mingguan: 52, bulanan: 12, tahunan: 1 }[freq];

      emission = amount * factor * multiplier;
      tangguhan = emission * 2000;

      row = `
      <tr>
        <td>${type}</td>
        <td>${amount} ${unit} / ${freq}</td>
        <td>${emission.toFixed(2)}</td>
        <td>${tangguhan.toLocaleString("id-ID")}</td>
        <td><button class="btn btn-sm btn-danger btn-remove"><i class="ri-delete-bin-line"></i></button></td>
      </tr>`;
    }

    $("#emission-results").append(row);
    updateTotals();
  });

  $(document).on("click", ".btn-remove", function () {
    $(this).closest("tr").remove();
    updateTotals();
  });

  function updateTotals() {
    let totalEmission = 0,
      totalTangguhan = 0;
    $("#emission-results tr").each(function () {
      totalEmission += parseFloat($(this).find("td:eq(2)").text());
      totalTangguhan += parseFloat(
        $(this).find("td:eq(3)").text().replace(/\./g, "").replace(",", ".")
      );
    });

    $("#overall-emission").text(totalEmission.toFixed(2) + " KgCO2");
    $("#overall-tangguhan").text(totalTangguhan.toLocaleString("id-ID") + " IDR");
  }

  $("#btn-reset").on("click", function () {
    $("#carbon-form")[0].reset();
    $("#emission-results").empty();
    updateTotals();
  });

  function updateCategoryDropdown() {
    const { title, icon } = emissionData[currentCategory];
    $("#categoryDropdownBtn").html(`
    <span>
      <i class="${icon} me-1"></i>
    </span>
    <span class="current-category fw-medium"> ${title} </span>
`);
  }

  function setRating(index) {
    $(".rating-btn i").removeClass("active-1 active-2 active-3 active-4 active-5");
    $(".rating-btn i").each(function (i) {
      if (i <= index) {
        $(this).addClass("active-" + (i + 1));
      }
    });
  }

  $(".rating-btn").on("click", function () {
    let index = $(this).index();
    setRating(index);
  });

  $(".rating-btn").hover(function () {
    let index = $(this).index();
    $(".rating-btn i").removeClass("active-1 active-2 active-3 active-4 active-5");
    $(".rating-btn i").each(function (i) {
      if (i <= index) {
        $(this).addClass("active-" + (i + 1));
      }
    });
  });

  const targetCount = 1587000;
  const $counter = $("#overall-respond");
  const duration = 4000;
  const interval = 20;
  const increment = targetCount / (duration / interval);

  let currentCount = 0;

  function formatNumber(num) {
    return Math.floor(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function updateCounter() {
    currentCount += increment;

    if (currentCount >= targetCount) {
      currentCount = targetCount;
    }

    $counter.text(formatNumber(currentCount));
  }

  let counterInterval = setInterval(updateCounter, interval);

  $("#reset-btn").click(function () {
    clearInterval(counterInterval);
    currentCount = 0;

    $counter.text("0");
  });

  $(".counter-icon").hover(
    function () {
      $(this).css("transform", "scale(1.2)");
    },
    function () {
      $(this).css("transform", "scale(1)");
    }
  );
});
