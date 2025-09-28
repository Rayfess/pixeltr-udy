$(function () {
  let currentCategory = "home";
  let emissionData = {};
  let treeData = {};
  let totalEmission = 0;
  let treeEquivalent = 0;
  let selectedDonationType = "paket";
  let selectedTreeType = "";
  let selectedPackage = null;

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
      const cost = count * tree.cost;
      const carbonOffset = count * tree.absorption;

      $("#treeCost").text("Rp " + cost.toLocaleString("id-ID"));
      $("#carbonOffset").text(carbonOffset);

      // Update selected donation jika ini adalah donasi yang dipilih
      if (selectedDonationType === "pohon") {
        $("#selectedDescription").text(`${count} Pohon ${tree.name}`);
        $("#selectedAmount").text("Rp " + cost.toLocaleString("id-ID"));
        $("#selectedCO2").text(carbonOffset);
        $("#selectedDonation").removeClass("d-none");
      }
    }
  }

  // Fungsi untuk memperbarui donasi uang
  function updateMoneyDonation() {
    const amount = parseInt($("#amountInput").val()) || 0;
    const carbonEstimate = Math.floor(amount / 10000) * 22; // Setiap Rp 10.000 = 1 pohon = 22 kg CO₂/tahun
    const totalAmount = amount + 2500; // Tambah biaya administrasi

    $("#amountResult").text("Rp " + amount.toLocaleString("id-ID"));
    $("#carbonFromMoney").text(carbonEstimate);
    $("#totalAmount").text("Rp " + totalAmount.toLocaleString("id-ID"));

    if (selectedDonationType === "uang" && amount >= 10000) {
      $("#selectedDescription").text("Donasi Mata Uang");
      $("#selectedAmount").text("Rp " + amount.toLocaleString("id-ID"));
      $("#selectedCO2").text(carbonEstimate);
      $("#selectedDonation").removeClass("d-none");
    } else {
      $("#selectedDonation").addClass("d-none");
      return;
    }
  }

  function updateSelectedDonation() {
    if (selectedPackage) {
      $("#selectedDescription").text(selectedPackage.desc);
      $("#selectedAmount").text("Rp " + selectedPackage.amount.toLocaleString("id-ID"));
      $("#selectedCO2").text(selectedPackage.co2);
      $("#selectedDonation").removeClass("d-none");
    }
  }

  function processDonation() {
    let message = "";

    if (selectedDonationType === "paket") {
      if (!selectedPackage) {
        alert("Silakan pilih paket donasi terlebih dahulu");
        return;
      }
      message = `Terima kasih! Donasi Anda untuk ${
        selectedPackage.desc
      } sebesar Rp ${selectedPackage.amount.toLocaleString("id-ID")} berhasil diproses.`;
    } else if (selectedDonationType === "pohon") {
      if (!selectedTreeType || !treeData[selectedTreeType]) {
        alert("Silakan pilih jenis pohon terlebih dahulu");
        return;
      }
      const count = parseInt($("#treeCount").val()) || 1;
      const tree = treeData[selectedTreeType];
      const cost = count * tree.cost;

      message = `Terima kasih! Donasi Anda untuk ${count} pohon ${
        tree.name
      } sebesar Rp ${cost.toLocaleString("id-ID")} berhasil diproses.`;
    } else if (selectedDonationType === "uang") {
      const amount = parseInt($("#amountInput").val()) || 0;
      if (amount < 10000) {
        alert("Minimum donasi adalah Rp 10.000");
        return;
      }
      message = `Terima kasih! Donasi Anda sebesar Rp ${amount.toLocaleString(
        "id-ID"
      )} berhasil diproses.`;
    }

    alert(message);
    $("#donationModal").modal("hide");

    // Reset form
    $(".donation-card").removeClass("selected");
    $("#selectedDonation").addClass("d-none");
    selectedPackage = null;
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

    const cost = tree.cost * count;

    $("#selectedTree").text(tree.name);
    $("#treeCountResult").text(count);
    $("#carbonOffset").text(carbonAbsorption);
    $("#treeCost").text("Rp " + cost.toLocaleString("id-ID"));
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
