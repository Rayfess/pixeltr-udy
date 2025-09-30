$(document).ready(function () {
  // Efek scroll pada navbar
  $(window).scroll(function () {
    if ($(window).scrollTop() > 100) {
      $(".navbar").addClass("scrolled");
    } else {
      $(".navbar").removeClass("scrolled");
    }
  });

  // Menutup sidebar saat mengklik item dropdown
  $(".dropdown-item").on("click", function () {
    $(".offcanvas").offcanvas("hide");
  });

  // Mencegah dropdown di sidebar menutup saat diklik
  $(document).on("click", ".offcanvas .dropdown-menu", function (e) {
    e.stopPropagation();
  });

  // Sembunyikan navbar ketika sidebar terbuka
  $("#offcanvasNavbar").on("show.bs.offcanvas", function () {
    $("body").addClass("sidebar-open");
  });

  $("#offcanvasNavbar").on("hide.bs.offcanvas", function () {
    $("body").removeClass("sidebar-open");
  });
});
