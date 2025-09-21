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
