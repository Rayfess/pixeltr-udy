$(document).ready(function () {
  function animateFooter() {
    $(".animate-footer").each(function () {
      const position = $(this).offset().top;
      const scroll = $(window).scrollTop();
      const windowHeight = $(window).height();

      if (scroll + windowHeight - 100 > position) {
        $(this).addClass("visible");
      }
    });
  }
  animateFooter();
  $(window).on("scroll", animateFooter);

  // subs validation
  $("form").on("submit", function (e) {
    e.preventDefault();
    const email = $(this).find("input[type='email']").val().trim();
    if (!email) {
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
});
