$(document).ready(function () {
  $(".theme-toggle").click(function () {
    $("body").toggleClass("theme-dark theme-light");

    let isDark = $("body").hasClass("theme-dark");
    $(".theme-toggle i").toggleClass("fa-moon fa-sun");
  });
});
