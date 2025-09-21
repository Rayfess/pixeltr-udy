$(function () {
  let currentCategory = "home";
  let emissionData = {};
  let treeData = {};
  let totalEmission = 0;
  let treeEquivalent = 0;

  //  ambil data jenis pohon dsb
  $.getJSON("/data/treedata.json", function (data) {
    treeData = data;
    populateTreeOptions();
    calculateCarbon();
    $("#treeOptions, #treeCount").on("change input", function () {
      calculateCarbon();
    });
  });

  // Inisialisasi tampilan
  if (currentCategory === "transportation") {
    $(".norm").addClass("d-none");
    $(".trnsp").removeClass("d-none");
  } else {
    $(".norm").removeClass("d-none");
    $(".trnsp").addClass("d-none");
  }

  // ambil data emisi
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

    populateUsageTypes();
    updateCategoryDropdown();
  });

  // Kalkulasi emisi awl hlaman
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
    totalEmission = 0;
    let totalTangguhan = 0;

    $("#emission-results tr").each(function () {
      totalEmission += parseFloat($(this).find("td:eq(2)").text());
      totalTangguhan += parseFloat(
        $(this).find("td:eq(3)").text().replace(/\./g, "").replace(",", ".")
      );
    });

    $("#overall-emission").text(totalEmission.toFixed(2) + " KgCO2");
    $("#overall-tangguhan").text("Rp " + totalTangguhan.toLocaleString("id-ID"));
    treeEquivalent = Math.ceil(totalEmission / 70);
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

  // Sistem rating
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

  // Counter
  const targetCount = 1587000;
  const ovcountr = $("#overall-respond");
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
    ovcountr.text(formatNumber(currentCount));
  }

  let counterInterval = setInterval(updateCounter, interval);

  $(".counter-icon").hover(
    function () {
      $(this).css("transform", "scale(1.2)");
    },
    function () {
      $(this).css("transform", "scale(1)");
    }
  );

  // Fungsi untuk alert modal
  function showCarbonAlertModal(message) {
    $("#alertMessageModal").html(message);
    $("#carbonAlertModal").removeClass("d-none").addClass("show");

    setTimeout(function () {
      hideCarbonAlertModal();
    }, 5000);
  }

  function hideCarbonAlertModal() {
    $("#carbonAlertModal").removeClass("show").addClass("d-none");
  }

  $("#closeAlertModal").click(function () {
    hideCarbonAlertModal();
  });

  // Modal donation event
  $("#donationModal").on("shown.bs.modal", function () {
    $("#modalTreeEquivalent").text(treeEquivalent);
    let suggestionMessage;

    if (totalEmission < 100) {
      suggestionMessage =
        "Jejak karbon Anda relatif rendah. Untuk menetralisirnya, kami sarankan menanam <strong>1-2 pohon pinus</strong>.";
    } else if (totalEmission < 300) {
      suggestionMessage =
        "Berdasarkan jejak karbon Anda, kami merekomendasikan untuk menanam <strong>" +
        treeEquivalent +
        " pohon beringin</strong> untuk menetralisirnya.";
    } else {
      suggestionMessage =
        "Jejak karbon Anda cukup signifikan. Kami sarankan paket <strong>10 pohon beringin</strong> atau dukungan <strong>energi terbarukan</strong> untuk menetralisirnya.";
    }

    showCarbonAlertModal(suggestionMessage);
  });

  // Toggle antara fixed dan custom donation
  $("#fixedDonationBtn").click(function () {
    $(this).addClass("active");
    $("#customDonationSection").addClass("d-none");
    $("#selectedDonation").addClass("d-none");
    $("#customDonationBtn").removeClass("active");
    $("#fixedDonationSection").removeClass("d-none");
  });

  $("#customDonationBtn").click(function () {
    $(this).addClass("active");
    $("#fixedDonationBtn").removeClass("active");
    $("#fixedDonationSection").addClass("d-none");
    $("#customDonationSection").removeClass("d-none");
    $("#selectedDonation").addClass("d-none");
  });

  $("#treeCount").on("input", function () {
    updateTreeCost();
  });

  function updateTreeCost() {
    const count = parseInt($("#treeCount").val()) || 1;
    const absorptionRate = parseInt($("#treeOptions").val()) || 70;

    const cost = count * treeData.cost;
    carbonOffset = count * absorptionRate;

    $("#treeCost").text("Rp " + cost.toLocaleString("id-ID"));
    $("#carbonOffset").text(carbonOffset);
  }

  // Pilih donasi
  $(".select-donation").click(function () {
    $(".donation-card").removeClass("selected");
    $(this).closest(".donation-card").addClass("selected");

    const amount = $(this).data("amount");
    const desc = $(this).data("desc");
    const co2 = $(this).data("co2");

    $("#selectedDescription").text(desc);
    $("#selectedAmount").text("Rp " + amount.toLocaleString("id-ID"));
    $("#selectedCO2").text(co2);
    $("#selectedDonation").removeClass("d-none");
  });

  // Tombol donasi sekarang
  $("#donateNowBtn").click(function () {
    const isCustom = $("#customDonationBtn").hasClass("active");

    if (isCustom) {
      const treeType = $("#treeOptions option:selected").text();
      const treeCount = parseInt($("#treeCountResult").val()) || 0;

      alert(
        "Terima kasih! Donasi custom Anda sebesar Rp " +
          treeCount.toLocaleString("id-ID") +
          " untuk " +
          treeType +
          " berhasil diproses."
      );
      if ($("#treeOptions").val() === "tree") {
        // const amount = parseInt($("#treeCount").val()) * treeData.cost;
        // const treeType = $("#treeOptions select").val();
      } else {
        const carbonAmount = parseFloat($("#overall-emission").val()) || 0;
        const amount = carbonAmount * 500;

        alert(
          "Terima kasih! Donasi custom Anda sebesar Rp " +
            amount.toLocaleString("id-ID") +
            " untuk " +
            type +
            " berhasil diproses."
        );
      }
    } else {
      if (!$(".donation-card").hasClass("selected")) {
        alert("Silakan pilih paket donasi terlebih dahulu");
        return;
      }

      const amount = $(".donation-card.selected").find(".select-donation").data("amount");
      const desc = $(".donation-card.selected").find(".select-donation").data("desc");

      alert(
        "Terima kasih! Donasi Anda untuk " +
          desc +
          " sebesar Rp " +
          amount.toLocaleString("id-ID") +
          " berhasil diproses."
      );
    }

    $("#donationModal").modal("d-none");
    $(".donation-card").removeClass("selected");
    $("#selectedDonation").addClass("d-none");
  });

  //

  function populateTreeOptions() {
    const treeOpts = $("#treeOptions");
    treeOpts.empty();

    Object.keys(treeData).forEach((key) => {
      const tree = treeData[key];
      treeOpts.append(new Option(tree.name, key));
    });

    if (Object.keys(treeData).length > 0) {
      treeOpts.val(Object.keys(treeData)[0]);
    }
  }

  // calcu carbon btnDonasiSekarang
  function calculateCarbon() {
    const treeType = $("#treeOptions").val();

    if (!treeType || !treeData[treeType]) return;

    const count = parseInt($("#treeCount").val()) || 1;
    const tree = treeData[treeType];

    const carbonAbsorption = Math.round(tree.absorption * count);

    const cost = tree.cost * count;

    $("#selectedTree").text(tree.name);
    $("#treeCountResult").text(count);
    $("#carbonOffset").text(carbonAbsorption);
    $("#treeCost").text("Rp " + cost.toLocaleString("id-ID"));
    $("#growthTime").text(tree.growth);

    updateTreeDetails(treeType);
  }

  function updateTreeDetails(treeType) {
    const tree = treeData[treeType];
    $("#treeDetails").html(`
                <p class="mb-1 fw-medium text-secondary fs-5 mt-3 "><i>${tree.name}</i></p>
                <p class="mb-1 ">Penyerapan karbon: <strong>${
                  tree.absorption
                } kg CO₂/tahun per pohon</strong></p>
                <p class="mb-1 ">Biaya per pohon: <strong>Rp ${tree.cost.toLocaleString(
                  "id-ID"
                )}</strong></p>
                <p class="mb-1 ">Waktu tumbuh: <strong>${tree.growth}</strong></p>
                <p class="mb-0 mt-2 fw-medium fst-italic">${tree.details}</p>
            `);

    $("#treeImage").attr("src", tree.image);

    $("#treeImage").on("mouseenter", function () {
      $(this).closest(".tree-details").find(".hover-instruction").addClass("hidden");
    });

    $("#treeImage").on("mouseleave", function () {
      $(this).closest(".tree-details").find(".hover-instruction").removeClass("hidden");
    });
  }
});
