$(function () {
  const adminFee = 2500;
  let currentCategory = "home";
  let emissionData = {};
  let treeData = {};
  let totalEmission = 0;
  let treeEquivalent = 0;
  let selectedDonationType = "paket";
  let selectedTreeType = "";
  let selectedPackage = null;
  let selectedVehicle = null;

  //  ambil data jenis pohon dsb
  $.getJSON("/data/treedata.json", function (data) {
    treeData = data;
    populateTreeOptions();
    calculateCarbon();

    if (Object.keys(treeData).length > 0) {
      selectedTreeType = $("#treeOptions").val();
    }

    $("#treeOptions").on("change", function () {
      selectedTreeType = $(this).val();
      calculateCarbon();
      updateTreeDetails();
    });

    $("#treeCount").on("input", function () {
      calculateCarbon();
    });
  });

  // ambil data emisi
  $.getJSON("/data/emisi.json", function (data) {
    emissionData = data;
    populateUsageTypes();
    initVehicleSelection();
  });

  // Inisialisasi tampilan
  if (currentCategory === "transportation") {
    $(".norm").addClass("d-none");
    $(".trnsp").removeClass("d-none");
  } else {
    $(".norm").removeClass("d-none");
    $(".trnsp").addClass("d-none");
  }

  function populateUsageTypes() {
    const types = Object.keys(emissionData[currentCategory].emtype);
    $("#usage-type").empty();
    types.forEach((t) => {
      $("#usage-type").append(new Option(t, t));
    });
    updateUnits();
  }

  $("#usage-type").on("change", updateUnits);
  function updateUnits() {
    const type = $("#usage-type").val();
    const units = Object.keys(emissionData[currentCategory].emtype[type]);
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

      // Validasi input
      if (isNaN(distance) || distance <= 0) {
        alert("Masukkan jarak tempuh yang valid");
        return;
      }

      if (!selectedVehicle) {
        alert("Pilih jenis kendaraan terlebih dahulu");
        return;
      }

      // Kalkulasi emisi
      const efficiency = selectedVehicle.efficiency;
      const fuelUsed = distance / efficiency;

      const fuelType = $("#usage-type").val();
      const emissionFactor = emissionData.transportation.emtype[fuelType].liter;

      emission = fuelUsed * emissionFactor;
      tangguhan = Math.round(emission * 2000); // Carbon price Rp 2.000/kg CO2

      row = `
    <tr>
      <td>${selectedVehicle.name}</td>
      <td>${distance} km | ${fuelUsed.toFixed(2)} L</td>
      <td>${emission.toFixed(2)}</td>
      <td>Rp ${tangguhan.toLocaleString("id-ID")}</td>
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

      const factor = emissionData[currentCategory].emtype[type][unit];
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
      totalEmission += parseFloat($(this).find("td:eq(2)").text()) || 0;
      let tangguhanText = $(this).find("td:eq(3)").text();

      // Hapus semua karakter non-digit kecuali angka
      let cleanTangguhan = tangguhanText.replace(/[^\d]/g, "");

      totalTangguhan += parseInt(cleanTangguhan) || 0;
    });

    $("#overall-emission").text(totalEmission.toFixed(2) + " KgCO2");
    $("#overall-tangguhan").text("Rp " + totalTangguhan.toLocaleString("id-ID"));
    treeEquivalent = Math.ceil(totalEmission / 70);
  }

  $("#btn-reset").on("click", function () {
    $("#carbon-form")[0].reset();
    $("#emission-results").empty();
    $(".vehicle-card").removeClass("selected");
    $("#selected-vehicle-display").hide();
    selectedVehicle = null;
    updateTotals();
  });

  function cleanupDonate() {
    $("#carbon-form")[0].reset();
    $("#emission-results").empty();
    $(".vehicle-card").removeClass("selected");
    $("#selected-vehicle-display").hide();
    $(".donation-card").removeClass("selected");
    $("#selectedDonation").addClass("d-none");
    selectedPackage = null;
    selectedVehicle = null;
    updateTotals();
  }

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
    });
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

  // Toggle jenis donasi
  $("#paketDonationBtn").click(function () {
    selectDonationType("paket");
  });

  $("#pohonDonationBtn").click(function () {
    selectDonationType("pohon");
  });

  $("#uangDonationBtn").click(function () {
    selectDonationType("uang");
  });

  // Event listener untuk perubahan jenis pohon
  $("#treeOptions").change(function () {
    updateTreeDetails();
  });

  // Event listener untuk perubahan jumlah pohon
  $("#treeCount").on("input", function () {
    updateTreeCost();
  });

  // Event listener untuk perubahan jumlah uang
  $("#amountInput").on("input", function () {
    updateMoneyDonation();
  });

  function updateTreeCost() {
    const count = parseInt($("#treeCount").val()) || 1;
    const absorptionRate = parseInt($("#treeOptions").val()) || 70;

    const cost = count * treeData.cost;
    carbonOffset = count * absorptionRate;

    $("#treeCost").text("Rp " + cost.toLocaleString("id-ID"));
    $("#carbonOffset").text(carbonOffset);
  }

  // Pilih Donasi, Event listener untuk pemilihan paket donasi
  $(".select-donation").click(function () {
    $(".donation-card").removeClass("selected");
    $(this).closest(".donation-card").addClass("selected");

    selectedPackage = {
      amount: $(this).data("amount"),
      desc: $(this).data("desc"),
      co2: $(this).data("co2"),
    };

    updateSelectedDonation();
  });

  // Tombol donasi sekarang
  $("#donateNowBtn").click(function () {
    processDonation();
  });

  // Fungsi untuk memilih jenis donasi
  function selectDonationType(type) {
    selectedDonationType = type;

    // Update tampilan tombol
    $(".donation-type").removeClass("active");
    $(`#${type}DonationBtn`).addClass("active");

    // Tampilkan section yang sesuai
    $("#paketDonationSection, #pohonDonationSection, #uangDonationSection").addClass("d-none");
    $(`#${type}DonationSection`).removeClass("d-none");

    // Reset pilihan donasi
    $("#selectedDonation").addClass("d-none");
    selectedPackage = null;
  }

  // Fungsi untuk memperbarui detail pohon
  function updateTreeDetails() {
    const treeType = $("#treeOptions").val();
    selectedTreeType = treeType;

    if (treeType && treeData[treeType]) {
      const tree = treeData[treeType];
      $("#treeDetails").html(`
                    <p><strong>Penyerapan Karbon:</strong> ${tree.absorption} kg CO₂/tahun</p>
                    <p><strong>Biaya per Pohon:</strong> Rp ${tree.cost.toLocaleString("id-ID")}</p>
                    <p><strong>Waktu Tumbuh:</strong> ${tree.growth}</p>
                    <p>${tree.details}</p>
                `);
      $("#treeImage").attr("src", tree.image);
      $("#selectedTree").text(tree.name);
      $("#growthTime").text(tree.growth);

      updateTreeCost();
    } else {
      $("#treeDetails").text("Pilih jenis pohon untuk melihat detail");
      $("#treeImage").attr("src", "");
      $("#selectedTree").text("-");
      $("#growthTime").text("-");
    }
  }

  // Fungsi untuk memperbarui biaya pohon
  function updateTreeCost() {
    const count = parseInt($("#treeCount").val()) || 1;
    $("#treeCountResult").text(count);

    if (selectedTreeType && treeData[selectedTreeType]) {
      const tree = treeData[selectedTreeType];
      const baseCost = count * tree.cost + 2500;
      const plantingCareCost = count * 10000; // Biaya penanaman & perawatan Rp 2.500 per pohon
      const totalCost = baseCost + plantingCareCost;
      const carbonOffset = count * tree.absorption;

      $("#carbonOffset").text(carbonOffset);

      // Update selected donation jika ini adalah donasi yang dipilih
      if (selectedDonationType === "pohon") {
        $("#selectedDescription").text(`${count} Pohon ${tree.name}`);
        $("#selectedAmount").html(`
                Rp ${totalCost.toLocaleString("id-ID")}
                <small class="d-block text-muted">Termasuk biaya penanaman & perawatan</small>
            `);
        $("#selectedCO2").text(carbonOffset);
        $("#selectedDonation").removeClass("d-none");
      }
    }
  }

  // Fungsi untuk memperbarui donasi uang
  function updateMoneyDonation() {
    const amount = parseInt($("#amountInput").val()) || 0;
    const carbonEstimate = Math.floor(amount / 10000) * 22;

    const totalAmount = amount + adminFee;
    $("#amountResult").text("Rp " + amount.toLocaleString("id-ID"));
    $("#carbonFromMoney").text(carbonEstimate);

    $("#amountResult").html(`
        Rp ${amount.toLocaleString("id-ID")}
        <small class="d-block text-muted">+ Biaya admin: Rp ${adminFee.toLocaleString(
          "id-ID"
        )}</small>
    `);

    $("#totalAmount").text("Rp " + totalAmount.toLocaleString("id-ID"));

    if (selectedDonationType === "uang" && amount >= 10000) {
      $("#selectedDescription").text("Donasi Mata Uang");
      $("#selectedAmount").html(`
            Rp ${totalAmount.toLocaleString("id-ID")}
            <small class="d-block text-muted">Termasuk biaya administrasi</small>
        `);
      $("#selectedCO2").text(carbonEstimate);
      $("#selectedDonation").removeClass("d-none");
      $(".pkarbon").addClass("d-none");
    } else {
      $("#selectedDonation").addClass("d-none");
      return;
    }
  }

  function updateSelectedDonation() {
    if (selectedPackage) {
      const totalAmount = selectedPackage.amount + adminFee;

      $("#selectedDescription").text(selectedPackage.desc);
      $("#selectedAmount").html(`
            Rp ${totalAmount.toLocaleString("id-ID")}
            <small class="d-block text-muted">Termasuk biaya administrasi</small>
        `);
      $("#selectedCO2").text(selectedPackage.co2);
      $(".pkarbon").addClass("d-none");
      $("#selectedDonation").removeClass("d-none");
    }
  }

  function processDonation() {
    let message = "";
    let totalAmount = 0;

    if (selectedDonationType === "paket") {
      if (!selectedPackage) {
        alert("Silakan pilih paket donasi terlebih dahulu");
        return;
      }
      totalAmount = selectedPackage.amount + adminFee;
      message = `Terima kasih! Donasi Anda untuk ${
        selectedPackage.desc
      } sebesar Rp ${totalAmount.toLocaleString(
        "id-ID"
      )} (termasuk biaya administrasi) berhasil diproses.`;
    } else if (selectedDonationType === "pohon") {
      if (!selectedTreeType || !treeData[selectedTreeType]) {
        alert("Silakan pilih jenis pohon terlebih dahulu");
        return;
      }
      const count = parseInt($("#treeCount").val()) || 1;
      const tree = treeData[selectedTreeType];
      const baseCost = count * tree.cost + 2500;
      const plantingCareCost = count * 10000; // Biaya penanaman & perawatan Rp 2.500 per pohon
      const totalCost = baseCost + plantingCareCost;

      message = `Terima kasih! Donasi Anda untuk ${count} pohon ${
        tree.name
      } sebesar Rp ${totalCost.toLocaleString(
        "id-ID"
      )} (termasuk biaya penanaman & perawatan) berhasil diproses.`;
    } else if (selectedDonationType === "uang") {
      const amount = parseInt($("#amountInput").val()) || 0;
      if (amount < 10000) {
        alert("Minimum donasi adalah Rp 10.000");
        return;
      }
      totalAmount = amount + adminFee;
      message = `Terima kasih! Donasi Anda sebesar Rp ${totalAmount.toLocaleString(
        "id-ID"
      )} (termasuk biaya administrasi) berhasil diproses.`;
    }

    alert(message);
    $("#donationModal").modal("hide");

    // Reset form after DOnate
    cleanupDonate();
  }

  // treetree

  function populateTreeOptions() {
    const treeOpts = $("#treeOptions");
    treeOpts.empty();

    Object.keys(treeData).forEach((key) => {
      const tree = treeData[key];
      treeOpts.append(new Option(tree.name, key));
    });

    if (Object.keys(treeData).length > 0) {
      const firstKey = Object.keys(treeData)[0];
      treeOpts.val(firstKey);
      selectedTreeType = firstKey;
    }
  }

  // calcu carbon btnDonasiSekarang
  function calculateCarbon() {
    const treeType = selectedTreeType;

    if (!treeType || !treeData[treeType]) return;

    const count = parseInt($("#treeCount").val()) || 1;
    const tree = treeData[treeType];

    const carbonAbsorption = Math.round(tree.absorption * count);

    const baseCost = count * tree.cost + 2500; // Biaya Admin
    const plantingCareCost = count * 10000; // Biaya penanaman & perawatan Rp 2.500 per pohon
    const totalCost = baseCost + plantingCareCost;

    $("#selectedTree").text(tree.name);
    $("#treeCountResult").text(count);
    $("#carbonOffset").text(carbonAbsorption);
    $("#treeCost").text("Rp " + baseCost.toLocaleString("id-ID"));
    $("#totalCost").text("Rp " + totalCost.toLocaleString("id-ID"));
    $("#growthTime").text(tree.growth);

    updateTreeDetails();
  }

  function updateTreeDetails() {
    const treeType = selectedTreeType;
    if (treeType && treeData[treeType]) {
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
    } else {
      $("#treeDetails").html("<p class='text-muted'>Pilih jenis pohon untuk melihat detail</p>");
      $("#treeImage").attr("src", "");
    }
  }

  function initVehicleSelection() {
    $(".vehicle-card").on("click", function () {
      $(".vehicle-card").removeClass("selected");
      $(this).addClass("selected");

      const vehicleType = $(this).data("type");
      selectedVehicle = emissionData.transportation.emfactor[vehicleType];

      // Update input tersembunyi
      $("#efficiency").val(selectedVehicle.efficiency);
      $("#selected-vehicle-type").val(vehicleType);

      updateSelectedVehicleDisplay();
    });

    $("#vehicleTabs button").on("click", function () {
      // Reset pilihan saat ganti tab
      $(".vehicle-card").removeClass("selected");
      selectedVehicle = null;
      $("#selected-vehicle-display").hide();
    });
  }

  function updateSelectedVehicleDisplay() {
    if (selectedVehicle) {
      $("#selected-vehicle-text").text(selectedVehicle.name);
      $("#selected-efficiency-text").text(selectedVehicle.efficiency + " km/L");
      $("#selected-vehicle-desc").text(selectedVehicle.description);
      $("#selected-vehicle-display").show();
    }
  }
});
