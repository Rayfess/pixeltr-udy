$(document).ready(function () {
  function checkScroll() {
    $(".section-anim").each(function () {
      var elemTop = $(this).offset().top;
      var windowBottom = $(window).scrollTop() + $(window).height();

      if (elemTop < windowBottom - 100) {
        $(this).addClass("show");
      }
    });
  }

  // cek saat load + saat scroll
  checkScroll();
  $(window).on("scroll", checkScroll);
});
